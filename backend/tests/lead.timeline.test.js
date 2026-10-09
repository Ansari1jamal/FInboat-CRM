jest.mock("../src/config/db", () => ({
  prisma: {
    lead: {
      findUnique: jest.fn(),
    },
    leadStatusHistory: {
      findMany: jest.fn(),
    },
    callLog: {
      findMany: jest.fn(),
    },
    followUp: {
      findMany: jest.fn(),
    },
    leadTransfer: {
      findMany: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
    },
    loanApplication: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    quit: jest.fn().mockResolvedValue("OK"),
    disconnect: jest.fn(),
  },
}));

const { prisma } = require("../src/config/db");
const { getLeadTimeline } = require("../src/modules/leads/lead.timeline.service");

const date = (day) => new Date(`2026-09-${day}T10:00:00.000Z`);

describe("getLeadTimeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    prisma.lead.findUnique.mockResolvedValue({
      id: "lead-1",
      customerName: "Rahul Kumar",
      loanType: "PERSONAL",
      status: "DISBURSED",
      assignedToId: "telecaller-1",
      createdAt: date("01"),
      assignedTo: {
        id: "telecaller-1",
        managerId: "manager-1",
        tlId: "tl-1",
      },
    });

    prisma.leadStatusHistory.findMany.mockResolvedValue([]);
    prisma.callLog.findMany.mockResolvedValue([]);
    prisma.followUp.findMany.mockResolvedValue([]);
    prisma.leadTransfer.findMany.mockResolvedValue([]);
    prisma.document.findMany.mockResolvedValue([]);
    prisma.loanApplication.findMany.mockResolvedValue([]);
  });

  test("combines lead, document, application, and disbursement events newest first", async () => {
    prisma.document.findMany.mockResolvedValue([
      {
        id: "document-1",
        leadId: "lead-1",
        docType: "AADHAAR",
        fileName: "identity.pdf",
        uploadedAt: date("02"),
        createdAt: date("02"),
        uploadedBy: { id: "telecaller-1", name: "Rahul" },
        application: { applicationNumber: "APP-1" },
        statusHistory: [
          {
            id: "document-status-1",
            fromStatus: "RECEIVED",
            toStatus: "VERIFIED",
            createdAt: date("03"),
            changedBy: { id: "admin-1", name: "Admin" },
          },
        ],
      },
    ]);

    prisma.loanApplication.findMany.mockResolvedValue([
      {
        id: "application-1",
        leadId: "lead-1",
        applicationNumber: "APP-1",
        status: "DISBURSED",
        createdAt: date("02"),
        createdBy: { id: "telecaller-1", name: "Rahul" },
        ApplicationStatusHistory: [
          {
            id: "application-created-status",
            fromStatus: null,
            toStatus: "DRAFT",
            note: "Application created",
            createdAt: date("02"),
            changedBy: { id: "telecaller-1", name: "Rahul" },
          },
          {
            id: "application-status-1",
            fromStatus: "APPROVED",
            toStatus: "DISBURSED",
            note: "Loan disbursed",
            createdAt: date("04"),
            changedBy: { id: "admin-1", name: "Admin" },
          },
        ],
        loan_accounts: {
          id: "loan-1",
          disbursedAmount: 250000,
          disbursedAt: date("05"),
          Lender: { name: "Example Bank" },
        },
      },
    ]);

    const timeline = await getLeadTimeline({
      leadId: "lead-1",
      user: { userId: "admin-1", role: "ADMIN" },
    });

    expect(timeline.map((event) => event.type)).toEqual([
      "LOAN_DISBURSED",
      "APPLICATION_STATUS",
      "DOCUMENT_VERIFIED",
      "DOCUMENT_UPLOADED",
      "APPLICATION_CREATED",
      "LEAD_CREATED",
    ]);
    expect(timeline[0].metadata).toMatchObject({
      applicationNumber: "APP-1",
      lender: "Example Bank",
    });
    expect(
      timeline.some((event) => event.id === "application-created-status")
    ).toBe(false);
  });

  test("denies telecallers access to another telecaller's lead", async () => {
    await expect(
      getLeadTimeline({
        leadId: "lead-1",
        user: { userId: "telecaller-2", role: "TELECALLER" },
      })
    ).rejects.toThrow("You are not allowed to view this lead");

    expect(prisma.document.findMany).not.toHaveBeenCalled();
    expect(prisma.loanApplication.findMany).not.toHaveBeenCalled();
  });
});
