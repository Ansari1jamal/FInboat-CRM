
const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

// ======================================================
// DATE RANGE HELPER
// ======================================================
//
// Supported:
//
// 1. Specific date
//    date=2026-09-08
//
// 2. Custom range
//    from=2026-09-01&to=2026-09-08
//
// 3. Monthly
//    period=2026-09
//
// 4. Default
//    Current month
//
// We use:
//   gte: start
//   lt: end
//
// This avoids end-of-day problems.
// ======================================================

const getDateRange = ({
  period,
  date,
  from,
  to,
}) => {
  // ----------------------------------------
  // Specific Date
  // ----------------------------------------

  if (date) {
    const start = new Date(`${date}T00:00:00`);

    if (Number.isNaN(start.getTime())) {
      throw new ApiError(
        400,
        "Invalid date. Use YYYY-MM-DD format"
      );
    }

    const end = new Date(start);

    end.setDate(end.getDate() + 1);

    return {
      start,
      end,
    };
  }

  // ----------------------------------------
  // Custom Range
  // ----------------------------------------

  if (from || to) {
    let start;
    let end;

    if (from) {
      start = new Date(`${from}T00:00:00`);

      if (Number.isNaN(start.getTime())) {
        throw new ApiError(
          400,
          "Invalid from date. Use YYYY-MM-DD format"
        );
      }
    } else {
      start = new Date("1970-01-01T00:00:00");
    }

    if (to) {
      end = new Date(`${to}T00:00:00`);

      if (Number.isNaN(end.getTime())) {
        throw new ApiError(
          400,
          "Invalid to date. Use YYYY-MM-DD format"
        );
      }

      // Make end exclusive by moving to next day
      end.setDate(end.getDate() + 1);
    } else {
      end = new Date();
    }

    if (start >= end) {
      throw new ApiError(
        400,
        "from date must be before to date"
      );
    }

    return {
      start,
      end,
    };
  }

  // ----------------------------------------
  // Monthly Period
  // ----------------------------------------

  if (period) {
    const match = /^(\d{4})-(\d{2})$/.exec(
      period
    );

    if (!match) {
      throw new ApiError(
        400,
        "period must be in YYYY-MM format"
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    if (month < 1 || month > 12) {
      throw new ApiError(
        400,
        "Invalid month"
      );
    }

    const start = new Date(
      year,
      month - 1,
      1
    );

    const end = new Date(
      year,
      month,
      1
    );

    return {
      start,
      end,
    };
  }

  // ----------------------------------------
  // Default = Current Month
  // ----------------------------------------

  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  return {
    start,
    end,
  };
};

// ======================================================
// ROLE BASED LEAD SCOPE
// ======================================================

const getLeadScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(
      401,
      "Authenticated user information is missing"
    );
  }

  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      assignedTo: {
        managerId: user.userId,
      },
    };
  }

  if (user.role === "TL") {
    return {
      assignedTo: {
        tlId: user.userId,
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      assignedToId: user.userId,
    };
  }

  throw new ApiError(
    403,
    "Invalid user role"
  );
};

// ======================================================
// TELECALLER SCOPE
// ======================================================

const getTelecallerScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(
      401,
      "Authenticated user information is missing"
    );
  }

  if (user.role === "ADMIN") {
    return {
      role: "TELECALLER",
      isActive: true,
    };
  }

  if (user.role === "MANAGER") {
    return {
      role: "TELECALLER",
      isActive: true,
      managerId: user.userId,
    };
  }

  if (user.role === "TL") {
    return {
      role: "TELECALLER",
      isActive: true,
      tlId: user.userId,
    };
  }

  if (user.role === "TELECALLER") {
    return {
      role: "TELECALLER",
      isActive: true,
      id: user.userId,
    };
  }

  throw new ApiError(
    403,
    "Invalid user role"
  );
};

// ======================================================
// REPORT LOAN SCOPE
// ======================================================
//
// LoanAccount -> Lead -> assignedTo
//
// Used by financial/loan reports.
// ======================================================

const getReportLoanScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(
      401,
      "Authenticated user information is missing"
    );
  }

  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      leads: {
        assignedTo: {
          managerId: user.userId,
        },
      },
    };
  }

  if (user.role === "TL") {
    return {
      leads: {
        assignedTo: {
          tlId: user.userId,
        },
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      leads: {
        assignedToId: user.userId,
      },
    };
  }

  throw new ApiError(
    403,
    "Invalid user role"
  );
};

const getReportEmiScope = (user) => {
  const loanScope = getReportLoanScope(user);

  if (user.role === "ADMIN") {
    return loanScope;
  }

  return {
    loan_accounts: loanScope,
  };
};

// ======================================================
// REPORT REPAYMENT SCOPE
// ======================================================
//
// Repayment -> LoanAccount -> Lead -> assignedTo
// ======================================================

const getReportRepaymentScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(
      401,
      "Authenticated user information is missing"
    );
  }

  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      loan_accounts: {
        leads: {
          assignedTo: {
            managerId: user.userId,
          },
        },
      },
    };
  }

  if (user.role === "TL") {
    return {
      loan_accounts: {
        leads: {
          assignedTo: {
            tlId: user.userId,
          },
        },
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      loan_accounts: {
        leads: {
          assignedToId: user.userId,
        },
      },
    };
  }

  throw new ApiError(
    403,
    "Invalid user role"
  );
};

// ======================================================
// 1. REPORT SUMMARY
// ======================================================

const getReportSummary = async ({
  user,
}) => {
  const scope = getLeadScope(user);

  const [
    totalLeads,
    newLeads,
    interestedLeads,
    documentsPending,
    loginLeads,
    approvedLeads,
    disbursedLeads,
    rejectedLeads,
  ] = await Promise.all([
    prisma.lead.count({
      where: scope,
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "NEW",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "INTERESTED",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "DOCUMENTS_PENDING",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "LOGIN",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "APPROVED",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "DISBURSED",
      },
    }),

    prisma.lead.count({
      where: {
        ...scope,
        status: "REJECTED",
      },
    }),
  ]);

  return {
    totalLeads,
    newLeads,
    interestedLeads,
    documentsPending,
    loginLeads,
    approvedLeads,
    disbursedLeads,
    rejectedLeads,
  };
};

// ======================================================
// 2. DETAILED TELECALLER PERFORMANCE
// ======================================================

