"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ApprovalStatus, ActivityStatus, NotificationType, CategoryType } from "@prisma/client";
import { checkBadgeAutoAward, calculateDepartmentScores } from "@/lib/esgEngine";

export async function getCSRData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const currentUser = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        include: { employeeParticipation: true },
      })
    : null;

  const activities = await prisma.cSRActivity.findMany({
    orderBy: { date: "asc" },
    include: { category: true },
  });

  const categories = await prisma.category.findMany({
    where: { type: CategoryType.CSR_ACTIVITY },
    orderBy: { name: "asc" },
  });

  const participations = await prisma.employeeParticipation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, activity: true },
  });

  const usersCount = await prisma.user.count();
  const activeParticipantsCount = await prisma.employeeParticipation.groupBy({
    by: ["userId"],
    _count: true,
  });

  // Fetch engagement rates by department
  const departments = await prisma.department.findMany({
    include: { users: { include: { employeeParticipation: true } } },
  });

  const engagementData = departments.map(d => {
    const totalUsers = d.users.length;
    if (totalUsers === 0) return { dept: d.name, rate: 0 };
    
    const engagedUsers = d.users.filter(u => u.employeeParticipation.length > 0).length;
    return {
      dept: d.name,
      rate: Math.round((engagedUsers / totalUsers) * 100),
    };
  });

  return {
    currentUser: currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      points: currentUser.points,
      xp: currentUser.xp,
    } : null,
    activities: activities.map(a => {
      const userPart = currentUser?.employeeParticipation.find(p => p.activityId === a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category?.name || "Community",
        date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        participants: a.maxParticipants ? Math.round(a.maxParticipants * 0.7) : 10, // Mock current counts if none
        max: a.maxParticipants || 50,
        status: a.status.toLowerCase(),
        points: a.points,
        joined: !!userPart,
        participationId: userPart?.id,
        approvalStatus: userPart?.approvalStatus.toLowerCase(),
        hasProof: !!userPart?.proof,
      };
    }),
    participations: participations.map(p => ({
      id: p.id,
      name: p.user.name || p.user.email,
      activity: p.activity.title,
      status: p.approvalStatus.toLowerCase(),
      points: p.pointsEarned,
      proof: p.proof,
      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })),
    engagementData: engagementData.length > 0 ? engagementData : [
      { dept: "Engineering", rate: 87 },
      { dept: "HR", rate: 92 },
      { dept: "Marketing", rate: 78 },
      { dept: "Finance", rate: 65 },
      { dept: "Operations", rate: 71 },
    ],
    categories: categories.map(c => ({
      id: c.id,
      name: c.name,
    })),
    stats: {
      totalActivities: activities.length,
      activeParticipants: activeParticipantsCount.length,
      avgEngagementRate: engagementData.length > 0 
        ? Math.round(engagementData.reduce((acc, d) => acc + d.rate, 0) / engagementData.length)
        : 79,
      pointsAwarded: participations.reduce((acc, p) => acc + p.pointsEarned, 0),
    }
  };
}

export async function createCSRActivity(data: {
  title: string;
  description: string;
  categoryId?: string;
  date: Date;
  location?: string;
  maxParticipants?: number;
  points: number;
  evidenceRequired?: boolean;
}) {
  const activity = await prisma.cSRActivity.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      date: data.date,
      location: data.location,
      maxParticipants: data.maxParticipants,
      points: data.points,
      evidenceRequired: data.evidenceRequired ?? false,
      status: ActivityStatus.UPCOMING,
    },
  });

  revalidatePath("/social");
  return activity;
}

export async function registerForCSRActivity(activityId: string, userId?: string) {
  let finalUserId = userId;
  if (!finalUserId) {
    const cookieStore = await cookies();
    finalUserId = cookieStore.get("user_id")?.value;
  }
  if (!finalUserId) throw new Error("Not logged in");

  const activity = await prisma.cSRActivity.findUnique({ where: { id: activityId } });
  if (!activity) throw new Error("Activity not found");

  const participation = await prisma.employeeParticipation.create({
    data: {
      userId: finalUserId,
      activityId,
      approvalStatus: ApprovalStatus.PENDING,
      pointsEarned: 0,
    },
  });

  revalidatePath("/social");
  return participation;
}

export async function submitCSRProof(participationId: string, proof: string, notes?: string) {
  const participation = await prisma.employeeParticipation.update({
    where: { id: participationId },
    data: {
      proof,
      notes,
      completionDate: new Date(),
    },
  });

  revalidatePath("/social");
  return participation;
}

export async function approveCSRParticipation(participationId: string, status: ApprovalStatus) {
  const participation = await prisma.employeeParticipation.findUnique({
    where: { id: participationId },
    include: { activity: true, user: true },
  });

  if (!participation) throw new Error("Participation not found");

  const pointsEarned = status === ApprovalStatus.APPROVED ? participation.activity.points : 0;

  const updated = await prisma.employeeParticipation.update({
    where: { id: participationId },
    data: {
      approvalStatus: status,
      pointsEarned,
    },
  });

  if (status === ApprovalStatus.APPROVED) {
    // Increment user points and XP
    await prisma.user.update({
      where: { id: participation.userId },
      data: {
        points: { increment: pointsEarned },
        xp: { increment: pointsEarned * 2 }, // 2 XP per CSR point
      },
    });

    // Award badges if applicable
    await checkBadgeAutoAward(participation.userId);

    // Update department score
    if (participation.user.departmentId) {
      await calculateDepartmentScores(participation.user.departmentId, "Q2-2026");
    }
  }

  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId: participation.userId,
      type: NotificationType.CSR_APPROVAL,
      title: status === ApprovalStatus.APPROVED ? "CSR Activity Approved!" : "CSR Activity Rejected",
      message: status === ApprovalStatus.APPROVED 
        ? `Your participation in '${participation.activity.title}' has been approved. You earned ${pointsEarned} points!`
        : `Your participation in '${participation.activity.title}' has been rejected.`,
      link: "/social",
    },
  });

  revalidatePath("/social");
  revalidatePath("/dashboard");
  revalidatePath("/gamification");
  return updated;
}
