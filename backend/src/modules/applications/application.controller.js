
const service = require("./application.service");

const timelineService = require(
  "./application.timeline.service"
);

// ======================================
// APPLICATION EXPORT SERVICE
// ======================================

const {
  exportApplications,
  createApplicationExcel,
  createApplicationCSV,
} = require(
  "./application.export.service"
);

// ======================================
// CREATE APPLICATION
// ======================================

const createApplication = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await service.createApplication({
        leadId:
          req.params.leadId,

        lenderId:
          req.body.lenderId,

        requestedAmount:
          req.body.requestedAmount,

        user:
          req.user,
      });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// GET APPLICATIONS
// ======================================

const getApplications = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await service.getApplications({
        // ==================================
        // CURRENT USER
        // ==================================

        user:
          req.user,

        // ==================================
        // SEARCH
        // ==================================

        search:
          req.query.search,

        // ==================================
        // FILTERS
        // ==================================

        status:
          req.query.status,

        lenderId:
          req.query.lenderId,

        leadId:
          req.query.leadId,

        loanType:
          req.query.loanType,

        // ==================================
        // DATE FILTER
        // ==================================

        fromDate:
          req.query.fromDate,

        toDate:
          req.query.toDate,

        // ==================================
        // AMOUNT FILTER
        // ==================================

        minAmount:
          req.query.minAmount,

        maxAmount:
          req.query.maxAmount,

        // ==================================
        // PAGINATION
        // ==================================

        page:
          req.query.page,

        limit:
          req.query.limit,

        // ==================================
        // SORTING
        // ==================================

        sortBy:
          req.query.sortBy,

        sortOrder:
          req.query.sortOrder,
      });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// GET SINGLE APPLICATION
// ======================================

const getApplication = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await service.getApplicationById({
        id:
          req.params.id,

        user:
          req.user,
      });

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// UPDATE APPLICATION
// ======================================

const updateApplication = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await service.updateApplication({
        id:
          req.params.id,

        ...req.body,

        user:
          req.user,
      });

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// CHANGE APPLICATION STATUS
// ======================================

const changeStatus = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await service.changeApplicationStatus({
        id:
          req.params.id,

        ...req.body,

        user:
          req.user,
      });

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// GET APPLICATION TIMELINE
// ======================================

const getApplicationTimeline = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await timelineService.getApplicationTimeline({
        applicationId:
          req.params.id,

        user:
          req.user,
      });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// GET APPLICATION STATUS HISTORY
// ======================================

const getApplicationStatusHistory = async (
  req,
  res,
  next
) => {
  try {
    const history =
      await service.getApplicationStatusHistory({
        id:
          req.params.id,

        user:
          req.user,
      });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// EXPORT APPLICATIONS TO EXCEL
// ======================================

const exportApplicationExcel = async (
  req,
  res,
  next
) => {
  try {
    const applications =
      await exportApplications({
        user:
          req.user,

        filters: {
          status:
            req.query.status,

          fromDate:
            req.query.fromDate,

          toDate:
            req.query.toDate,
        },
      });

    const buffer =
      createApplicationExcel(
        applications
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="applications.xlsx"'
    );

    return res.send(
      buffer
    );
  } catch (error) {
    next(error);
  }
};

// ======================================
// EXPORT APPLICATIONS TO CSV
// ======================================

const exportApplicationCSV = async (
  req,
  res,
  next
) => {
  try {
    const applications =
      await exportApplications({
        user:
          req.user,

        filters: {
          status:
            req.query.status,

          fromDate:
            req.query.fromDate,

          toDate:
            req.query.toDate,
        },
      });

    const csv =
      createApplicationCSV(
        applications
      );

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="applications.csv"'
    );

    return res.send(
      csv
    );
  } catch (error) {
    next(error);
  }
};

// ======================================
// EXPORTS
// ======================================

module.exports = {
  createApplication,

  getApplications,

  getApplication,

  updateApplication,

  changeStatus,

  getApplicationTimeline,

  getApplicationStatusHistory,

  // ==================================
  // EXPORT
  // ==================================

  exportApplicationExcel,

  exportApplicationCSV,
};

