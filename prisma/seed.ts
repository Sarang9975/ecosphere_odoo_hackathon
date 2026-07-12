import { PrismaClient, Role, Status, UnlockRule, CategoryType, GoalStatus, PolicyCategory, ChallengeStatus, ActivityStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clear existing data
  await prisma.appSettings.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.badgeAward.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  await prisma.cSRActivity.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.eSGPolicy.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.productESGProfile.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. App Settings
  console.log("Seeding app settings...");
  await prisma.appSettings.create({
    data: {
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
    },
  });

  // 3. Departments
  console.log("Seeding departments...");
  const engineering = await prisma.department.create({
    data: { name: "Engineering", code: "ENG", head: "Sarah K.", employeeCount: 15, status: Status.ACTIVE },
  });
  const hr = await prisma.department.create({
    data: { name: "HR", code: "HR", head: "Alex M.", employeeCount: 5, status: Status.ACTIVE },
  });
  const marketing = await prisma.department.create({
    data: { name: "Marketing", code: "MKT", head: "Priya R.", employeeCount: 8, status: Status.ACTIVE },
  });
  const finance = await prisma.department.create({
    data: { name: "Finance", code: "FIN", head: "Mei L.", employeeCount: 6, status: Status.ACTIVE },
  });
  const operations = await prisma.department.create({
    data: { name: "Operations", code: "OPS", head: "James T.", employeeCount: 20, status: Status.ACTIVE },
  });

  // 4. Users
  console.log("Seeding users...");
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@ecosphere.com",
      role: Role.ADMIN,
      xp: 0,
      points: 0,
    },
  });
  const sarah = await prisma.user.create({
    data: {
      name: "Sarah K.",
      email: "sarah.k@ecosphere.com",
      role: Role.EMPLOYEE,
      xp: 2840,
      points: 1500,
      departmentId: engineering.id,
    },
  });
  const alex = await prisma.user.create({
    data: {
      name: "Alex M.",
      email: "alex.m@ecosphere.com",
      role: Role.MANAGER,
      xp: 2310,
      points: 1200,
      departmentId: hr.id,
    },
  });
  const priya = await prisma.user.create({
    data: {
      name: "Priya R.",
      email: "priya.r@ecosphere.com",
      role: Role.EMPLOYEE,
      xp: 1950,
      points: 1000,
      departmentId: marketing.id,
    },
  });
  const james = await prisma.user.create({
    data: {
      name: "James T.",
      email: "james.t@ecosphere.com",
      role: Role.EMPLOYEE,
      xp: 1640,
      points: 800,
      departmentId: operations.id,
    },
  });
  const mei = await prisma.user.create({
    data: {
      name: "Mei L.",
      email: "mei.l@ecosphere.com",
      role: Role.EMPLOYEE,
      xp: 1420,
      points: 600,
      departmentId: finance.id,
    },
  });

  // 5. Categories
  console.log("Seeding categories...");
  const catEnvCsr = await prisma.category.create({ data: { name: "Environment", type: CategoryType.CSR_ACTIVITY, status: Status.ACTIVE } });
  const catCommCsr = await prisma.category.create({ data: { name: "Community", type: CategoryType.CSR_ACTIVITY, status: Status.ACTIVE } });
  const catHealthCsr = await prisma.category.create({ data: { name: "Health", type: CategoryType.CSR_ACTIVITY, status: Status.ACTIVE } });
  const catEduCsr = await prisma.category.create({ data: { name: "Education", type: CategoryType.CSR_ACTIVITY, status: Status.ACTIVE } });

  const catEnvChal = await prisma.category.create({ data: { name: "Environment", type: CategoryType.CHALLENGE, status: Status.ACTIVE } });
  const catTransChal = await prisma.category.create({ data: { name: "Transport", type: CategoryType.CHALLENGE, status: Status.ACTIVE } });
  const catFoodChal = await prisma.category.create({ data: { name: "Food", type: CategoryType.CHALLENGE, status: Status.ACTIVE } });
  const catTechChal = await prisma.category.create({ data: { name: "Technology", type: CategoryType.CHALLENGE, status: Status.ACTIVE } });
  const catEnergyChal = await prisma.category.create({ data: { name: "Energy", type: CategoryType.CHALLENGE, status: Status.ACTIVE } });

  // 6. Emission Factors
  console.log("Seeding emission factors...");
  await prisma.emissionFactor.createMany({
    data: [
      { name: "Diesel Fuel", category: "Fleet", factor: 2.68, unit: "kgCO₂e/L", source: "GHG Protocol", description: "Diesel fuel combustion in fleet vehicles" },
      { name: "Electricity (Grid)", category: "Energy", factor: 0.82, unit: "kgCO₂e/kWh", source: "IEA 2024", description: "Grid electricity consumption" },
      { name: "Air Travel (short)", category: "Travel", factor: 0.255, unit: "kgCO₂e/km", source: "DEFRA", description: "Short-haul flights under 3700km" },
      { name: "Natural Gas", category: "Energy", factor: 2.04, unit: "kgCO₂e/m³", source: "IPCC", description: "Natural gas heating and processing" },
      { name: "Paper Waste", category: "Waste", factor: 0.95, unit: "kgCO₂e/kg", source: "EPA", description: "Landfilled paper waste emissions" },
    ],
  });

  // 7. Environmental Goals
  console.log("Seeding goals...");
  await prisma.environmentalGoal.createMany({
    data: [
      { title: "Reduce Fleet Emissions", targetValue: 100.0, currentValue: 65.0, unit: "tCO₂e saved", category: "Fleet", status: GoalStatus.IN_PROGRESS },
      { title: "100% Renewable Energy", targetValue: 100.0, currentValue: 42.0, unit: "% renewable", category: "Energy", status: GoalStatus.AT_RISK },
      { title: "Zero Waste Manufacturing", targetValue: 100.0, currentValue: 78.0, unit: "% waste diverted", category: "Waste", status: GoalStatus.IN_PROGRESS },
    ],
  });

  // 8. Policies
  console.log("Seeding governance policies...");
  await prisma.eSGPolicy.createMany({
    data: [
      { title: "Carbon Emissions Disclosure Policy", description: "Rules regarding the tracking and disclosure of greenhouse gas emissions.", category: PolicyCategory.ENVIRONMENTAL, version: "2.1", effectiveDate: new Date("2026-01-01"), requiresAck: true, status: Status.ACTIVE },
      { title: "Employee Diversity & Inclusion Policy", description: "Guidelines to promote diversity and inclusion in recruitment and workspace operations.", category: PolicyCategory.DIVERSITY, version: "1.3", effectiveDate: new Date("2025-03-01"), requiresAck: true, status: Status.ACTIVE },
      { title: "Anti-Corruption & Bribery Policy", description: "Corporate code of conduct against bribery, kickbacks, and corrupt dealings.", category: PolicyCategory.ANTI_CORRUPTION, version: "3.0", effectiveDate: new Date("2025-06-01"), requiresAck: true, status: Status.ACTIVE },
      { title: "Data Privacy & GDPR Compliance", description: "Rules concerning handling and processing of personal data for GDPR compliance.", category: PolicyCategory.DATA_PRIVACY, version: "2.0", effectiveDate: new Date("2025-09-01"), requiresAck: true, status: Status.ACTIVE },
      { title: "Health & Safety Framework", description: "Health guidelines and emergency protocols for corporate offices.", category: PolicyCategory.HEALTH_SAFETY, version: "1.5", effectiveDate: new Date("2026-02-01"), requiresAck: false, status: Status.ACTIVE },
    ],
  });

  // 9. Badges
  console.log("Seeding badges...");
  await prisma.badge.createMany({
    data: [
      { name: "Carbon Champion", description: "Earn 1000 XP", icon: "🌱", unlockRule: UnlockRule.XP_THRESHOLD, xpRequired: 1000, color: "#10b981" },
      { name: "Eco Warrior", description: "Complete 5 challenges", icon: "⚔️", unlockRule: UnlockRule.CHALLENGE_COUNT, challengesRequired: 5, color: "#06b6d4" },
      { name: "CSR Hero", description: "Complete 10 CSR activities", icon: "🦸", unlockRule: UnlockRule.CSR_COUNT, color: "#8b5cf6" },
      { name: "Policy Guardian", description: "Acknowledge all policies", icon: "🛡️", unlockRule: UnlockRule.PERFECT_SCORE, color: "#f59e0b" },
      { name: "First Steps", description: "First login to EcoSphere", icon: "👣", unlockRule: UnlockRule.FIRST_LOGIN, color: "#a78bfa" },
    ],
  });

  // 10. Rewards
  console.log("Seeding rewards...");
  await prisma.reward.createMany({
    data: [
      { name: "Extra Day Off", description: "Redeem for 1 additional paid day off", pointsRequired: 2000, stock: 5, status: Status.ACTIVE },
      { name: "Amazon Gift Card ($50)", description: "$50 digital Amazon gift voucher", pointsRequired: 1000, stock: 20, status: Status.ACTIVE },
      { name: "Team Lunch Voucher", description: "Free team lunch coupon", pointsRequired: 500, stock: 15, status: Status.ACTIVE },
      { name: "Carbon-Offset Flight", description: "Fully offset your next flight", pointsRequired: 5000, stock: 2, status: Status.ACTIVE },
      { name: "EV Charging Credit", description: "EV charging network credits", pointsRequired: 750, stock: 0, status: Status.ACTIVE },
    ],
  });

  // 11. Challenges
  console.log("Seeding challenges...");
  await prisma.challenge.createMany({
    data: [
      { title: "Zero-Waste Week", description: "Produce zero landfill waste for a whole week.", categoryId: catEnvChal.id, xp: 500, status: ChallengeStatus.ACTIVE, evidenceRequired: true },
      { title: "Cycle to Work Month", description: "Commute to work using a bicycle for a month.", categoryId: catTransChal.id, xp: 300, status: ChallengeStatus.ACTIVE, evidenceRequired: true },
      { title: "Plant-Based Lunch Week", description: "Eat only plant-based meals during office lunches for a week.", categoryId: catFoodChal.id, xp: 200, status: ChallengeStatus.ACTIVE, evidenceRequired: false },
      { title: "Digital Carbon Detox", description: "Clean up unwanted cloud emails and media files.", categoryId: catTechChal.id, xp: 150, status: ChallengeStatus.ACTIVE, evidenceRequired: false },
      { title: "Office Energy Blitz", description: "Identify and turn off unneeded appliances and lights.", categoryId: catEnergyChal.id, xp: 800, status: ChallengeStatus.ACTIVE, evidenceRequired: true },
    ],
  });

  // 12. CSR Activities
  console.log("Seeding CSR Activities...");
  await prisma.cSRActivity.createMany({
    data: [
      { title: "Tree Planting Drive", description: "Join our green team in planting trees in the city park.", categoryId: catEnvCsr.id, date: new Date("2026-07-15"), location: "City Park", maxParticipants: 60, status: ActivityStatus.UPCOMING, points: 100, evidenceRequired: true },
      { title: "Community Clean-Up", description: "Cleaning up the local neighborhood.", categoryId: catCommCsr.id, date: new Date("2026-07-08"), location: "Westside District", maxParticipants: 32, status: ActivityStatus.COMPLETED, points: 75, evidenceRequired: true },
      { title: "Blood Donation Camp", description: "Annual corporate blood drive.", categoryId: catHealthCsr.id, date: new Date("2026-07-20"), location: "HQ Lobby", maxParticipants: 40, status: ActivityStatus.UPCOMING, points: 150, evidenceRequired: false },
      { title: "Digital Literacy Workshop", description: "Teaching computer skills to local seniors.", categoryId: catEduCsr.id, date: new Date("2026-06-28"), location: "Community Center", maxParticipants: 25, status: ActivityStatus.COMPLETED, points: 80, evidenceRequired: true },
    ],
  });

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
