"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EmissionSource } from "@prisma/client";
import { calculateDepartmentScores } from "@/lib/esgEngine";

export async function getEmissionsData() {
  const transactions = await prisma.carbonTransaction.findMany({
    orderBy: { date: "desc" },
    include: { department: true },
  });

  const factors = await prisma.emissionFactor.findMany();

  // Aggregate by source
  const sourceAggregate: Record<string, number> = {};
  let totalEmissions = 0;
  transactions.forEach(t => {
    const src = t.source.toLowerCase();
    const sourceKey = src.charAt(0).toUpperCase() + src.slice(1);
    sourceAggregate[sourceKey] = (sourceAggregate[sourceKey] || 0) + t.co2eKg / 1000.0; // convert to tons
    totalEmissions += t.co2eKg / 1000.0;
  });

  const emissionsBySource = Object.entries(sourceAggregate).map(([name, value]) => ({
    name,
    value: Math.round(value * 10) / 10,
    color: name === "Fleet" ? "#f43f5e" : name === "Manufacturing" ? "#f59e0b" : name === "Energy" ? "#8b5cf6" : name === "Purchase" ? "#06b6d4" : "#10b981",
  }));

  // Aggregate by month (e.g. Scope 1 / 2 / 3 breakdown)
  const monthlyAggregate: Record<string, { scope1: number; scope2: number; scope3: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize last few months
  const currentMonth = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonth - i + 12) % 12;
    monthlyAggregate[months[idx]] = { scope1: 0, scope2: 0, scope3: 0 };
  }

  transactions.forEach(t => {
    const m = months[new Date(t.date).getMonth()];
    if (monthlyAggregate[m]) {
      // Scope mapping logic
      if (t.source === EmissionSource.FLEET || t.source === EmissionSource.MANUFACTURING) {
        monthlyAggregate[m].scope1 += t.co2eKg / 1000.0;
      } else if (t.source === EmissionSource.ENERGY) {
        monthlyAggregate[m].scope2 += t.co2eKg / 1000.0;
      } else {
        monthlyAggregate[m].scope3 += t.co2eKg / 1000.0;
      }
    }
  });

  const monthlyData = Object.entries(monthlyAggregate).map(([month, scopes]) => ({
    month,
    scope1: Math.round(scopes.scope1 * 10) / 10,
    scope2: Math.round(scopes.scope2 * 10) / 10,
    scope3: Math.round(scopes.scope3 * 10) / 10,
  }));

  return {
    transactions: transactions.map(t => ({
      id: t.id,
      source: t.source,
      dept: t.department?.name || "Operations",
      co2: `${(t.co2eKg / 1000.0).toFixed(1)} tCO₂e`,
      date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      auto: t.autoCalculated,
    })),
    emissionsBySource: emissionsBySource.length > 0 ? emissionsBySource : [
      { name: "Fleet", value: 35, color: "#f43f5e" },
      { name: "Manufacturing", value: 28, color: "#f59e0b" },
      { name: "Energy", value: 20, color: "#8b5cf6" },
      { name: "Purchase", value: 12, color: "#06b6d4" },
      { name: "Other", value: 5, color: "#10b981" },
    ],
    monthlyData: monthlyData.length > 0 ? monthlyData : [
      { month: "Jan", scope1: 180, scope2: 120, scope3: 200 },
      { month: "Feb", scope1: 160, scope2: 115, scope3: 185 },
      { month: "Mar", scope1: 140, scope2: 108, scope3: 170 },
      { month: "Apr", scope1: 155, scope2: 100, scope3: 160 },
      { month: "May", scope1: 130, scope2: 95, scope3: 150 },
      { month: "Jun", scope1: 120, scope2: 88, scope3: 142 },
      { month: "Jul", scope1: 110, scope2: 82, scope3: 135 },
    ],
    totalEmissions: Math.round(totalEmissions),
  };
}

export async function logEmissionTransaction(data: {
  source: EmissionSource;
  departmentId?: string;
  emissionFactorId?: string;
  quantity: number;
  unit: string;
  description?: string;
  co2eKg?: number;
}) {
  const settings = await prisma.appSettings.findFirst();
  let co2e = data.co2eKg || 0;
  let autoCalculated = false;

  if (settings?.autoEmissionCalculation && data.emissionFactorId) {
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: data.emissionFactorId },
    });
    if (factor) {
      co2e = data.quantity * factor.factor;
      autoCalculated = true;
    }
  }

  const transaction = await prisma.carbonTransaction.create({
    data: {
      source: data.source,
      departmentId: data.departmentId,
      emissionFactorId: data.emissionFactorId,
      quantity: data.quantity,
      unit: data.unit,
      co2eKg: co2e,
      description: data.description,
      autoCalculated,
    },
  });

  // Revalidate & recalculate
  if (data.departmentId) {
    await calculateDepartmentScores(data.departmentId, "Q2-2026");
  }

  revalidatePath("/environmental");
  revalidatePath("/dashboard");
  return transaction;
}

export async function getEnvironmentalGoals() {
  return prisma.environmentalGoal.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function addEnvironmentalGoal(data: {
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  category: string;
  departmentId?: string;
}) {
  const goal = await prisma.environmentalGoal.create({
    data,
  });
  revalidatePath("/environmental");
  return goal;
}

export async function getEmissionFactors() {
  return prisma.emissionFactor.findMany();
}

export async function addEmissionFactor(data: {
  name: string;
  category: string;
  unit: string;
  factor: number;
  source?: string;
  description?: string;
}) {
  const factor = await prisma.emissionFactor.create({
    data,
  });
  revalidatePath("/environmental");
  return factor;
}
