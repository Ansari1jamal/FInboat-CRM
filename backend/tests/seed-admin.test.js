jest.mock("../src/config/db", () => ({
  prisma: {
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    quit: jest.fn().mockResolvedValue("OK"),
    disconnect: jest.fn(),
  },
}));

const { validateSeedConfig } = require("../prisma/seed-admin");

describe("validateSeedConfig", () => {
  test("normalizes email and accepts a strong admin password", () => {
    expect(
      validateSeedConfig({
        SEED_ADMIN_EMAIL: " Admin@Example.com ",
        SEED_ADMIN_PASSWORD: "Strong-Admin-Pass-2026",
        SEED_ADMIN_NAME: "Primary Admin",
      })
    ).toEqual({
      email: "admin@example.com",
      password: "Strong-Admin-Pass-2026",
      name: "Primary Admin",
    });
  });

  test("rejects missing or weak production admin credentials", () => {
    expect(() => validateSeedConfig({})).toThrow(
      "SEED_ADMIN_EMAIL must be a valid email address"
    );

    expect(() =>
      validateSeedConfig({
        SEED_ADMIN_EMAIL: "admin@example.com",
        SEED_ADMIN_PASSWORD: "Weak123!",
      })
    ).toThrow("SEED_ADMIN_PASSWORD must be at least 16 characters");
  });
});
