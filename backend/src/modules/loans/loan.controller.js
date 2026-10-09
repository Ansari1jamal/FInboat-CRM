const loanService = require("./loan.service");
const XLSX = require("xlsx");

const createLoanAccount = async (req, res, next) => {
  try {
    const loan = await loanService.createLoanAccountFromApplication({
      applicationId: req.params.applicationId,
      user: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Loan account created successfully",
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

const getLoanAccounts = async (req, res, next) => {
  try {
    const result = await loanService.getLoanAccounts({
      user: req.user,
      status: req.query.status,
      lenderId: req.query.lenderId,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const exportLoanAccounts = async (req, res, next) => {
  try {
    const loans = await loanService.exportLoanAccounts({
      user: req.user,
      status: req.query.status,
      lenderId: req.query.lenderId,
      search: req.query.search,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });

    const rows = loans.map((loan) => ({
      "Loan Account": loan.loanAccountNumber,
      Customer: loan.leads?.customerName || "",
      Mobile: loan.leads?.mobile || "",
      "Loan Type": loan.leads?.loanType || "",
      Application: loan.loan_applications?.applicationNumber || "",
      Lender: loan.Lender?.name || "",
      Status: loan.status,
      "Principal Amount": Number(loan.principalAmount || 0),
      "Disbursed Amount": Number(loan.disbursedAmount || 0),
      "Disbursed At": loan.disbursedAt || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="loans.xlsx"'
    );
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const getLoanAccount = async (req, res, next) => {
  try {
    const loan = await loanService.getLoanAccountById({
      id: req.params.id,
      user: req.user,
    });

    res.json({
      success: true,
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

const updateLoanStatus = async (req, res, next) => {
  try {
    const loan = await loanService.updateLoanStatus({
      id: req.params.id,
      status: req.body.status,
      user: req.user,
    });

    res.json({
      success: true,
      message: "Loan status updated successfully",
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoanAccount,
  getLoanAccounts,
  exportLoanAccounts,
  getLoanAccount,
  updateLoanStatus,
};