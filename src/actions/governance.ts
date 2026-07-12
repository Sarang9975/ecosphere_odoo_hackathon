"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AuditStatus, IssueStatus, Severity, PolicyCategory, Status, NotificationType } from "@prisma/client";
import { calculateDepartmentScores } from "@/lib/esgEngine";

export async function getGovernanceData(userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }

  const policies = await prisma.eSGPolicy.findMany({
    orderBy: { effectiveDate: "desc" },
    include: { acknowledgements: true },
  });

  const audits = await prisma.audit.findMany({
    orderBy: { auditDate: "asc" },
    include: { policy: true, conductedBy: true },
  });

  const complianceIssues = await prisma.complianceIssue.findMany({
    orderBy: { dueDate: "asc" },
    include: { owner: true },
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // Calculate policy acknowledgement rate per policy
  const totalUsers = await prisma.user.count({ where: { role: { not: "ADMIN" } } });
  
  const mappedPolicies = policies.map(p => {
    const ackCount = p.acknowledgements.length;
    const rate = totalUsers > 0 ? Math.round((ackCount / totalUsers) * 100) : 100;
    return {
      id: p.id,
      title: p.title,
      category: p.category.toString(),
      version: p.version,
      effective: new Date(p.effectiveDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      requires: p.requiresAck,
      ackRate: rate,
      status: p.status.toLowerCase(),
      userAcknowledged: finalUserId 
        ? p.acknowledgements.some(ack => ack.userId === finalUserId) 
        : false,
    };
  });

  const openIssues = complianceIssues.filter(i => i.status === IssueStatus.OPEN || i.status === IssueStatus.IN_PROGRESS);
  const overdueIssues = openIssues.filter(i => i.dueDate < new Date());

  return {
    policies: mappedPolicies,
    audits: audits.map(a => ({
      id: a.id,
      title: a.title,
      policy: a.policy?.title || "General Compliance",
      date: new Date(a.auditDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      auditor: a.conductedBy?.name || "External Auditor",
      score: a.score,
      status: a.status.toLowerCase(),
    })),
    complianceIssues: complianceIssues.map(i => ({
      id: i.id,
      title: i.title,
      severity: i.severity.toLowerCase() as "critical" | "high" | "medium" | "low",
      owner: i.owner?.name || "Unassigned",
      ownerId: i.ownerId,
      due: new Date(i.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: i.status.toLowerCase(),
      overdue: i.dueDate < new Date() && i.status !== IssueStatus.RESOLVED && i.status !== IssueStatus.CLOSED,
    })),
    stats: {
      activePolicies: policies.filter(p => p.status === Status.ACTIVE).length,
      auditsCount: audits.length,
      openIssues: openIssues.length,
      overdueIssues: overdueIssues.length,
    },
    users: users.map(u => ({
      id: u.id,
      name: u.name || u.email,
    })),
  };
}

export async function createPolicy(data: {
  title: string;
  description: string;
  category: PolicyCategory;
  version?: string;
  effectiveDate: Date;
  requiresAck?: boolean;
}) {
  const policy = await prisma.eSGPolicy.create({
    data: {
      ...data,
      status: Status.ACTIVE,
    },
  });

  revalidatePath("/governance");
  return policy;
}

export async function acknowledgePolicy(policyId: string, userId?: string, ipAddress?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }
  if (!finalUserId) throw new Error("Not logged in");

  const ack = await prisma.policyAcknowledgement.create({
    data: {
      policyId,
      userId: finalUserId,
      ipAddress: ipAddress || "127.0.0.1",
    },
    include: { user: true },
  });

  if (ack.user.departmentId) {
    await calculateDepartmentScores(ack.user.departmentId, "Q2-2026");
  }

  revalidatePath("/governance");
  revalidatePath("/dashboard");
  return ack;
}

export async function scheduleAudit(data: {
  title: string;
  description?: string;
  policyId?: string;
  conductedById?: string;
  auditDate: Date;
}) {
  const audit = await prisma.audit.create({
    data: {
      ...data,
      status: AuditStatus.PLANNED,
    },
  });

  revalidatePath("/governance");
  return audit;
}

export async function completeAudit(auditId: string, score: number, findings?: string) {
  const audit = await prisma.audit.update({
    where: { id: auditId },
    data: {
      score,
      findings,
      status: AuditStatus.COMPLETED,
    },
  });

  revalidatePath("/governance");
  return audit;
}

export async function createComplianceIssue(data: {
  auditId?: string;
  title: string;
  description: string;
  severity: Severity;
  ownerId?: string;
  dueDate: Date;
}) {
  const issue = await prisma.complianceIssue.create({
    data: {
      ...data,
      status: IssueStatus.OPEN,
    },
    include: { owner: true },
  });

  if (issue.ownerId) {
    // Send in-app notification to Owner
    await prisma.notification.create({
      data: {
        userId: issue.ownerId,
        type: NotificationType.COMPLIANCE_ISSUE,
        title: "Compliance Issue Assigned! ⚠️",
        message: `You have been assigned a compliance issue: ${issue.title}. Due date: ${new Date(issue.dueDate).toLocaleDateString()}`,
        link: "/governance",
      },
    });

    if (issue.owner?.departmentId) {
      await calculateDepartmentScores(issue.owner.departmentId, "Q2-2026");
    }
  }

  revalidatePath("/governance");
  revalidatePath("/dashboard");
  return issue;
}

export async function resolveComplianceIssue(issueId: string) {
  const issue = await prisma.complianceIssue.findUnique({
    where: { id: issueId },
    include: { owner: true },
  });

  if (!issue) throw new Error("Issue not found");

  const resolved = await prisma.complianceIssue.update({
    where: { id: issueId },
    data: {
      status: IssueStatus.RESOLVED,
      resolvedAt: new Date(),
    },
  });

  if (issue.owner?.departmentId) {
    await calculateDepartmentScores(issue.owner.departmentId, "Q2-2026");
  }

  revalidatePath("/governance");
  revalidatePath("/dashboard");
  return resolved;
}
