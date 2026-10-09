const {
  createCallLog,
  getLeadCallLogs,
} = require("./call.service");

const getLeadCallLogsController = async (
  req,
  res,
  next
) => {
  try {
    const calls = await getLeadCallLogs({
      leadId: req.params.leadId,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Call history fetched successfully",
      data: { calls },
    });
  } catch (error) {
    next(error);
  }
};

const createCallLogController = async (
  req,
  res,
  next
) => {
  try {
    const { leadId } = req.params;

    const {
      callStatus,
      remarks,
    } = req.body;

    if (!callStatus) {
      return res.status(400).json({
        success: false,
        message: "Call status is required",
      });
    }

    const callLog = await createCallLog({
      leadId,
      callStatus,
      remarks,
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: "Call logged successfully",
      data: {
        callLog,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCallLogController,
  getLeadCallLogsController,
};