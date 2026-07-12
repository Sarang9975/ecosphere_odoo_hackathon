import { prisma } from "./prisma";
import { ApprovalStatus, Severity, UnlockRule, GoalStatus, Status, NotificationType } from "@prisma/client";

/**
 * Recalculate E, S, and G scores for a department (or overall)
 * and update the DepartmentScore database records.
 */
export async function calculateDepartmentScores(departmentId: string, period: string) {
  // --- 1. ENVIRONMENTAL SCORE ---
  // Average completion percentage of environmental goals
  const goals = await prisma.environmentalGoal.findMany({
    where: departmentId ? { departmentId } : {},
  });
  
  let envScore = 75; // Default baseline
  if (goals.length > 0) {
    const totalProgress = goals.reduce((acc, goal) => {
      const pct = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      return acc + Math.min(100, pct);
    }, 0);
    envScore = totalProgress / goals.length;
  }

  // Adjust envScore slightly based on carbon transactions count/efficiency if desired
  // We clamp between 0 and 100
  envScore = Math.max(0, Math.min(100, envScore));

  // --- 2. SOCIAL SCORE ---
  // Factored by employee CSR engagement and training/participation
  // Fetch users in the department
  const users = await prisma.user.findMany({
    where: departmentId ? { departmentId } : {},
    select: { id: true },
  });
  const userIds = users.map(u => u.id);

  let socialScore = 80; // Baseline
  if (userIds.length > 0) {
    const totalParticipations = await prisma.employeeParticipation.count({
      where: {
        userId: { in: userIds },
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });

    // Score increases with more participation
    socialScore = Math.min(100, 60 + (totalParticipations * 5));
  }

  // --- 3. GOVERNANCE SCORE ---
  // Policy acknowledgement rate + audit scores - compliance issue penalty
  const policies = await prisma.eSGPolicy.findMany({
    where: { status: Status.ACTIVE, requiresAck: true },
  });

  let ackRate = 100;
  if (policies.length > 0 && userIds.length > 0) {
    const totalPossibleAcks = policies.length * userIds.length;
    const actualAcks = await prisma.policyAcknowledgement.count({
      where: {
        policyId: { in: policies.map(p => p.id) },
        userId: { in: userIds },
      },
    });
    ackRate = (actualAcks / totalPossibleAcks) * 100;
  }

  // Audits
  const completedAudits = await prisma.audit.findMany({
    where: {
      status: "COMPLETED",
      score: { not: null },
    },
  });
  const avgAuditScore = completedAudits.length > 0 
    ? completedAudits.reduce((acc, a) => acc + (a.score ?? 0), 0) / completedAudits.length 
    : 80;

  // Open Compliance Issues penalties
  const openIssues = await prisma.complianceIssue.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      ownerId: userIds.length > 0 ? { in: userIds } : undefined,
    },
  });

  let penalty = 0;
  openIssues.forEach(issue => {
    if (issue.severity === Severity.CRITICAL) penalty += 15;
    else if (issue.severity === Severity.HIGH) penalty += 10;
    else if (issue.severity === Severity.MEDIUM) penalty += 5;
    else penalty += 2;
    
    // Additional penalty if overdue
    if (issue.dueDate < new Date()) {
      penalty += 10;
    }
  });

  let govScore = (ackRate * 0.5) + (avgAuditScore * 0.5) - penalty;
  govScore = Math.max(0, Math.min(100, govScore));

  // --- 4. CONFIG WEIGHTS & TOTAL ---
  const settings = await prisma.appSettings.findFirst();
  const wEnv = settings?.envWeight ?? 0.4;
  const wSoc = settings?.socialWeight ?? 0.3;
  const wGov = settings?.govWeight ?? 0.3;

  const totalScore = (envScore * wEnv) + (socialScore * wSoc) + (govScore * wGov);

  // Upsert score for department and period
  const finalScore = await prisma.departmentScore.upsert({
    where: {
      departmentId_period: {
        departmentId,
        period,
      },
    },
    update: {
      environmentalScore: Math.round(envScore * 10) / 10,
      socialScore: Math.round(socialScore * 10) / 10,
      governanceScore: Math.round(govScore * 10) / 10,
      totalScore: Math.round(totalScore * 10) / 10,
    },
    create: {
      departmentId,
      period,
      environmentalScore: Math.round(envScore * 10) / 10,
      socialScore: Math.round(socialScore * 10) / 10,
      governanceScore: Math.round(govScore * 10) / 10,
      totalScore: Math.round(totalScore * 10) / 10,
    },
  });

  return finalScore;
}

