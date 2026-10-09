const {
  getLeadTimeline,
} = require("./lead.timeline.service");

const getLeadTimelineController = async (req, res, next) => {
  try {
    const timeline = await getLeadTimeline({
      leadId: req.params.id,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Lead timeline fetched successfully",
      data: {
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeadTimelineController,
};