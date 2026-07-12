"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ApprovalStatus, ChallengeStatus, RedemptionStatus, Status, NotificationType } from "@prisma/client";
import { checkBadgeAutoAward, calculateDepartmentScores } from "@/lib/esgEngine";

export async function getGamificationData(userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, participations: true },
  });

  const badges = await prisma.badge.findMany({
    include: { awards: true },
  });

  const rewards = await prisma.reward.findMany({
    orderBy: { pointsRequired: "asc" },
  });

  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    include: { badgeAwards: true },
  });

  const currentUser = userId 
    ? await prisma.user.findUnique({ where: { id: userId } }) 
    : await prisma.user.findFirst({ where: { role: { not: "ADMIN" } } });

  // Map challenges
  const mappedChallenges = challenges.map(c => {
    const userPart = finalUserId ? c.participations.find(p => p.userId === finalUserId) : null;
    return {
      id: c.id,
      title: c.title,
      category: c.category?.name || "General",
      xp: c.xp,
      difficulty: c.difficulty.toString() as "EASY" | "MEDIUM" | "HARD" | "EPIC",
      deadline: c.deadline ? new Date(c.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No deadline",
      status: c.status.toString() as "DRAFT" | "ACTIVE" | "UNDER_REVIEW" | "COMPLETED" | "ARCHIVED",
      participants: c.participations.length,
      joined: !!userPart,
      participationId: userPart?.id,
      progress: userPart?.progress || 0,
      approvalStatus: userPart?.approvalStatus.toLowerCase(),
    };
  });

  // Map badges
  const userBadgeIds = new Set(
    finalUserId 
      ? (await prisma.badgeAward.findMany({ where: { userId: finalUserId } })).map(a => a.badgeId) 
      : []
  );

  const mappedBadges = badges.map(b => ({
    id: b.id,
    name: b.name,
    icon: b.icon,
    color: b.color,
    rule: b.description,
    unlocked: userBadgeIds.has(b.id),
    holders: b.awards.length,
  }));

  // Leaderboard ranking
  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name || u.email,
    dept: "Engineering", // Default to Engineering, will resolve if department exists
    xp: u.xp,
    badges: u.badgeAwards.length,
    avatar: (u.name || "U").split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2),
  }));

  // Resolve actual departments
  const depts = await prisma.department.findMany({ include: { users: true } });
  leaderboard.forEach(p => {
    const userDept = depts.find(d => d.users.some(u => u.id === p.id));
    if (userDept) p.dept = userDept.name;
  });

  // Department battles (mock logic based on actual score if exists, or seeded defaults)
  const period = "Q2-2026";
  const scores = await prisma.departmentScore.findMany({ where: { period }, include: { department: true } });
  
  const battles = [
    {
      dept1: { name: "Engineering", score: 88, color: "#10b981" },
      dept2: { name: "Operations", score: 61, color: "#f43f5e" }
    },
    {
      dept1: { name: "HR", score: 92, color: "#06b6d4" },
      dept2: { name: "Finance", score: 74, color: "#8b5cf6" }
    }
  ];

  // If we have actual score data, update the battle arrays
  scores.forEach(s => {
    battles.forEach(b => {
      if (b.dept1.name === s.department.name) b.dept1.score = Math.round(s.totalScore);
      if (b.dept2.name === s.department.name) b.dept2.score = Math.round(s.totalScore);
    });
  });

  const participations = await prisma.challengeParticipation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, challenge: true },
  });

  return {
    participations: participations.map(p => ({
      id: p.id,
      name: p.user.name || p.user.email,
      challenge: p.challenge.title,
      status: p.approvalStatus.toLowerCase(),
      proof: p.proof,
      xp: p.challenge.xp,
      date: p.completedAt ? new Date(p.completedAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
    })),
    challenges: mappedChallenges,
    badges: mappedBadges,
    rewards: rewards.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      points: r.pointsRequired,
      stock: r.stock,
      status: r.stock > 0 && r.status === Status.ACTIVE ? "active" : "out_of_stock",
      icon: r.name.toLowerCase().includes("off") ? "🌴" : r.name.toLowerCase().includes("amazon") ? "🎁" : "🍽️",
    })),
    leaderboard,
    battles,
    currentUser: currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      points: currentUser.points,
      xp: currentUser.xp,
    } : null,
    users: users.map(u => ({
      id: u.id,
      name: u.name || u.email,
    })),
    stats: {
      activeChallenges: challenges.filter(c => c.status === ChallengeStatus.ACTIVE).length,
      totalXpAwarded: users.reduce((acc, u) => acc + u.xp, 0),
      badgesUnlocked: badges.reduce((acc, b) => acc + b.awards.length, 0),
      rewardsRedeemed: await prisma.rewardRedemption.count(),
    }
  };
}