/**
 * Re-calculate overall organizational ESG score based on weights
 */
export async function getOverallESGScore(period: string = "Q2-2026") {
  const deptScores = await prisma.departmentScore.findMany({
    where: { period },
  });

  if (deptScores.length === 0) {
    // If no records, return a default aggregate
    return { env: 74, soc: 82, gov: 71, total: 76 };
  }

  const count = deptScores.length;
  const env = deptScores.reduce((acc, d) => acc + d.environmentalScore, 0) / count;
  const soc = deptScores.reduce((acc, d) => acc + d.socialScore, 0) / count;
  const gov = deptScores.reduce((acc, d) => acc + d.governanceScore, 0) / count;
  const total = deptScores.reduce((acc, d) => acc + d.totalScore, 0) / count;

  return {
    env: Math.round(env * 10) / 10,
    soc: Math.round(soc * 10) / 10,
    gov: Math.round(gov * 10) / 10,
    total: Math.round(total * 10) / 10,
  };
}

/**
 * Check badge auto-unlock rules whenever a user completes an action
 */
export async function checkBadgeAutoAward(userId: string) {
  const settings = await prisma.appSettings.findFirst();
  if (settings && !settings.badgeAutoAward) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badgeAwards: true },
  });

  if (!user) return [];

  const awardedBadgeIds = new Set(user.badgeAwards.map(a => a.badgeId));
  const badges = await prisma.badge.findMany();

  const newAwards: string[] = [];

  for (const badge of badges) {
    if (awardedBadgeIds.has(badge.id)) continue;

    let shouldUnlock = false;

    if (badge.unlockRule === UnlockRule.XP_THRESHOLD && badge.xpRequired !== null) {
      shouldUnlock = user.xp >= badge.xpRequired;
    } else if (badge.unlockRule === UnlockRule.CHALLENGE_COUNT && badge.challengesRequired !== null) {
      const completedCount = await prisma.challengeParticipation.count({
        where: { userId, approvalStatus: ApprovalStatus.APPROVED },
      });
      shouldUnlock = completedCount >= badge.challengesRequired;
    } else if (badge.unlockRule === UnlockRule.CSR_COUNT) {
      const csrCount = await prisma.employeeParticipation.count({
        where: { userId, approvalStatus: ApprovalStatus.APPROVED },
      });
      shouldUnlock = csrCount >= 3; // Standard threshold for seed CSR Hero
    } else if (badge.unlockRule === UnlockRule.FIRST_LOGIN) {
      shouldUnlock = true; // Auto unlock
    } else if (badge.unlockRule === UnlockRule.PERFECT_SCORE) {
      // Unlock if user completed at least 1 EPIC difficulty challenge
      const epicCompleted = await prisma.challengeParticipation.count({
        where: {
          userId,
          approvalStatus: ApprovalStatus.APPROVED,
          challenge: { difficulty: "EPIC" },
        },
      });
      shouldUnlock = epicCompleted > 0;
    }

    if (shouldUnlock) {
      await prisma.badgeAward.create({
        data: {
          badgeId: badge.id,
          userId: user.id,
        },
      });
      
      // Send notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.BADGE_UNLOCKED,
          title: "Badge Unlocked! 🏆",
          message: `Congratulations! You unlocked the '${badge.name}' badge: ${badge.description}`,
          link: "/gamification",
        },
      });

      newAwards.push(badge.name);
    }
  }

  return newAwards;
}
