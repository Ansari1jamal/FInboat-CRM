jest.mock("../src/config/db", () => ({
  prisma: {
    loanAccount: {
      findUnique: jest.fn(),
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

const { Prisma } = require("@prisma/client");
const { prisma } = require("../src/config/db");
const { createRepayment } = require("../src/modules/repayments/repayment.service");

const Decimal = Prisma.Decimal;

describe("createRepayment financial arithmetic", () => {
  let tx;
  let emi;

  beforeEach(() => {
    jest.clearAllMocks();
    emi = {
      id: "emi-1",
      loanAccountId: "loan-1",
      emiAmount: new Decimal("10000.00"),
      paidAmount: new Decimal("0.00"),
      outstandingAmount: new Decimal("10000.00"),
      status: "PENDING",
    };

    tx = {
      emiSchedule: {
        findUnique: jest.fn().mockResolvedValue(emi),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      repayment: {
        create: jest.fn().mockResolvedValue({ id: "repayment-1" }),
      },
    };

    prisma.loanAccount.findUnique.mockResolvedValue({
      status: "ACTIVE",
      leads: { assignedToId: "caller-1" },
    });
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  const recordPayment = (amount) =>
    createRepayment({
      loanAccountId: "loan-1",
      emiScheduleId: "emi-1",
      amount,
      paymentMode: "CASH",
      user: { userId: "admin-1", role: "ADMIN" },
    });

  test("records a partial payment with exact decimal balances", async () => {
    await recordPayment("4000.00");

    const update = tx.emiSchedule.updateMany.mock.calls[0][0];
    expect(update.data.paidAmount.toFixed(2)).toBe("4000.00");
    expect(update.data.outstandingAmount.toFixed(2)).toBe("6000.00");
    expect(update.data.status).toBe("PARTIAL");
    expect(update.where.outstandingAmount.toFixed(2)).toBe("10000.00");
  });

  test("marks the EMI paid when the exact remaining balance is received", async () => {
    emi.paidAmount = new Decimal("4000.00");
    emi.outstandingAmount = new Decimal("6000.00");

    await recordPayment("6000.00");

    const update = tx.emiSchedule.updateMany.mock.calls[0][0];
    expect(update.data.paidAmount.toFixed(2)).toBe("10000.00");
    expect(update.data.outstandingAmount.toFixed(2)).toBe("0.00");
    expect(update.data.status).toBe("PAID");
  });

  test("rejects a stale balance instead of creating an unbalanced repayment", async () => {
    tx.emiSchedule.updateMany.mockResolvedValue({ count: 0 });

    await expect(recordPayment("4000.00")).rejects.toMatchObject({
      statusCode: 409,
      message: "EMI balance changed while recording payment. Refresh and retry.",
    });
  });

  test("rejects payment amounts with sub-paisa precision", async () => {
    await expect(recordPayment("0.001")).rejects.toMatchObject({
      statusCode: 400,
      message: "Repayment amount cannot have more than two decimal places",
    });
  });
});
