
const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

const Decimal = Prisma.Decimal;
const roundMoney = (value) =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

const {
  calculateEMI,
} = require("./emi.calculator");

// ======================================
// CHECK LOAN ACCESS
// ======================================

const checkLoanAccess = ({
  loan,
  user,
}) => {
  // ====================================
  // CHECK AUTHENTICATED USER
  // ====================================

  if (!user) {
    throw new ApiError(401,
      "Authenticated user information is missing"
    );
  }

  if (!user.userId || !user.role) {
    throw new ApiError(401,
      "Invalid authenticated user information"
    );
  }

  // ====================================
  // ADMIN
  // ====================================

  if (user.role === "ADMIN") {
    return true;
  }

  // ====================================
  // MANAGER
  // ====================================

  if (
    user.role === "MANAGER" &&
    loan.leads.assignedTo?.managerId ===
      user.userId
  ) {
    return true;
  }

  // ====================================
  // TL
  // ====================================

  if (
    user.role === "TL" &&
    loan.leads.assignedTo?.tlId ===
      user.userId
  ) {
    return true;
  }

  // ====================================
  // TELECALLER
  // ====================================

  if (
    user.role === "TELECALLER" &&
    loan.leads.assignedToId ===
      user.userId
  ) {
    return true;
  }

  throw new ApiError(403,
    "Unauthorized access"
  );
};

// ======================================
// 28.10 GENERATE EMI SCHEDULE
// ======================================

const generateEmiSchedule = async ({
  loanAccountId,
  interestRate,
  tenureMonths,
  firstEmiDate,
  user,
}) => {
  // ====================================
  // VALIDATE USER
  // ====================================

  if (!user) {
    throw new ApiError(401,
      "Authenticated user information is missing"
    );
  }

  // ====================================
  // FIND LOAN
  // ====================================

  const loan =
    await prisma.loanAccount.findUnique({
      where: {
        id: loanAccountId,
      },

      include: {
        leads: {
          include: {
            assignedTo: true,
          },
        },
      },
    });

  if (!loan) {
    throw new ApiError(404,
      "Loan account not found"
    );
  }

  // ====================================
  // CHECK ACCESS
  // ====================================

  checkLoanAccess({
    loan,
    user,
  });

  // ====================================
  // CHECK LOAN STATUS
  // ====================================

  if (loan.status !== "ACTIVE") {
    throw new ApiError(400,
      "EMI schedule can only be generated for ACTIVE loans"
    );
  }

  // ====================================
  // VALIDATE TENURE
  // ====================================

  tenureMonths = Number(tenureMonths);

  if (
    !Number.isInteger(tenureMonths) ||
    tenureMonths <= 0
  ) {
    throw new ApiError(400,
      "Tenure months must be a positive number"
    );
  }

  // ====================================
  // VALIDATE INTEREST
  // ====================================

  let annualRate;

  try {
    annualRate = new Decimal(interestRate);
  } catch {
    throw new ApiError(400, "Interest rate must be a valid number");
  }

  if (
    !annualRate.isFinite() ||
    annualRate.isNegative()
  ) {
    throw new ApiError(400,
      "Interest rate cannot be negative"
    );
  }

  // ====================================
  // CHECK EXISTING SCHEDULE
  // ====================================

  const existingSchedule =
    await prisma.emiSchedule.count({
      where: {
        loanAccountId,
      },
    });

  if (existingSchedule > 0) {
    throw new ApiError(409,
      "EMI schedule already exists"
    );
  }

  // ====================================
  // PRINCIPAL
  // ====================================

  const principal = new Decimal(loan.disbursedAmount.toString());

  if (
    !principal.isFinite() ||
    !principal.isPositive()
  ) {
    throw new ApiError(400,
      "Invalid disbursed amount"
    );
  }

  // ====================================
  // FIRST EMI DATE
  // ====================================

  const startDate =
    new Date(firstEmiDate);

  if (
    Number.isNaN(
      startDate.getTime()
    )
  ) {
    throw new ApiError(400,
      "Invalid first EMI date"
    );
  }

  // ====================================
  // CALCULATE EMI
  // ====================================

  const emi =
    calculateEMI({
      principal,
      annualInterestRate: annualRate,
      tenureMonths,
    });

  const monthlyRate = annualRate.dividedBy(1200);

  let balance = principal;

  const schedules = [];

  // ====================================
  // GENERATE MONTHLY SCHEDULE
  // ====================================

  for (
    let i = 1;
    i <= tenureMonths;
    i++
  ) {
    const dueDate = new Date(startDate);
    const originalDay = startDate.getDate();
    dueDate.setDate(1);
    dueDate.setMonth(startDate.getMonth() + (i - 1));
    const finalDayOfMonth = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth() + 1,
      0
    ).getDate();
    dueDate.setDate(Math.min(originalDay, finalDayOfMonth));

    let interestAmount = new Decimal(0);
    let principalAmount = new Decimal(0);
    let currentEmi = emi;

    // ==================================
    // ZERO INTEREST
    // ==================================

    if (
      monthlyRate.isZero()
    ) {
      principalAmount =
        balance;

      currentEmi =
        principalAmount;

      interestAmount = 0;
    }

    // ==================================
    // NORMAL INTEREST
    // ==================================

    else {
      interestAmount = roundMoney(balance.times(monthlyRate));
      principalAmount = roundMoney(emi.minus(interestAmount));

      // =================================
      // LAST EMI ROUNDING ADJUSTMENT
      // =================================

      if (
        i === tenureMonths
      ) {
        principalAmount =
          balance;

        currentEmi = roundMoney(principalAmount.plus(interestAmount));
      }
    }

    // ==================================
    // ROUND VALUES
    // ==================================

    // ==================================
    // PREVENT NEGATIVE PRINCIPAL
    // ==================================

    if (
      principalAmount.isNegative()
    ) {
      principalAmount = new Decimal(0);
    }

    // ==================================
    // UPDATE BALANCE
    // ==================================

    balance = roundMoney(balance.minus(principalAmount));

    if (
      balance.isNegative()
    ) {
      balance = new Decimal(0);
    }

    // ==================================
    // PUSH SCHEDULE
    // ==================================

    schedules.push({
      loanAccountId,

      emiNumber:
        i,

      dueDate,

      principalAmount,

      interestAmount,

      emiAmount:
        currentEmi,

      paidAmount: new Decimal(0),

      outstandingAmount:
        currentEmi,

      status:
        "PENDING",
    });
  }

  // ====================================
  // CREATE ALL EMI RECORDS
  // ====================================

  await prisma.emiSchedule.createMany({
    data: schedules,
  });

  // ====================================
  // RETURN SCHEDULE
  // ====================================

  return prisma.emiSchedule.findMany({
    where: {
      loanAccountId,
    },

    orderBy: {
      emiNumber: "asc",
    },
  });
};

