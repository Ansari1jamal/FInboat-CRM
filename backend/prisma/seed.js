if (process.env.NODE_ENV === "production") {
  console.error(
    "The demo seed is disabled in production. Run `npm run seed:admin` to create only the initial admin."
  );
  process.exit(1);
}

const bcrypt = require("bcryptjs");

const { prisma } = require("../src/config/db");

const isProduction =
  process.env.NODE_ENV === "production";

const getSeedValue = (
  name,
  fallback
) => {
  const value = process.env[name] || fallback;

  if (isProduction && !process.env[name]) {
    throw new Error(
      `${name} must be set when NODE_ENV=production`
    );
  }

  return value;
};

const seedUsers = [
  {
    key: "ADMIN",
    name: "FinBoat Admin",
    role: "ADMIN",
    email: getSeedValue(
      "SEED_ADMIN_EMAIL",
      "admin@finboat.com"
    ),
    password: getSeedValue(
      "SEED_ADMIN_PASSWORD",
      "ChangeMe@123"
    ),
  },
  {
    key: "MANAGER",
    name: "Demo Manager",
    role: "MANAGER",
    email: getSeedValue(
      "SEED_MANAGER_EMAIL",
      "manager@finboat.com"
    ),
    password: getSeedValue(
      "SEED_MANAGER_PASSWORD",
      "ChangeMe@123"
    ),
  },
  {
    key: "TL",
    name: "Demo TL",
    role: "TL",
    email: getSeedValue(
      "SEED_TL_EMAIL",
      "tl@finboat.com"
    ),
    password: getSeedValue(
      "SEED_TL_PASSWORD",
      "ChangeMe@123"
    ),
  },
  {
    key: "TELECALLER",
    name: "Demo Telecaller",
    role: "TELECALLER",
    email: getSeedValue(
      "SEED_TELECALLER_EMAIL",
      "telecaller@finboat.com"
    ),
    password: getSeedValue(
      "SEED_TELECALLER_PASSWORD",
      "ChangeMe@123"
    ),
  },
];

const masterData = [
  ["LOAN_TYPE", "PERSONAL", "Personal Loan"],
  ["LOAN_TYPE", "HOME", "Home Loan"],
  ["LOAN_TYPE", "BUSINESS", "Business Loan"],
  ["LOAN_TYPE", "CAR", "Car Loan"],
  ["LOAN_TYPE", "EDUCATION", "Education Loan"],
  ["LEAD_SOURCE", "WEBSITE", "Website"],
  ["LEAD_SOURCE", "REFERRAL", "Referral"],
  ["LEAD_SOURCE", "FACEBOOK", "Facebook"],
  ["LEAD_SOURCE", "INSTAGRAM", "Instagram"],
  ["LEAD_SOURCE", "WALK_IN", "Walk In"],
  ["LEAD_SOURCE", "IMPORT", "Bulk Import"],
  ["DOCUMENT_TYPE", "AADHAAR", "Aadhaar"],
  ["DOCUMENT_TYPE", "PAN", "PAN Card"],
  ["DOCUMENT_TYPE", "BANK_STATEMENT", "Bank Statement"],
  ["DOCUMENT_TYPE", "SALARY_SLIP", "Salary Slip"],
  ["DOCUMENT_TYPE", "ADDRESS_PROOF", "Address Proof"],
  ["DOCUMENT_TYPE", "IDENTITY_PROOF", "Identity Proof"],
  ["DOCUMENT_TYPE", "PHOTO", "Photograph"],
  ["DOCUMENT_TYPE", "OTHER", "Other"],
];

const hashPassword = (password) =>
  bcrypt.hash(password, 12);

const upsertUser = async ({
  user,
  managerId,
  tlId,
}) => {
  const existing = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  const data = {
    name: user.name,
    role: user.role,
    isActive: true,
    managerId: managerId || null,
    tlId: tlId || null,
  };

  if (existing) {
    return prisma.user.update({
      where: {
        id: existing.id,
      },
      data,
    });
  }

  return prisma.user.create({
    data: {
      ...data,
      email: user.email,
      passwordHash: await hashPassword(
        user.password
      ),
    },
  });
};

async function main() {
  console.log("FinBoat seed started");

  const admin = await upsertUser({
    user: seedUsers[0],
  });

  const manager = await upsertUser({
    user: seedUsers[1],
  });

  const tl = await upsertUser({
    user: seedUsers[2],
    managerId: manager.id,
  });

  const telecaller = await upsertUser({
    user: seedUsers[3],
    tlId: tl.id,
  });

  const existingTeam = await prisma.team.findFirst({
    where: {
      name: "Demo Team",
    },
  });

  const team = existingTeam
    ? await prisma.team.update({
        where: {
          id: existingTeam.id,
        },
        data: {
          managerId: manager.id,
          tlId: tl.id,
        },
      })
    : await prisma.team.create({
        data: {
          name: "Demo Team",
          managerId: manager.id,
          tlId: tl.id,
        },
      });

  for (const [index, [category, code, name]] of masterData.entries()) {
    await prisma.masterData.upsert({
      where: {
        category_code: {
          category,
          code,
        },
      },
      update: {
        name,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        category,
        code,
        name,
        sortOrder: index + 1,
        isActive: true,
      },
    });
  }

  console.log("FinBoat seed completed", {
    adminId: admin.id,
    managerId: manager.id,
    tlId: tl.id,
    telecallerId: telecaller.id,
    teamId: team.id,
    masterDataCount: masterData.length,
  });
}

main()
  .catch((error) => {
    console.error("\nDevelopment seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });