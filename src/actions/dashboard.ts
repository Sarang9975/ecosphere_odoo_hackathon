"use server";

import { prisma } from "@/lib/prisma";
import { getOverallESGScore } from "@/lib/esgEngine";
import { IssueStatus, ChallengeStatus, Status } from "@prisma/client";

export async function getDashboardData(userId?: string) {
  const period = "Q2-2026";

  // 1. Carbon emissions
  const transactions = await prisma.carbonTransaction.findMany();
  const totalCo2Kg = transactions.reduce((acc, t) => acc + t.co2eKg, 0);
  const totalCo2Tons = Math.round(totalCo2Kg / 1000);

  // 2. CSR Participants
  const csrParticipants = await prisma.employeeParticipation.groupBy({
    by: ["userId"],
  });
  const totalParticipants = csrParticipants.length;

  // 3. Compliance Rate
  const totalPolicies = await prisma.eSGPolicy.count({ where: { status: Status.ACTIVE, requiresAck: true } });
  const totalEmployees = await prisma.user.count({ where: { role: { not: "ADMIN" } } });
  const possibleAcks = totalPolicies * totalEmployees;
  const actualAcks = await prisma.policyAcknowledgement.count();
  
  let complianceRate = 95; // Default baseline if no entries
  if (possibleAcks > 0) {
    complianceRate = Math.round((actualAcks / possibleAcks) * 100);
  }

  // 4. Active Challenges
  const activeChallenges = await prisma.challenge.count({
    where: { status: ChallengeStatus.ACTIVE },
  });

  // 5. Department ESG Rankings
  const deptScores = await prisma.departmentScore.findMany({
    where: { period },
    include: { department: true },
    orderBy: { totalScore: "desc" },
  });

  const departmentScores = deptScores.map(d => ({
    name: d.department.name,
    score: Math.round(d.totalScore),
  }));

  // 6. Overall ESG Score
  const overallScore = await getOverallESGScore(period);

  // 7. Action Required / Alerts
  const openIssues = await prisma.complianceIssue.findMany({
    where: { status: IssueStatus.OPEN },
    include: { owner: true },
  });

  const overdueIssues = openIssues.filter(i => i.dueDate < new Date());
  
  const alerts = [
    { title: `${overdueIssues.length} Compliance Issues Overdue`, dept: "Operations", severity: "critical", days: overdueIssues.length > 0 ? 7 : 0 },
    { title: "Policy Acknowledgements Pending", dept: "Engineering", severity: "warning", days: 3 },
    { title: "Carbon Audit Pending Review", dept: "Finance", severity: "info", days: 0 },
  ];

  // 8. Notifications
  const notifications = await prisma.notification.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    kpis: {
      totalCo2: totalCo2Tons.toLocaleString(),
      csrParticipants: totalParticipants,
      complianceRate,
      activeChallenges,
    },
    overallScore,
    departmentScores: departmentScores.length > 0 ? departmentScores : [
      { name: "Engineering", score: 88 },
      { name: "Marketing", score: 82 },
      { name: "HR", score: 79 },
      { name: "Finance", score: 74 },
      { name: "Operations", score: 61 },
    ],
    alerts: openIssues.length > 0 ? openIssues.map(i => ({
      title: i.title,
      dept: i.owner?.name || "Governance",
      severity: i.severity === "CRITICAL" ? "critical" : i.severity === "HIGH" ? "warning" : "info",
      days: i.dueDate < new Date() ? Math.round((new Date().getTime() - i.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    })) : alerts,
    notifications: notifications.map(n => ({
      id: n.id,
      type: n.type === "COMPLIANCE_ISSUE" ? "warning" : n.type === "BADGE_UNLOCKED" ? "success" : "info",
      title: n.title,
      desc: n.message,
      time: new Date(n.createdAt).toLocaleDateString(),
    })),
  };
}