const getDetailedTelecallerPerformance =
  async ({
    user,
    period,
    date,
    from,
    to,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      period,
      date,
      from,
      to,
    });

    const telecallerWhere =
      getTelecallerScope(user);

    const telecallers =
      await prisma.user.findMany({
        where: telecallerWhere,

        select: {
          id: true,
          name: true,
          email: true,
        },

        orderBy: {
          name: "asc",
        },
      });

    const performance =
      await Promise.all(
        telecallers.map(
          async (telecaller) => {
            const totalLeads =
              await prisma.lead.count({
                where: {
                  assignedToId:
                    telecaller.id,

                  createdAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const callsMade =
              await prisma.callLog.count({
                where: {
                  telecallerId:
                    telecaller.id,

                  calledAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const connectedCalls =
              await prisma.callLog.count({
                where: {
                  telecallerId:
                    telecaller.id,

                  callStatus:
                    "CONNECTED",

                  calledAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const loginCount =
              await prisma.leadStatusHistory.count({
                where: {
                  changedBy:
                    telecaller.id,

                  newStatus:
                    "LOGIN",

                  changedAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const approvedCount =
              await prisma.leadStatusHistory.count({
                where: {
                  changedBy:
                    telecaller.id,

                  newStatus:
                    "APPROVED",

                  changedAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const disbursedCount =
              await prisma.leadStatusHistory.count({
                where: {
                  changedBy:
                    telecaller.id,

                  newStatus:
                    "DISBURSED",

                  changedAt: {
                    gte: start,
                    lt: end,
                  },
                },
              });

            const connectionRate =
              callsMade > 0
                ? Number(
                    (
                      (connectedCalls /
                        callsMade) *
                      100
                    ).toFixed(2)
                  )
                : 0;

            const conversionRate =
              totalLeads > 0
                ? Number(
                    (
                      (disbursedCount /
                        totalLeads) *
                      100
                    ).toFixed(2)
                  )
                : 0;

            return {
              telecaller: {
                id: telecaller.id,
                name: telecaller.name,
                email: telecaller.email,
              },

              totalLeads,
              callsMade,
              connectedCalls,
              connectionRate,
              loginCount,
              approvedCount,
              disbursedCount,
              conversionRate,
            };
          }
        )
      );

    return {
      period: {
        start,
        end,
      },

      performance,
    };
  };

// ======================================================
// 3. OLD TELECALLER PERFORMANCE
// ======================================================

const getTelecallerPerformance =
  async ({ user }) => {
    return getDetailedTelecallerPerformance({
      user,
    });
  };

// ======================================================
// 4. PENDING FOLLOW-UPS
// ======================================================

const getPendingFollowUps = async ({
  user,
}) => {
  const leadScope = getLeadScope(user);

  const followUps =
    await prisma.followUp.findMany({
      where: {
        status: "PENDING",

        lead: leadScope,
      },

      include: {
        lead: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            loanType: true,
            status: true,

            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        scheduledBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },

      orderBy: {
        followUpDate: "asc",
      },
    });

  return followUps;
};

// ======================================================
// 5. LEAD CONVERSION REPORT
// ======================================================

const getLeadConversionReport =
  async ({
    user,
    period,
    from,
    to,
    loanType,
    source,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      period,
      from,
      to,
    });

    const leadScope = getLeadScope(user);

    const leadWhere = {
      ...leadScope,

      ...(loanType && {
        loanType,
      }),

      ...(source && {
        source,
      }),
    };

    const totalLeads =
      await prisma.lead.count({
        where: {
          ...leadWhere,

          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });

    const historyBaseWhere = {
      changedAt: {
        gte: start,
        lt: end,
      },

      lead: leadWhere,
    };

    const [
      newCount,
      interestedCount,
      documentsPendingCount,
      loginCount,
      approvedCount,
      disbursedCount,
      rejectedCount,
    ] = await Promise.all([
      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "NEW",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "INTERESTED",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus:
            "DOCUMENTS_PENDING",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "LOGIN",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "APPROVED",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "DISBURSED",
        },
      }),

      prisma.leadStatusHistory.count({
        where: {
          ...historyBaseWhere,
          newStatus: "REJECTED",
        },
      }),
    ]);

    const percentage = (
      value,
      total
    ) => {
      if (!total) {
        return 0;
      }

      return Number(
        (
          (value / total) *
          100
        ).toFixed(2)
      );
    };

    const conversion = {
      interested: percentage(
        interestedCount,
        newCount
      ),

      documentsPending: percentage(
        documentsPendingCount,
        interestedCount
      ),

      login: percentage(
        loginCount,
        documentsPendingCount
      ),

      approved: percentage(
        approvedCount,
        loginCount
      ),

      disbursed: percentage(
        disbursedCount,
        approvedCount
      ),
    };

    return {
      period: {
        start,
        end,
      },

      totalLeads,

      funnel: {
        NEW: newCount,
        INTERESTED: interestedCount,
        DOCUMENTS_PENDING:
          documentsPendingCount,
        LOGIN: loginCount,
        APPROVED: approvedCount,
        DISBURSED: disbursedCount,
        REJECTED: rejectedCount,
      },

      conversion,
    };
  };

// ======================================================
// 6. LENDER APPLICATION PERFORMANCE
// ======================================================

const getLenderApplicationPerformance =
  async ({
    user,
    from,
    to,
  }) => {
    const where = {};

    // ----------------------------------------
    // Role Scope
    // ----------------------------------------

    if (user.role === "TELECALLER") {
      where.lead = {
        assignedToId:
          user.userId,
      };
    }

    if (user.role === "TL") {
      where.lead = {
        assignedTo: {
          tlId: user.userId,
        },
      };
    }

    if (user.role === "MANAGER") {
      where.lead = {
        assignedTo: {
          managerId: user.userId,
        },
      };
    }

    if (
      ![
        "ADMIN",
        "MANAGER",
        "TL",
        "TELECALLER",
      ].includes(user.role)
    ) {
      throw new ApiError(
        403,
        "Invalid user role"
      );
    }

    // ----------------------------------------
    // Date Filter
    // ----------------------------------------

    if (from || to) {
      where.createdAt = {};

      if (from) {
        const start = new Date(
          `${from}T00:00:00`
        );

        if (
          Number.isNaN(
            start.getTime()
          )
        ) {
          throw new ApiError(
            400,
            "Invalid from date"
          );
        }

        where.createdAt.gte =
          start;
      }

      if (to) {
        const end = new Date(
          `${to}T00:00:00`
        );

        if (
          Number.isNaN(
            end.getTime()
          )
        ) {
          throw new ApiError(
            400,
            "Invalid to date"
          );
        }

        end.setDate(
          end.getDate() + 1
        );

        where.createdAt.lt =
          end;
      }
    }

    const applications =
      await prisma.loanApplication.findMany({
        where,

        select: {
          id: true,
          status: true,

          lender: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          requestedAmount: true,
          sanctionedAmount: true,
          disbursedAmount: true,
        },
      });

    const result = {};

    for (
      const application of applications
    ) {
      const lender =
        application.lender;

      if (!lender) {
        continue;
      }

      if (
        !result[lender.id]
      ) {
        result[lender.id] = {
          lenderId:
            lender.id,

          lenderName:
            lender.name,

          lenderCode:
            lender.code,

          totalApplications: 0,

          draft: 0,
          submitted: 0,
          login: 0,
          approved: 0,
          rejected: 0,
          disbursed: 0,

          requestedAmount: 0,
          sanctionedAmount: 0,
          disbursedAmount: 0,
        };
      }

      const item =
        result[lender.id];

      item.totalApplications++;

      const status =
        String(
          application.status || ""
        ).toLowerCase();

      if (status === "draft") {
        item.draft++;
      }

      if (
        status === "submitted"
      ) {
        item.submitted++;
      }

      if (status === "login") {
        item.login++;
      }

      if (
        status === "approved"
      ) {
        item.approved++;
      }

      if (
        status === "rejected"
      ) {
        item.rejected++;
      }

      if (
        status === "disbursed"
      ) {
        item.disbursed++;
      }

      item.requestedAmount +=
        Number(
          application.requestedAmount ||
            0
        );

      item.sanctionedAmount +=
        Number(
          application.sanctionedAmount ||
            0
        );

      item.disbursedAmount +=
        Number(
          application.disbursedAmount ||
            0
        );
    }

    return Object.values(
      result
    ).map((item) => ({
      ...item,

      requestedAmount:
        Number(
          item.requestedAmount.toFixed(2)
        ),

      sanctionedAmount:
        Number(
          item.sanctionedAmount.toFixed(2)
        ),

      disbursedAmount:
        Number(
          item.disbursedAmount.toFixed(2)
        ),
    }));
  };

// ======================================================
// 7. FINANCIAL SUMMARY
// ======================================================

const getFinancialSummary = async ({
  user,
  from,
  to,
  period,
}) => {
  const {
    start,
    end,
  } = getDateRange({
    from,
    to,
    period,
  });

  const loanScope =
    getReportLoanScope(user);

  const repaymentScope =
    getReportRepaymentScope(user);

  const loanWhere = {
    ...loanScope,

    disbursedAt: {
      gte: start,
      lt: end,
    },
  };

  const repaymentWhere = {
    ...repaymentScope,

    paymentDate: {
      gte: start,
      lt: end,
    },
  };

  const [
    loans,
    repayments,
    overdueEmis,
  ] = await Promise.all([
    prisma.loanAccount.findMany({
      where: loanWhere,

      select: {
        disbursedAmount: true,
      },
    }),

    prisma.repayment.findMany({
      where: repaymentWhere,

      select: {
        amount: true,
      },
    }),

    prisma.emiSchedule.findMany({
      where: {
        ...loanScope,

        status: "OVERDUE",
      },

      select: {
        outstandingAmount: true,
      },
    }),
  ]);

  const totalDisbursed =
    loans.reduce(
      (sum, loan) =>
        sum +
        Number(
          loan.disbursedAmount || 0
        ),
      0
    );

  const totalCollected =
    repayments.reduce(
      (sum, repayment) =>
        sum +
        Number(
          repayment.amount || 0
        ),
      0
    );

  const totalOverdue =
    overdueEmis.reduce(
      (sum, emi) =>
        sum +
        Number(
          emi.outstandingAmount || 0
        ),
      0
    );

  const recoveryRate =
    totalDisbursed > 0
      ? Number(
          (
            (totalCollected /
              totalDisbursed) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    period: {
      start,
      end,
    },

    totalDisbursed:
      Number(
        totalDisbursed.toFixed(2)
      ),

    totalCollected:
      Number(
        totalCollected.toFixed(2)
      ),

    totalOverdue:
      Number(
        totalOverdue.toFixed(2)
      ),

    recoveryRate,

    loanCount:
      loans.length,

    repaymentCount:
      repayments.length,
  };
};

// ======================================================
// 8. COLLECTION PERFORMANCE
// ======================================================

const getCollectionPerformance =
  async ({
    user,
    from,
    to,
    period,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      from,
      to,
      period,
    });

    const scope =
      getReportRepaymentScope(user);

    const repayments =
      await prisma.repayment.findMany({
        where: {
          ...scope,

          paymentDate: {
            gte: start,
            lt: end,
          },
        },

        include: {
          loanAccount: {
            select: {
              id: true,
              loanAccountNumber: true,
            },
          },

          receivedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

    const totalCollected =
      repayments.reduce(
        (sum, repayment) =>
          sum +
          Number(
            repayment.amount || 0
          ),
        0
      );

    const byPaymentMode = {};

    for (const repayment of repayments) {
      const mode =
        repayment.paymentMode;

      if (!byPaymentMode[mode]) {
        byPaymentMode[mode] = {
          count: 0,
          amount: 0,
        };
      }

      byPaymentMode[mode].count += 1;

      byPaymentMode[mode].amount +=
        Number(
          repayment.amount || 0
        );
    }

    Object.keys(
      byPaymentMode
    ).forEach((mode) => {
      byPaymentMode[mode].amount =
        Number(
          byPaymentMode[mode].amount.toFixed(
            2
          )
        );
    });

    return {
      period: {
        start,
        end,
      },

      totalCollected:
        Number(
          totalCollected.toFixed(2)
        ),

      totalPayments:
        repayments.length,

      byPaymentMode,
    };
  };

// ======================================================
// 9. LENDER-WISE COLLECTION
// ======================================================

const getLenderCollection =
  async ({
    user,
    from,
    to,
    period,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      from,
      to,
      period,
    });

    const scope =
      getReportRepaymentScope(user);

    const repayments =
      await prisma.repayment.findMany({
        where: {
          ...scope,

          paymentDate: {
            gte: start,
            lt: end,
          },
        },

        select: {
          amount: true,

          loanAccount: {
            select: {
              lender: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

    const lenders = {};

    for (
      const repayment of repayments
    ) {
      const lender =
        repayment.loanAccount.lender;

      const key =
        lender?.id ||
        "NO_LENDER";

      if (!lenders[key]) {
        lenders[key] = {
          lenderId:
            lender?.id || null,

          lenderName:
            lender?.name ||
            "Unknown",

          lenderCode:
            lender?.code || null,

          paymentCount: 0,

          collectedAmount: 0,
        };
      }

      lenders[key].paymentCount += 1;

      lenders[key].collectedAmount +=
        Number(
          repayment.amount || 0
        );
    }

    return {
      period: {
        start,
        end,
      },

      lenders:
        Object.values(
          lenders
        ).map((item) => ({
          ...item,

          collectedAmount:
            Number(
              item.collectedAmount.toFixed(
                2
              )
            ),
        })),
    };
  };

// ======================================================
// 10. MONTH-WISE COLLECTION
// ======================================================

const getMonthlyCollection =
  async ({
    user,
    from,
    to,
    period,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      from,
      to,
      period,
    });

    const scope =
      getReportRepaymentScope(user);

    const repayments =
      await prisma.repayment.findMany({
        where: {
          ...scope,

          paymentDate: {
            gte: start,
            lt: end,
          },
        },

        select: {
          amount: true,
          paymentDate: true,
        },

        orderBy: {
          paymentDate: "asc",
        },
      });

    const monthly = {};

    for (
      const repayment of repayments
    ) {
      const date =
        new Date(
          repayment.paymentDate
        );

      const key =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      if (!monthly[key]) {
        monthly[key] = {
          month: key,
          amount: 0,
          paymentCount: 0,
        };
      }

      monthly[key].amount +=
        Number(
          repayment.amount || 0
        );

      monthly[key].paymentCount += 1;
    }

    return {
      period: {
        start,
        end,
      },

      monthly:
        Object.values(
          monthly
        ).map((item) => ({
          ...item,

          amount:
            Number(
              item.amount.toFixed(2)
            ),
        })),
    };
  };

// ======================================================
// 11. TELECALLER COLLECTION PERFORMANCE
// ======================================================
//
// Business meaning:
//
// receivedBy = jis user ne payment record ki.
//
// Ye zaroori nahi ki wahi assigned telecaller ho.
//
// Current report intentionally receivedBy ke basis par hai.
// ======================================================

const getTelecallerCollection =
  async ({
    user,
    from,
    to,
    period,
  }) => {
    const {
      start,
      end,
    } = getDateRange({
      from,
      to,
      period,
    });

    const scope =
      getReportRepaymentScope(user);

    const repayments =
      await prisma.repayment.findMany({
        where: {
          ...scope,

          paymentDate: {
            gte: start,
            lt: end,
          },

          receivedBy: {
            role: "TELECALLER",
          },
        },

        select: {
          amount: true,

          receivedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

    const result = {};

    for (
      const repayment of repayments
    ) {
      const collector =
        repayment.receivedBy;

      if (!collector) {
        continue;
      }

      if (!result[collector.id]) {
        result[collector.id] = {
          userId:
            collector.id,

          name:
            collector.name,

          role:
            collector.role,

          paymentCount: 0,

          collectedAmount: 0,
        };
      }

      result[collector.id]
        .paymentCount += 1;

      result[collector.id]
        .collectedAmount +=
        Number(
          repayment.amount || 0
        );
    }

    return {
      period: {
        start,
        end,
      },

      telecallers:
        Object.values(
          result
        ).map((item) => ({
          ...item,

          collectedAmount:
            Number(
              item.collectedAmount.toFixed(
                2
              )
            ),
        })),
    };
  };

// ======================================================
// FINANCIAL REPORT SUMMARY
// ======================================================

const getFinancialReportSummary = async ({
  user,
  fromDate,
  toDate,
  status,
}) => {
  const range = getDateRange({
    from: fromDate,
    to: toDate,
  });

  const loanScope = getReportLoanScope(user);
  const repaymentScope = getReportRepaymentScope(user);

  const loanWhere = {
    ...loanScope,
    disbursedAt: {
      gte: range.start,
      lt: range.end,
    },
  };

  const repaymentWhere = {
    ...repaymentScope,
    paymentDate: {
      gte: range.start,
      lt: range.end,
    },
  };

  const [loans, repayments, overdueEmis, outstandingEmis] =
    await Promise.all([
      prisma.loanAccount.findMany({
        where: loanWhere,
        select: {
          disbursedAmount: true,
        },
      }),
      prisma.repayment.findMany({
        where: repaymentWhere,
        select: {
          amount: true,
        },
      }),
      prisma.emiSchedule.findMany({
        where: {
          ...getReportEmiScope(user),
          status: "OVERDUE",
        },
        select: {
          outstandingAmount: true,
        },
      }),
      prisma.emiSchedule.findMany({
        where: {
          ...getReportEmiScope(user),
          status: {
            in: ["PENDING", "PARTIAL", "OVERDUE"],
          },
        },
        select: {
          outstandingAmount: true,
        },
      }),
    ]);

  const totalDisbursed = loans.reduce(
    (sum, loan) => sum + Number(loan.disbursedAmount || 0),
    0
  );

  const totalCollected = repayments.reduce(
    (sum, repayment) => sum + Number(repayment.amount || 0),
    0
  );

  const totalOverdue = overdueEmis.reduce(
    (sum, emi) => sum + Number(emi.outstandingAmount || 0),
    0
  );

  const totalOutstanding = outstandingEmis.reduce(
    (sum, emi) => sum + Number(emi.outstandingAmount || 0),
    0
  );

  const collectionRate =
    totalDisbursed > 0
      ? Number(
          ((totalCollected / totalDisbursed) * 100).toFixed(2)
        )
      : 0;

  return {
    totalDisbursed: Number(totalDisbursed.toFixed(2)),
    totalCollected: Number(totalCollected.toFixed(2)),
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
    totalOverdue: Number(totalOverdue.toFixed(2)),
    collectionRate,
    period: {
      start: range.start,
      end: range.end,
    },
    filters: {
      fromDate: fromDate || null,
      toDate: toDate || null,
      status: status || null,
    },
  };
};

// ======================================================
// REPAYMENT REPORT
// ======================================================

const getRepaymentReport = async ({
  user,
  fromDate,
  toDate,
  status,
}) => {
  const range = getDateRange({
    from: fromDate,
    to: toDate,
  });

  const where = {
    ...getReportRepaymentScope(user),
    paymentDate: {
      gte: range.start,
      lt: range.end,
    },
  };

  const items = await prisma.repayment.findMany({
    where,
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      loan_accounts: {
        select: {
          loanAccountNumber: true,
          status: true,
        },
      },
      emiSchedule: {
        select: {
          emiNumber: true,
        },
      },
    },
  });

  return {
    items: items.map((item) => ({
      id: item.id,
      amount: Number(item.amount || 0),
      paymentDate: item.paymentDate,
      paymentMode: item.paymentMode,
      transactionId: item.transactionId,
      status: item.loan_accounts?.status || null,
      loanAccount: {
        loanAccountNumber:
          item.loan_accounts?.loanAccountNumber || null,
      },
      emiSchedule: item.emiSchedule
        ? {
            emiNumber: item.emiSchedule.emiNumber,
          }
        : null,
    })),
  };
};

// ======================================================
// EMI REPORT
// ======================================================

const getEmiReport = async ({
  user,
  fromDate,
  toDate,
  status,
}) => {
  const range = getDateRange({
    from: fromDate,
    to: toDate,
  });

  const where = {
    ...getReportEmiScope(user),
    dueDate: {
      gte: range.start,
      lt: range.end,
    },
  };

  if (status) {
    const normalizedStatus = String(status).toUpperCase();
    if (["PENDING", "PARTIAL", "PAID", "OVERDUE"].includes(normalizedStatus)) {
      where.status = normalizedStatus;
    }
  }

  const items = await prisma.emiSchedule.findMany({
    where,
    orderBy: [
      { dueDate: "asc" },
      { emiNumber: "asc" },
    ],
    include: {
      loan_accounts: {
        select: {
          loanAccountNumber: true,
        },
      },
    },
  });

  return {
    items: items.map((item) => ({
      id: item.id,
      loanAccount: {
        loanAccountNumber:
          item.loan_accounts?.loanAccountNumber || null,
      },
      emiNumber: item.emiNumber,
      dueDate: item.dueDate,
      emiAmount: Number(item.emiAmount || 0),
      paidAmount: Number(item.paidAmount || 0),
      outstandingAmount: Number(item.outstandingAmount || 0),
      status: item.status,
    })),
  };
};

// ======================================================
// COLLECTION REPORT
// ======================================================

const getCollectionReport = async ({
  user,
  fromDate,
  toDate,
  status,
}) => {
  const range = getDateRange({
    from: fromDate,
    to: toDate,
  });

  const where = {
    ...getReportEmiScope(user),
    status: {
      in: ["PENDING", "PARTIAL", "OVERDUE"],
    },
    dueDate: {
      gte: range.start,
      lt: range.end,
    },
  };

  if (status) {
    const normalizedStatus = String(status).toUpperCase();
    if (["PENDING", "PARTIAL", "PAID", "OVERDUE"].includes(normalizedStatus)) {
      where.status = normalizedStatus;
    }
  }

  const items = await prisma.emiSchedule.findMany({
    where,
    orderBy: [
      { dueDate: "asc" },
      { emiNumber: "asc" },
    ],
    include: {
      loan_accounts: {
        select: {
          loanAccountNumber: true,
          leads: {
            select: {
              customerName: true,
            },
          },
        },
      },
    },
  });

  return {
    items: items.map((item) => ({
      id: item.id,
      customer: {
        name:
          item.loan_accounts?.leads?.customerName || null,
      },
      loanAccount: {
        loanAccountNumber:
          item.loan_accounts?.loanAccountNumber || null,
        customerName:
          item.loan_accounts?.leads?.customerName || null,
      },
      emiSchedule: {
        emiNumber: item.emiNumber,
        outstandingAmount: Number(item.outstandingAmount || 0),
      },
      outstandingAmount: Number(item.outstandingAmount || 0),
      daysOverdue:
        item.status === "OVERDUE"
          ? Math.max(
              0,
              Math.ceil(
                (new Date() - new Date(item.dueDate)) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
      status: item.status,
    })),
  };
};

// ======================================================
// EXPORT FINANCIAL REPORT
// ======================================================

const exportFinancialReport = async ({
  user,
  fromDate,
  toDate,
  status,
}) => {
  const summary = await getFinancialReportSummary({
    user,
    fromDate,
    toDate,
    status,
  });

  const repayments = await getRepaymentReport({
    user,
    fromDate,
    toDate,
    status,
  });

  const rows = [
    [
      "Period Start",
      "Period End",
      "Total Disbursed",
      "Total Collected",
      "Total Outstanding",
      "Total Overdue",
      "Collection Rate",
      "Repayment Count",
    ],
    [
      summary.period.start.toISOString(),
      summary.period.end.toISOString(),
      summary.totalDisbursed,
      summary.totalCollected,
      summary.totalOutstanding,
      summary.totalOverdue,
      `${summary.collectionRate}%`,
      repayments.items.length,
    ],
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return csv;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Helpers
  getDateRange,
  getLeadScope,
  getTelecallerScope,
  getReportLoanScope,
  getReportEmiScope,
  getReportRepaymentScope,

  // Existing reports
  getReportSummary,
  getTelecallerPerformance,
  getDetailedTelecallerPerformance,
  getPendingFollowUps,
  getLeadConversionReport,
  getLenderApplicationPerformance,

  // Step 30.4 - 30.9
  getFinancialSummary,
  getCollectionPerformance,
  getLenderCollection,
  getMonthlyCollection,
  getTelecallerCollection,

  // Financial report endpoints for frontend
  getFinancialReportSummary,
  getRepaymentReport,
  getEmiReport,
  getCollectionReport,
  exportFinancialReport,
};
