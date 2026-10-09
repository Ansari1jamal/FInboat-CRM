const auditService = require("./audit.service");

const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs({
      user: req.user,
      page: req.query.page,
      limit: req.query.limit,
      module: req.query.module,
      action: req.query.action,
      userId: req.query.userId,
      recordId: req.query.recordId,
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
  getAuditLogs,
};