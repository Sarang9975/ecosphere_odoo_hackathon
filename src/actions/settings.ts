"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAppSettings() {
  let settings = await prisma.appSettings.findFirst();
  if (!settings) {
    // If not seeded, return default fallback
    return {
      id: "default",
      autoEmissionCalculation: true,
      evidenceRequired: false,
      badgeAutoAward: true,
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      emailNotifications: true,
      inAppNotifications: true,
      notifyComplianceIssue: true,
      notifyBadgeUnlock: true,
      notifyCsrApproval: true,
      notifyPolicyReminder: true,
    };
  }
  return settings;
}

export async function saveAppSettings(data: {
  autoEmissionCalculation?: boolean;
  evidenceRequired?: boolean;
  badgeAutoAward?: boolean;
  envWeight?: number;
  socialWeight?: number;
  govWeight?: number;
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  notifyComplianceIssue?: boolean;
  notifyBadgeUnlock?: boolean;
  notifyCsrApproval?: boolean;
  notifyPolicyReminder?: boolean;
}) {
  const settings = await prisma.appSettings.findFirst();
  if (settings) {
    await prisma.appSettings.update({
      where: { id: settings.id },
      data,
    });
  } else {
    await prisma.appSettings.create({
      data: {
        autoEmissionCalculation: data.autoEmissionCalculation ?? true,
        evidenceRequired: data.evidenceRequired ?? false,
        badgeAutoAward: data.badgeAutoAward ?? true,
        envWeight: data.envWeight ?? 0.4,
        socialWeight: data.socialWeight ?? 0.3,
        govWeight: data.govWeight ?? 0.3,
        emailNotifications: data.emailNotifications ?? true,
        inAppNotifications: data.inAppNotifications ?? true,
        notifyComplianceIssue: data.notifyComplianceIssue ?? true,
        notifyBadgeUnlock: data.notifyBadgeUnlock ?? true,
        notifyCsrApproval: data.notifyCsrApproval ?? true,
        notifyPolicyReminder: data.notifyPolicyReminder ?? true,
      },
    });
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
