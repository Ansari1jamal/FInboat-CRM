const { prisma } = require("../../config/db");

const normalizeMobile = (mobile) => {
  if (!mobile) return null;

  return String(mobile)
    .replace(/\D/g, "")
    .slice(-10);
};

const findDuplicateLead = async (mobile) => {
  const normalizedMobile = normalizeMobile(mobile);

  if (!normalizedMobile) {
    return null;
  }

  const lead = await prisma.lead.findFirst({
    where: {
      mobile: normalizedMobile,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return lead;
};

module.exports = {
  normalizeMobile,
  findDuplicateLead,
};