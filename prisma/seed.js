const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { createHash } = require("crypto");

const prisma = new PrismaClient();

function hashSync(password) {
  return bcrypt.hashSync(password, 10);
}

function ledgerHash(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

const STATIONS = [
  {
    name: "Stansiya #1 — Chilonzor Markazi",
    address: "Chilonzor tumani, Bunyodkor shoh ko'chasi",
    district: "Chilonzor",
    lat: 41.2806,
    lng: 69.2034,
    acceptedMaterials: ["PLASTIC", "PAPER", "GLASS", "ALUMINUM"],
    openingHours: "08:00 - 22:00",
    capacityPercent: 42,
    qrCode: "ECO-STN-001",
  },
  {
    name: "Stansiya #2 — Yunusobod Park",
    address: "Yunusobod tumani, Amir Temur ko'chasi",
    district: "Yunusobod",
    lat: 41.3511,
    lng: 69.2878,
    acceptedMaterials: ["PLASTIC", "PAPER", "ELECTRONIC"],
    openingHours: "24 soat",
    capacityPercent: 68,
    qrCode: "ECO-STN-002",
  },
  {
    name: "Stansiya #3 — Mirzo Ulug'bek",
    address: "Mirzo Ulug'bek tumani, Universitet ko'chasi",
    district: "Mirzo Ulug'bek",
    lat: 41.3356,
    lng: 69.3356,
    acceptedMaterials: ["PLASTIC", "GLASS", "ALUMINUM"],
    openingHours: "07:00 - 23:00",
    capacityPercent: 25,
    qrCode: "ECO-STN-003",
  },
  {
    name: "Stansiya #4 — Amir Temur Shox Ko'chasi",
    address: "Shayxontohur tumani, Amir Temur shox ko'chasi",
    district: "Shayxontohur",
    lat: 41.3123,
    lng: 69.2787,
    acceptedMaterials: ["PLASTIC", "PAPER", "GLASS", "ALUMINUM", "ELECTRONIC"],
    openingHours: "24 soat",
    capacityPercent: 55,
    qrCode: "ECO-STN-004",
  },
  {
    name: "Stansiya #5 — Sergeli Bozori",
    address: "Sergeli tumani, Qo'shchinor ko'chasi",
    district: "Sergeli",
    lat: 41.2214,
    lng: 69.2109,
    acceptedMaterials: ["PLASTIC", "ORGANIC"],
    openingHours: "09:00 - 20:00",
    capacityPercent: 80,
    qrCode: "ECO-STN-005",
  },
];

const REWARD_RULES = [
  { material: "PLASTIC", tokensPerKg: 12, co2PerKg: 1.5 },
  { material: "PAPER", tokensPerKg: 8, co2PerKg: 0.9 },
  { material: "GLASS", tokensPerKg: 6, co2PerKg: 0.3 },
  { material: "ALUMINUM", tokensPerKg: 20, co2PerKg: 9.0 },
  { material: "ORGANIC", tokensPerKg: 3, co2PerKg: 0.2 },
  { material: "ELECTRONIC", tokensPerKg: 35, co2PerKg: 4.0 },
];

const REWARDS = [
  {
    category: "food",
    partnerName: "Coffee House",
    title: "20% Chegirma Kuponi",
    description: "Mahalliy kafelar tarmog'ida istalgan ichimlikka 20% chegirma.",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    tokenCost: 50,
  },
  {
    category: "entertainment",
    partnerName: "CinemaPlus",
    title: "Bepul Kinoteatr Chiptasi",
    description: "Istalgan seans uchun bitta bepul kinoteatr chiptasi.",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    tokenCost: 120,
  },
  {
    category: "eco-products",
    partnerName: "EcoStore",
    title: "Ekologik Mato Sumka",
    description: "100% paxtadan tayyorlangan zamonaviy xarid sumkasi.",
    imageUrl:
      "https://images.unsplash.com/photo-1597633634062-58512961decc?auto=format&fit=crop&w=600&q=80",
    tokenCost: 90,
  },
  {
    category: "grocery",
    partnerName: "Korzinka",
    title: "50,000 so'mlik Vaucher",
    description: "Supermarketlar tarmog'ida xarid qilish uchun sertifikat.",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    tokenCost: 200,
  },
  {
    category: "mobility",
    partnerName: "Toshkent Metro",
    title: "10 Marta Chiptasi",
    description: "Metro va avtobuslarda 10 marotaba bepul yurish.",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    tokenCost: 70,
  },
  {
    category: "donation",
    partnerName: "EcoChain Jamoasi",
    title: "Daraxt Ekish Loyihasiga Hadya",
    description: "Tokenlaringizni Toshkentda daraxt ekish kampaniyasiga yo'naltiring.",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    tokenCost: 40,
  },
];

const ACHIEVEMENTS = [
  { code: "FIRST_RECYCLE", title: "First Recycle", description: "Birinchi chiqindingizni topshirdingiz.", icon: "sparkles" },
  { code: "PLASTIC_HERO", title: "Plastic Hero", description: "10 kg dan ortiq plastik qayta ishladingiz.", icon: "recycle" },
  { code: "ZERO_WASTE_WEEK", title: "Zero-Waste Week", description: "Bir hafta davomida har kuni faollik ko'rsatdingiz.", icon: "calendar-check" },
  { code: "COMMUNITY_CHAMPION", title: "Community Champion", description: "Jamoat kampaniyasida faol qatnashdingiz.", icon: "users" },
];

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.tokenTransaction.deleteMany();
  await prisma.recyclingEvent.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.rewardRule.deleteMany();
  await prisma.station.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@ecochain.uz",
      passwordHash: hashSync("admin1234"),
      name: "Platform Admin",
      role: "ADMIN",
      district: "Yunusobod",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@ecochain.uz",
      passwordHash: hashSync("demo1234"),
      name: "Aziza Karimova",
      role: "USER",
      district: "Yunusobod",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  });

  const otherUsers = await Promise.all(
    [
      ["Jasurbek Rahimov", "Chilonzor", "jasurbek@ecochain.uz"],
      ["Madina Umarova", "Mirzo Ulug'bek", "madina@ecochain.uz"],
      ["Sardor Normatov", "Chilonzor", "sardor@ecochain.uz"],
      ["Dilfuza Sobirova", "Sergeli", "dilfuza@ecochain.uz"],
    ].map(([name, district, email]) =>
      prisma.user.create({
        data: { email, passwordHash: hashSync("demo1234"), name, district },
      })
    )
  );

  for (const rule of REWARD_RULES) {
    await prisma.rewardRule.create({ data: rule });
  }

  const stations = [];
  for (const s of STATIONS) {
    stations.push(
      await prisma.station.create({
        data: { ...s, acceptedMaterials: JSON.stringify(s.acceptedMaterials) },
      })
    );
  }

  for (const r of REWARDS) {
    await prisma.reward.create({ data: r });
  }

  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: a });
  }

  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.challenge.createMany({
    data: [
      {
        title: "2 kg plastikni qayta ishlang",
        description: "Shu hafta davomida 2 kg plastik chiqindi topshiring.",
        period: "WEEKLY",
        goalType: "weight_kg",
        goalValue: 2,
        rewardTokens: 30,
        startDate: now,
        endDate: weekEnd,
      },
      {
        title: "5 ta tasdiqlangan faollik",
        description: "Shu oy davomida 5 marta chiqindi topshiring.",
        period: "MONTHLY",
        goalType: "events_count",
        goalValue: 5,
        rewardTokens: 60,
        startDate: now,
        endDate: monthEnd,
      },
      {
        title: "3 ta turli stansiyaga tashrif",
        description: "Kamida 3 ta turli Eco-stansiyadan foydalaning.",
        period: "MONTHLY",
        goalType: "stations_visited",
        goalValue: 3,
        rewardTokens: 40,
        startDate: now,
        endDate: monthEnd,
      },
      {
        title: "Mahalla maqsadi: 100 kg",
        description: "Jamoa bo'lib shu oy 100 kg chiqindi qayta ishlang.",
        period: "COMMUNITY",
        goalType: "weight_kg",
        goalValue: 100,
        rewardTokens: 20,
        startDate: now,
        endDate: monthEnd,
        isCommunity: true,
      },
    ],
  });

  // Seed a believable recycling + ledger history for the demo user so the
  // dashboard, wallet, and leaderboard are populated out of the box.
  const demoEvents = [
    { material: "PLASTIC", kg: 0.6, stationIdx: 3, daysAgo: 0 },
    { material: "PAPER", kg: 1.2, stationIdx: 0, daysAgo: 1 },
    { material: "GLASS", kg: 0.9, stationIdx: 2, daysAgo: 3 },
    { material: "ALUMINUM", kg: 0.4, stationIdx: 3, daysAgo: 5 },
    { material: "PLASTIC", kg: 0.8, stationIdx: 1, daysAgo: 8 },
  ];

  const ruleByMaterial = Object.fromEntries(REWARD_RULES.map((r) => [r.material, r]));
  let prevHash = "GENESIS";
  let runningBalance = 0;

  for (const [i, ev] of demoEvents.entries()) {
    const rule = ruleByMaterial[ev.material];
    const tokens = Math.round(ev.kg * rule.tokensPerKg);
    const co2 = Math.round(ev.kg * rule.co2PerKg * 100) / 100;
    const createdAt = new Date(now.getTime() - ev.daysAgo * 24 * 60 * 60 * 1000);

    const event = await prisma.recyclingEvent.create({
      data: {
        userId: demoUser.id,
        stationId: stations[ev.stationIdx].id,
        material: ev.material,
        estimatedKg: ev.kg,
        aiConfidence: 95 + i,
        aiMode: "demo",
        status: "VERIFIED",
        tokensAwarded: tokens,
        co2SavedKg: co2,
        verificationCode: `SEED-${demoUser.id.slice(0, 6)}-${i}`,
        createdAt,
      },
    });

    runningBalance += tokens;
    const payload = {
      userId: demoUser.id,
      direction: "CREDIT",
      reason: "RECYCLING_REWARD",
      amount: tokens,
      balanceAfter: runningBalance,
      prevHash,
      ts: createdAt.getTime(),
    };
    const integrityHash = ledgerHash(payload);

    await prisma.tokenTransaction.create({
      data: {
        userId: demoUser.id,
        direction: "CREDIT",
        reason: "RECYCLING_REWARD",
        amount: tokens,
        balanceAfter: runningBalance,
        description: `Recycled ${ev.kg}kg ${ev.material.toLowerCase()}`,
        recyclingEventId: event.id,
        prevHash,
        integrityHash,
        createdAt,
      },
    });
    prevHash = integrityHash;
  }

  await prisma.userAchievement.create({
    data: {
      userId: demoUser.id,
      achievementId: (await prisma.achievement.findUnique({ where: { code: "FIRST_RECYCLE" } })).id,
    },
  });

  // Give the other leaderboard users some events/tokens too, without a
  // full ledger history, since they exist only to populate rankings.
  const otherStats = [
    { user: otherUsers[0], kg: 42.5, tokens: 380 },
    { user: otherUsers[1], kg: 31.0, tokens: 295 },
    { user: otherUsers[2], kg: 15.2, tokens: 120 },
    { user: otherUsers[3], kg: 12.0, tokens: 95 },
  ];

  for (const [idx, stat] of otherStats.entries()) {
    const event = await prisma.recyclingEvent.create({
      data: {
        userId: stat.user.id,
        stationId: stations[0].id,
        material: "PLASTIC",
        estimatedKg: stat.kg,
        aiConfidence: 96,
        aiMode: "demo",
        status: "VERIFIED",
        tokensAwarded: stat.tokens,
        co2SavedKg: Math.round(stat.kg * 1.5 * 100) / 100,
        verificationCode: `SEED-BULK-${idx}`,
      },
    });

    const payload = {
      userId: stat.user.id,
      direction: "CREDIT",
      reason: "RECYCLING_REWARD",
      amount: stat.tokens,
      balanceAfter: stat.tokens,
      prevHash: "GENESIS",
      ts: Date.now(),
    };

    await prisma.tokenTransaction.create({
      data: {
        userId: stat.user.id,
        direction: "CREDIT",
        reason: "RECYCLING_REWARD",
        amount: stat.tokens,
        balanceAfter: stat.tokens,
        description: `Recycled ${stat.kg}kg plastic`,
        recyclingEventId: event.id,
        prevHash: "GENESIS",
        integrityHash: ledgerHash(payload),
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@ecochain.uz / admin1234");
  console.log("Demo login:  demo@ecochain.uz / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
