"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Leaf, Plus, Target, TrendingDown, Flame } from "lucide-react";

const emissionsBySource = [
  { name: "Fleet", value: 35, color: "#f43f5e" },
  { name: "Manufacturing", value: 28, color: "#f59e0b" },
  { name: "Energy", value: 20, color: "#8b5cf6" },
  { name: "Purchases", value: 12, color: "#06b6d4" },
  { name: "Other", value: 5, color: "#10b981" },
];

const monthlyData = [
  { month: "Jan", scope1: 180, scope2: 120, scope3: 200 },
  { month: "Feb", scope1: 160, scope2: 115, scope3: 185 },
  { month: "Mar", scope1: 140, scope2: 108, scope3: 170 },
  { month: "Apr", scope1: 155, scope2: 100, scope3: 160 },
  { month: "May", scope1: 130, scope2: 95, scope3: 150 },
  { month: "Jun", scope1: 120, scope2: 88, scope3: 142 },
  { month: "Jul", scope1: 110, scope2: 82, scope3: 135 },
];

const goals = [
  { title: "Reduce Fleet Emissions", current: 65, target: 100, unit: "tCO₂e saved", deadline: "Dec 2026", status: "on_track" },
  { title: "100% Renewable Energy", current: 42, target: 100, unit: "% renewable", deadline: "Mar 2027", status: "at_risk" },
  { title: "Zero Waste Manufacturing", current: 78, target: 100, unit: "% waste diverted", deadline: "Sep 2026", status: "on_track" },
];

const transactions = [
  { id: 1, source: "Fleet", dept: "Operations", co2: "24.5 tCO₂e", date: "Jul 10", auto: true },
  { id: 2, source: "Manufacturing", dept: "Production", co2: "18.2 tCO₂e", date: "Jul 9", auto: true },
  { id: 3, source: "Energy", dept: "HQ", co2: "12.8 tCO₂e", date: "Jul 8", auto: false },
  { id: 4, source: "Travel", dept: "Sales", co2: "6.4 tCO₂e", date: "Jul 7", auto: false },
  { id: 5, source: "Purchase", dept: "Procurement", co2: "4.1 tCO₂e", date: "Jul 6", auto: true },
];

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "goals" | "factors">("overview");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-emerald">🌱 Environmental</h1>
          <p className="text-sm text-muted mt-1">Carbon accounting, emission tracking & sustainability goals</p>
        </div>
        <button className="btn-emerald px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={15} />
          Log Emission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Emissions", value: "2,340", unit: "tCO₂e", icon: <Flame size={16} className="text-rose-400" />, color: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.2)" },
          { label: "vs Last Quarter", value: "-12%", unit: "reduction", icon: <TrendingDown size={16} className="text-emerald-400" />, color: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
          { label: "Goals On Track", value: "2", unit: "of 3", icon: <Target size={16} className="text-cyan-400" />, color: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Emission Factors", value: "24", unit: "configured", icon: <Leaf size={16} className="text-amber-400" />, color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
            style={{ background: s.color, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted">{s.label}</span></div>
            <p className="font-orbitron text-xl font-bold text-slate-100">{s.value} <span className="text-xs font-normal text-muted">{s.unit}</span></p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["overview", "transactions", "goals", "factors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              activeTab === tab ? "bg-emerald-500 text-white shadow-lg" : "text-muted hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Scope chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="xl:col-span-2 glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Scope 1 / 2 / 3 Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  {[["s1", "#f43f5e"], ["s2", "#f59e0b"], ["s3", "#8b5cf6"]].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Area type="monotone" dataKey="scope1" name="Scope 1" stroke="#f43f5e" fill="url(#s1)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" name="Scope 2" stroke="#f59e0b" fill="url(#s2)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope3" name="Scope 3" stroke="#8b5cf6" fill="url(#s3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie by source */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">By Emission Source</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={emissionsBySource} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {emissionsBySource.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {emissionsBySource.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span className="text-muted">{e.name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{e.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "transactions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Carbon Transactions</h3>
            <button className="btn-emerald px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
              <Plus size={12} /> Add Transaction
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th><th>Department</th><th>CO₂e</th><th>Date</th><th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-slate-200">{t.source}</td>
                  <td className="text-muted">{t.dept}</td>
                  <td><span className="text-rose-400 font-orbitron text-xs">{t.co2}</span></td>
                  <td className="text-muted">{t.date}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.auto ? "badge-emerald" : "badge-cyan"}`}>
                      {t.auto ? "Auto" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === "goals" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {goals.map((goal, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-200">{goal.title}</h3>
                  <p className="text-xs text-muted mt-0.5">Deadline: {goal.deadline}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${goal.status === "on_track" ? "badge-emerald" : "badge-amber"}`}>
                  {goal.status === "on_track" ? "On Track" : "At Risk"}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-white/5 rounded-full h-2.5">
                  <motion.div
                    className="h-2.5 rounded-full"
                    style={{ background: goal.status === "on_track" ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #f59e0b, #f43f5e)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.current}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
                  />
                </div>
                <span className="text-xs font-orbitron font-bold text-slate-200 w-10 text-right">{goal.current}%</span>
              </div>
              <p className="text-xs text-muted">{goal.current} / {goal.target} {goal.unit}</p>
            </div>
          ))}
          <button className="btn-emerald px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-fit">
            <Plus size={15} /> Add Goal
          </button>
        </motion.div>
      )}

      {activeTab === "factors" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Emission Factors</h3>
            <button className="btn-emerald px-3 py-1.5 rounded-lg text-xs font-medium">+ Add Factor</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Factor</th><th>Unit</th><th>Source</th></tr></thead>
            <tbody>
              {[
                { name: "Diesel Fuel", cat: "Fleet", factor: "2.68", unit: "kgCO₂e/L", src: "GHG Protocol" },
                { name: "Electricity (Grid)", cat: "Energy", factor: "0.82", unit: "kgCO₂e/kWh", src: "IEA 2024" },
                { name: "Air Travel (short)", cat: "Travel", factor: "0.255", unit: "kgCO₂e/km", src: "DEFRA" },
                { name: "Natural Gas", cat: "Energy", factor: "2.04", unit: "kgCO₂e/m³", src: "IPCC" },
              ].map((f, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{f.name}</td>
                  <td><span className="badge-cyan text-xs px-2 py-0.5 rounded-full">{f.cat}</span></td>
                  <td className="font-orbitron text-emerald-400 text-xs">{f.factor}</td>
                  <td className="text-muted text-xs">{f.unit}</td>
                  <td className="text-muted text-xs">{f.src}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
