const { prisma } = require("../../config/db");

const createLender = async ({
  name,
  code,
}) => {
  const existing =
    await prisma.lender.findUnique({
      where: {
        code,
      },
    });

  if (existing) {
    throw new Error(
      "Lender code already exists"
    );
  }

  return prisma.lender.create({
    data: {
      name,
      code: code.toUpperCase(),
    },
  });
};

const getLenders = async () => {
  return prisma.lender.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const updateLender = async ({
  id,
  name,
  isActive,
}) => {
  return prisma.lender.update({
    where: {
      id,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(isActive !== undefined && {
        isActive,
      }),
    },
  });
};

module.exports = {
  createLender,
  getLenders,
  updateLender,
};