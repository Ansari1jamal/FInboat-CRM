const {
  assignLead,
  getLeadTransfers,
} = require("./lead.assignment.service");


// ========================================
// ASSIGN / REASSIGN LEAD
// ========================================

const assignLeadController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      toUserId,
      toTeamId,
      reason,
    } = req.body;

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: "toUserId is required",
      });
    }

    const lead = await assignLead({
      leadId: id,
      toUserId,
      toTeamId,
      reason,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// GET LEAD TRANSFER HISTORY
// ========================================

const getLeadTransfersController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const transfers = await getLeadTransfers({
      leadId: id,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Lead transfer history fetched successfully",
      data: {
        transfers,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  assignLeadController,
  getLeadTransfersController,
};