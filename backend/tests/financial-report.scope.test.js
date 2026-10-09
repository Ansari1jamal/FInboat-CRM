jest.mock("../src/config/db", () => ({
  prisma: {
    loanAccount: { findMany: jest.fn().mockResolvedValue([]) },
    repayment: { findMany: jest.fn().mockResolvedValue([]) },
    emiSchedule: { findMany: jest.fn().mockResolvedValue([]) },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../src/config/redis", () => ({
  redisConnection: {
    disconnect: jest.fn(),
  },
}));

const { prisma } = require("../src/config/db");
const {
  getFinancialReportSummary,
  getRepaymentReport,
  getEmiReport,
  getCollectionReport,
} = require("../src/modules/reports/report.service");

describe("financial report relation scopes", () => {
  const user = { userId: "manager-1", role: "MANAGER" };
  const leadScope = {
    assignedTo: { managerId: "manager-1" },
  };
  const loanScope = {
    leads: leadScope,
  };
  const emiScope = {
    loan_accounts: loanScope,
  };
  const repaymentScope = {
    loan_accounts: loanScope,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.loanAccount.findMany.mockResolvedValue([]);
    prisma.repayment.findMany.mockResolvedValue([]);
    prisma.emiSchedule.findMany.mockResolvedValue([]);
  });

  test("builds query scopes using the Prisma relation field names", () => {
    const {
      getReportLoanScope,
      getReportEmiScope,
      getReportRepaymentScope,
    } = require("../src/modules/reports/report.service");

    expect(getReportLoanScope(user)).toEqual(loanScope);
    expect(getReportEmiScope(user)).toEqual(emiScope);
    expect(getReportRepaymentScope(user)).toEqual(repaymentScope);
  });

  test("uses valid scopes across all financial report queries", async () => {
    await getFinancialReportSummary({ user });
    await getRepaymentReport({ user });
    await getEmiReport({ user });
    await getCollectionReport({ user });

    expect(prisma.loanAccount.findMany.mock.calls[0][0].where).toMatchObject(
      loanScope
    );
    expect(
      prisma.repayment.findMany.mock.calls.every(
        ([query]) =>
          query.where.loan_accounts.leads.assignedTo.managerId === "manager-1"
      )
    ).toBe(true);
    expect(
      prisma.emiSchedule.findMany.mock.calls.every(
        ([query]) =>
          query.where.loan_accounts.leads.assignedTo.managerId === "manager-1"
      )
    ).toBe(true);
  });
});
