const {
  updateLeadStatus,
  getLeadStatusHistory,
} = require("./lead.status.service");


// ==========================================
// UPDATE LEAD STATUS
// =

const updateLeadStatusController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      status,
      note,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const lead = await updateLeadStatus({
      leadId: id,
      newStatus: status,
      note,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET LEAD STATUS HISTORY
// ==========================================

const getLeadStatusHistoryController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const history = await getLeadStatusHistory({
      leadId: id,
    });

    return res.status(200).json({
      success: true,
      message: "Lead status history fetched successfully",
      data: {
        history,
      },
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateLeadStatusController,
    getLeadStatusHistoryController,
};