jest.mock("../src/config/db", () => ({
  prisma: {
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    disconnect: jest.fn(),
  },
}));

jest.mock("../src/modules/audit/audit.service", () => ({
  createAuditLog: jest.fn(),
}));

jest.mock("../src/modules/leads/lead.duplicateCheck", () => ({
  normalizeMobile: jest.fn(),
  findDuplicateLead: jest.fn(),
}));

jest.mock("../src/modules/leads/lead.authorization", () => ({
  canAssignLeadToUser: jest.fn(),
}));

const { prisma } = require("../src/config/db");
const { getLeads } = require("../src/modules/leads/lead.service");

describe("getLeads role scope", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.lead.findMany.mockResolvedValue([]);
    prisma.lead.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation((queries) => Promise.all(queries));
  });

  test("prevents telecallers from overriding their assigned-lead scope", async () => {
    await expect(
      getLeads({
        user: { userId: "caller-1", role: "TELECALLER" },
        assignedToId: "caller-2",
      })
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(prisma.lead.findMany).not.toHaveBeenCalled();
  });

  test("keeps the caller's scope when filtering their own leads", async () => {
    await getLeads({
      user: { userId: "caller-1", role: "TELECALLER" },
      assignedToId: "caller-1",
    });

    expect(prisma.lead.findMany.mock.calls[0][0].where).toMatchObject({
      assignedToId: "caller-1",
    });
  });

  test("rejects unknown roles instead of returning an unscoped list", async () => {
    await expect(
      getLeads({
        user: { userId: "user-1", role: "UNKNOWN" },
      })
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(prisma.lead.findMany).not.toHaveBeenCalled();
  });
});
