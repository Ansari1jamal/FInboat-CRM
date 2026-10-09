const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

const createTeam = async ({
  name,
  managerId,
  tlId,
}) => {
  if (!name) {
    throw new ApiError(
      400,
      "Team name is required"
    );
  }

  if (managerId) {
    const manager =
      await prisma.user.findUnique({
        where: {
          id: managerId,
        },
      });

    if (!manager) {
      throw new ApiError(
        404,
        "Manager not found"
      );
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(
        400,
        "Selected user is not a manager"
      );
    }
  }

  if (tlId) {
    const tl =
      await prisma.user.findUnique({
        where: {
          id: tlId,
        },
      });

    if (!tl) {
      throw new ApiError(
        404,
        "TL not found"
      );
    }

    if (tl.role !== "TL") {
      throw new ApiError(
        400,
        "Selected user is not a TL"
      );
    }
  }

  const team =
    await prisma.team.create({
      data: {
        name,
        managerId,
        tlId,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tl: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  return team;
};

const getTeams = async () => {
  return prisma.team.findMany({
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tl: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          leads: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTeamById = async (id) => {
  const team =
    await prisma.team.findUnique({
      where: {
        id,
      },
      include: {
        manager: true,
        tl: true,
        leads: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            status: true,
          },
        },
      },
    });

  if (!team) {
    throw new ApiError(
      404,
      "Team not found"
    );
  }

  return team;
};

const updateTeam = async (
  id,
  { name, managerId, tlId }
) => {
  const team =
    await prisma.team.findUnique({
      where: {
        id,
      },
    });

  if (!team) {
    throw new ApiError(
      404,
      "Team not found"
    );
  }

  return prisma.team.update({
    where: {
      id,
    },
    data: {
      name,
      managerId,
      tlId,
    },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
        },
      },
      tl: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const deleteTeam = async (id) => {
  const team =
    await prisma.team.findUnique({
      where: {
        id,
      },
    });

  if (!team) {
    throw new ApiError(
      404,
      "Team not found"
    );
  }

  const leadCount =
    await prisma.lead.count({
      where: {
        teamId: id,
      },
    });

  if (leadCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete a team that has leads"
    );
  }

  await prisma.team.delete({
    where: {
      id,
    },
  });

  return null;
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};