require("dotenv").config();

const validateSeedConfig = (env = process.env) => {
  const email = env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.SEED_ADMIN_PASSWORD;
  const name = env.SEED_ADMIN_NAME?.trim() || "FinBoat Admin";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("SEED_ADMIN_EMAIL must be a valid email address");
  }

  if (
    !password ||
    password.length < 16 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be at least 16 characters and include uppercase, lowercase, a number, and a symbol"
    );
  }

  if (name.length < 2) {
    throw new Error("SEED_ADMIN_NAME must be at least 2 characters");
  }

  return { email, password, name };
};

const main = async () => {
  const config = validateSeedConfig();
  const bcrypt = require("bcryptjs");
  const { prisma } = require("../src/config/db");

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: config.email },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (existingUser) {
      if (existingUser.role !== "ADMIN") {
        throw new Error(
          "SEED_ADMIN_EMAIL is already assigned to a non-admin account; no changes were made"
        );
      }

      if (!existingUser.isActive) {
        throw new Error(
          "The existing admin account is inactive; reactivate it through the approved admin process"
        );
      }

      console.log("Initial admin already exists; no changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(config.password, 12);

    await prisma.user.create({
      data: {
        name: config.name,
        email: config.email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log("Initial admin created successfully.");
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error("Initial admin seed failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { validateSeedConfig };