export async function joinChallenge(challengeId: string, userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }
  if (!finalUserId) throw new Error("Not logged in");

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new Error("Challenge not found");

  const participation = await prisma.challengeParticipation.create({
    data: {
      userId: finalUserId,
      challengeId,
      progress: 0,
      approvalStatus: ApprovalStatus.PENDING,
    },
  });

  revalidatePath("/gamification");
  return participation;
}

export async function submitChallengeProof(participationId: string, proof: string) {
  const updated = await prisma.challengeParticipation.update({
    where: { id: participationId },
    data: {
      proof,
      progress: 100,
      completedAt: new Date(),
    },
  });

  revalidatePath("/gamification");
  return updated;
}

export async function approveChallengeParticipation(participationId: string, status: ApprovalStatus) {
  const participation = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true, user: true },
  });

  if (!participation) throw new Error("Participation not found");

  const xpAwarded = status === ApprovalStatus.APPROVED ? participation.challenge.xp : 0;

  const updated = await prisma.challengeParticipation.update({
    where: { id: participationId },
    data: {
      approvalStatus: status,
      xpAwarded,
    },
  });

  if (status === ApprovalStatus.APPROVED) {
    // Add XP & Points to user
    await prisma.user.update({
      where: { id: participation.userId },
      data: {
        xp: { increment: xpAwarded },
        points: { increment: Math.round(xpAwarded / 2) }, // Points is half of XP
      },
    });

    // Check Badge auto awards
    await checkBadgeAutoAward(participation.userId);

    // Recalculate department score
    if (participation.user.departmentId) {
      await calculateDepartmentScores(participation.user.departmentId, "Q2-2026");
    }
  }

  // Create Notification
  await prisma.notification.create({
    data: {
      userId: participation.userId,
      type: NotificationType.CHALLENGE_APPROVAL,
      title: status === ApprovalStatus.APPROVED ? "Challenge Approved! 🎉" : "Challenge Rejected",
      message: status === ApprovalStatus.APPROVED
        ? `Your proof for '${participation.challenge.title}' was approved! You earned ${xpAwarded} XP.`
        : `Your proof for '${participation.challenge.title}' was rejected.`,
      link: "/gamification",
    },
  });

  revalidatePath("/gamification");
  revalidatePath("/dashboard");
  return updated;
}

export async function redeemReward(rewardId: string, userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }
  if (!finalUserId) throw new Error("Not logged in");

  const user = await prisma.user.findUnique({ where: { id: finalUserId } });
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });

  if (!user || !reward) throw new Error("User or Reward not found");
  if (reward.stock <= 0) throw new Error("Reward is out of stock");
  if (user.points < reward.pointsRequired) throw new Error("Insufficient points balance");

  // Start Transaction
  const [redemption] = await prisma.$transaction([
    prisma.rewardRedemption.create({
      data: {
        rewardId,
        userId: finalUserId,
        pointsSpent: reward.pointsRequired,
        status: RedemptionStatus.APPROVED, // Auto approve for demo
      },
    }),
    prisma.user.update({
      where: { id: finalUserId },
      data: { points: { decrement: reward.pointsRequired } },
    }),
    prisma.reward.update({
      where: { id: rewardId },
      data: { stock: { decrement: 1 } },
    }),
  ]);

  // Send Notification
  await prisma.notification.create({
    data: {
      userId: finalUserId,
      type: NotificationType.REWARD_APPROVED,
      title: "Reward Redeemed! 🎁",
      message: `You successfully redeemed '${reward.name}' for ${reward.pointsRequired} points.`,
      link: "/gamification",
    },
  });

  revalidatePath("/gamification");
  revalidatePath("/dashboard");
  return redemption;
}
