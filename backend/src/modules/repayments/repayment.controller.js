const repaymentService = require("./repayment.service");

const generateEmiSchedule = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await repaymentService.generateEmiSchedule({
        loanAccountId:
          req.params.loanAccountId,

        interestRate:
          req.body.interestRate,

        tenureMonths:
          req.body.tenureMonths,

        firstEmiDate:
          req.body.firstEmiDate,

        user: req.user,
      });

    res.status(201).json({
      success: true,
      message:
        "EMI schedule generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getEmiSchedule = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await repaymentService.getEmiSchedule({
        loanAccountId:
          req.params.loanAccountId,

        user: req.user,
      });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getRepayments = async (req, res, next) => {
  try {
    const result = await repaymentService.getRepayments({
      loanAccountId: req.params.loanAccountId,
      page: req.validated?.query?.page || 1,
      limit: req.validated?.query?.limit || 20,
      user: req.user,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getRepaymentById = async (req, res, next) => {
  try {
    const repayment = await repaymentService.getRepaymentById({
      loanAccountId: req.params.loanAccountId,
      repaymentId: req.params.repaymentId,
      user: req.user,
    });

    res.json({
      success: true,
      data: repayment,
    });
  } catch (error) {
    next(error);
  }
};

const createRepayment = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await repaymentService.createRepayment({
        loanAccountId:
          req.params.loanAccountId,

        emiScheduleId:
          req.body.emiScheduleId,

        amount:
          req.body.amount,

        paymentDate:
          req.body.paymentDate,

        paymentMode:
          req.body.paymentMode,

        transactionId:
          req.body.transactionId,

        referenceNumber:
          req.body.referenceNumber,

        remarks:
          req.body.remarks,

        user: req.user,
      });

    res.status(201).json({
      success: true,
      message:
        "Repayment recorded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getLoanRepaymentSummary = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await repaymentService.getLoanRepaymentSummary({
        loanAccountId:
          req.params.loanAccountId,

        user: req.user,
      });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateEmiSchedule,
  getEmiSchedule,
  getRepayments,
  getRepaymentById,
  createRepayment,
  getLoanRepaymentSummary,
};