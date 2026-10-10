export const ROLES = ["USER", "PARTNER", "ADMIN"];

export const MATERIALS = [
  "PLASTIC",
  "PAPER",
  "GLASS",
  "ALUMINUM",
  "ORGANIC",
  "ELECTRONIC",
];

export const MATERIAL_META = {
  PLASTIC: { icon: "bottle", tokensPerKg: 12, co2PerKg: 1.5 },
  PAPER: { icon: "box", tokensPerKg: 8, co2PerKg: 0.9 },
  GLASS: { icon: "wine", tokensPerKg: 6, co2PerKg: 0.3 },
  ALUMINUM: { icon: "cylinder", tokensPerKg: 20, co2PerKg: 9.0 },
  ORGANIC: { icon: "leaf", tokensPerKg: 3, co2PerKg: 0.2 },
  ELECTRONIC: { icon: "cpu", tokensPerKg: 35, co2PerKg: 4.0 },
};

export const EVENT_STATUSES = ["PENDING", "VERIFIED", "REJECTED"];
export const TX_DIRECTIONS = ["CREDIT", "DEBIT"];
export const TX_REASONS = [
  "RECYCLING_REWARD",
  "REWARD_REDEMPTION",
  "CHALLENGE_REWARD",
  "ADMIN_ADJUSTMENT",
];
export const REDEMPTION_STATUSES = ["ACTIVE", "USED", "EXPIRED"];
export const CHALLENGE_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "COMMUNITY"];

export const LANGUAGES = ["uz", "ru", "en"];

export const SESSION_COOKIE_NAME = "ecochain_session";
export const SESSION_TTL_DAYS = 30;