// ======================================
// 28.12 GET EMI SCHEDULE
// ======================================

const getEmiSchedule = async ({
  loanAccountId,
  user,
}) => {
  // ====================================
  // VALIDATE USER
  // ====================================

  if (!user) {
    throw new ApiError(401,
      "Authenticated user information is missing"
    );
  }

  // ====================================
  // FIND LOAN
  // ====================================

  const loan =
    await prisma.loanAccount.findUnique({
      where: {
        id: loanAccountId,
      },

      include: {
        leads: {
          include: {
            assignedTo: true,
          },
        },
      },
    });

  if (!loan) {
    throw new ApiError(404,
      "Loan account not found"
    );
  }

  // ====================================
  // CHECK ACCESS
  // ====================================

  checkLoanAccess({
    loan,
    user,
  });

  // ====================================
  // GET EMI SCHEDULE
  // ====================================

  const items = await prisma.emiSchedule.findMany({
    where: {
      loanAccountId,
    },

    orderBy: {
      emiNumber: "asc",
    },

    include: {
      repayments: {
        orderBy: {
          paymentDate: "desc",
        },
      },
    },
  });

  return {
    loan: {
      id: loan.id,
      loanAccountNumber: loan.loanAccountNumber,
    },
    items,
  };
};

const getRepayments = async ({
  loanAccountId,
  page = 1,
  limit = 20,
  user,
}) => {
  const loan = await prisma.loanAccount.findUnique({
    where: { id: loanAccountId },
    include: {
      leads: {
        include: {
          assignedTo: true,
        },
      },
    },
  });

  if (!loan) {
    throw new ApiError(404, "Loan account not found");
  }

  checkLoanAccess({ loan, user });

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const where = { loanAccountId };
  const [items, total] = await Promise.all([
    prisma.repayment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { paymentDate: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        emiSchedule: {
          select: {
            id: true,
            emiNumber: true,
          },
        },
        receivedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.repayment.count({ where }),
  ]);

  return {
    loan: {
      id: loan.id,
      loanAccountNumber: loan.loanAccountNumber,
    },
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRepaymentById = async ({
  loanAccountId,
  repaymentId,
  user,
}) => {
  const loan = await prisma.loanAccount.findUnique({
    where: { id: loanAccountId },
    include: {
      leads: {
        include: {
          assignedTo: true,
        },
      },
    },
  });

  if (!loan) {
    throw new ApiError(404, "Loan account not found");
  }

  checkLoanAccess({ loan, user });

  const repayment = await prisma.repayment.findFirst({
    where: {
      id: repaymentId,
      loanAccountId,
    },
    include: {
      emiSchedule: {
        select: {
          id: true,
          emiNumber: true,
        },
      },
      receivedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!repayment) {
    throw new ApiError(404, "Repayment not found");
  }

  return repayment;
};

// ======================================
// 28.13 CREATE REPAYMENT
// ======================================

const createRepayment = async ({
  loanAccountId,
  emiScheduleId,
  amount,
  paymentDate,
  paymentMode,
  transactionId,
  referenceNumber,
  remarks,
  user,
}) => {
  // ====================================
  // VALIDATE USER
  // ====================================

  if (!user) {
    throw new ApiError(401,
      "Authenticated user information is missing"
    );
  }

  // ====================================
  // FIND LOAN
  // ====================================

  const loan =
    await prisma.loanAccount.findUnique({
      where: {
        id: loanAccountId,
      },

      include: {
        leads: {
          include: {
            assignedTo: true,
          },
        },
      },
    });

  if (!loan) {
    throw new ApiError(404,
      "Loan account not found"
    );
  }

  // ====================================
  // CHECK ACCESS
  // ====================================

  checkLoanAccess({
    loan,
    user,
  });

  // ====================================
  // CHECK LOAN STATUS
  // ====================================

  if (
    loan.status !== "ACTIVE"
  ) {
    throw new ApiError(400,
      "Repayment can only be added for ACTIVE loan"
    );
  }

  // ====================================
  // VALIDATE AMOUNT
  // ====================================

  let rawPaymentAmount;

  try {
    rawPaymentAmount = new Decimal(amount);
  } catch {
    throw new ApiError(400, "Repayment amount must be a valid number");
  }

  if (
    !rawPaymentAmount.isFinite() ||
    !rawPaymentAmount.isPositive()
  ) {
    throw new ApiError(400,
      "Repayment amount must be greater than 0"
    );
  }

  if (rawPaymentAmount.decimalPlaces() > 2) {
    throw new ApiError(400, "Repayment amount cannot have more than two decimal places");
  }

  const paymentAmount = roundMoney(rawPaymentAmount);

  // ====================================
  // FIND EMI
  // ====================================

  const result = await prisma.$transaction(async (tx) => {
    const emi = await tx.emiSchedule.findUnique({
      where: { id: emiScheduleId },
    });

    if (!emi) {
      throw new ApiError(404, "EMI schedule not found");
    }

    if (emi.loanAccountId !== loanAccountId) {
      throw new ApiError(400, "EMI does not belong to this loan");
    }

    if (["PAID", "WAIVED"].includes(emi.status)) {
      throw new ApiError(400, "This EMI is already completed");
    }

    const currentOutstanding = new Decimal(emi.outstandingAmount.toString());
    if (paymentAmount.greaterThan(currentOutstanding)) {
      throw new ApiError(400, `Maximum payable amount is ${currentOutstanding.toFixed(2)}`);
    }

    const newPaidAmount = roundMoney(
      new Decimal(emi.paidAmount.toString()).plus(paymentAmount)
    );
    const newOutstanding = roundMoney(
      new Decimal(emi.emiAmount.toString()).minus(newPaidAmount)
    );
    const newStatus = newOutstanding.isZero() ? "PAID" : "PARTIAL";

    const repayment = await tx.repayment.create({
      data: {
        loanAccountId,
        emiScheduleId,
        amount: paymentAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode,
        transactionId,
        referenceNumber,
        remarks,
        receivedById: user.userId,
      },
    });

    const updateResult = await tx.emiSchedule.updateMany({
      where: {
        id: emiScheduleId,
        loanAccountId,
        outstandingAmount: emi.outstandingAmount,
      },
      data: {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstanding,
        status: newStatus,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    });

    if (updateResult.count !== 1) {
      throw new ApiError(
        409,
        "EMI balance changed while recording payment. Refresh and retry."
      );
    }

    const updatedEmi = await tx.emiSchedule.findUnique({
      where: { id: emiScheduleId },
    });

    return { repayment, emi: updatedEmi };
  });

  return result;
};

// ======================================
// 28.14 MARK OVERDUE EMIs
// ======================================

const markOverdueEmis =
  async () => {
    const now =
      new Date();

    const result =
      await prisma.emiSchedule.updateMany({
        where: {
          dueDate: {
            lt: now,
          },

          status: {
            in: [
              "PENDING",
              "PARTIAL",
            ],
          },
        },

        data: {
          status:
            "OVERDUE",
        },
      });

    return {
      updated:
        result.count,
    };
  };

// ======================================
// 28.15 LOAN REPAYMENT SUMMARY
// ======================================

const getLoanRepaymentSummary =
  async ({
    loanAccountId,
    user,
  }) => {
    // ==================================
    // VALIDATE USER
    // ==================================

    if (!user) {
      throw new ApiError(401,
        "Authenticated user information is missing"
      );
    }

    // ==================================
    // FIND LOAN
    // ==================================

    const loan =
      await prisma.loanAccount.findUnique({
        where: {
          id: loanAccountId,
        },

        include: {
          leads: {
            include: {
              assignedTo: true,
            },
          },
        },
      });

    if (!loan) {
      throw new ApiError(404,
        "Loan account not found"
      );
    }

    // ==================================
    // CHECK ACCESS
    // ==================================

    checkLoanAccess({
      loan,
      user,
    });

    // ==================================
    // GET EMIs
    // ==================================

    const emis =
      await prisma.emiSchedule.findMany({
        where: {
          loanAccountId,
        },
      });

    // ==================================
    // TOTAL EMI AMOUNT
    // ==================================

    const totalEmiAmount = emis.reduce(
      (sum, emi) => sum.plus(emi.emiAmount.toString()),
      new Decimal(0)
    );

    // ==================================
    // TOTAL PAID
    // ==================================

    const totalPaid = emis.reduce(
      (sum, emi) => sum.plus(emi.paidAmount.toString()),
      new Decimal(0)
    );

    // ==================================
    // TOTAL OUTSTANDING
    // ==================================

    const totalOutstanding = emis.reduce(
      (sum, emi) => sum.plus(emi.outstandingAmount.toString()),
      new Decimal(0)
    );

    // ==================================
    // PAID EMIs
    // ==================================

    const paidEmis =
      emis.filter(
        (emi) =>
          emi.status ===
          "PAID"
      ).length;

    // ==================================
    // OVERDUE EMIs
    // ==================================

    const overdueEmis =
      emis.filter(
        (emi) =>
          emi.status ===
          "OVERDUE"
      ).length;

    // ==================================
    // PENDING EMIs
    // ==================================

    const pendingEmis =
      emis.filter(
        (emi) =>
          [
            "PENDING",
            "PARTIAL",
          ].includes(
            emi.status
          )
      ).length;

    // ==================================
    // RETURN SUMMARY
    // ==================================

    return {
      loanAccountId,

      totalEmis:
        emis.length,

      paidEmis,

      pendingEmis,

      overdueEmis,

      totalEmiAmount:
        Number(roundMoney(totalEmiAmount).toFixed(2)),

      totalPaid:
        Number(roundMoney(totalPaid).toFixed(2)),

      totalOutstanding:
        Number(roundMoney(totalOutstanding).toFixed(2)),
    };
  };

// ======================================
// EXPORTS
// ======================================

module.exports = {
  generateEmiSchedule,
  getEmiSchedule,
  getRepayments,
  getRepaymentById,
  createRepayment,
  markOverdueEmis,
  getLoanRepaymentSummary,
};
