const {
  createFollowUp,
  updateFollowUp,
  getPendingFollowUps,
  getOverdueFollowUps,
  getFollowUpSummary,
} = require("./followup.service");


/*
|--------------------------------------------------------------------------
| CREATE FOLLOW-UP
|--------------------------------------------------------------------------
*/

const createFollowUpController = async (
  req,
  res,
  next
) => {
  try {
    const { leadId } = req.params;

    const {
      followUpDate,
      followUpTime,
      notes,
    } = req.body;


    // -----------------------------
    // Validate Date
    // -----------------------------

    if (!followUpDate) {
      return res.status(400).json({
        success: false,
        message:
          "Follow-up date is required",
      });
    }


    // -----------------------------
    // Validate Time
    // -----------------------------

    if (!followUpTime) {
      return res.status(400).json({
        success: false,
        message:
          "Follow-up time is required",
      });
    }


    // -----------------------------
    // Create Follow-up
    // -----------------------------

    const followUp =
      await createFollowUp({
        leadId,
        followUpDate,
        followUpTime,
        notes,
        user: req.user,
      });


    return res.status(201).json({
      success: true,
      message:
        "Follow-up scheduled successfully",

      data: {
        followUp,
      },
    });

  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE FOLLOW-UP
|--------------------------------------------------------------------------
*/

const updateFollowUpController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      status,
      notes,
    } = req.body;


    // -----------------------------
    // Validate Status
    // -----------------------------

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Follow-up status is required",
      });
    }


    // -----------------------------
    // Update Follow-up
    // -----------------------------

    const followUp =
      await updateFollowUp({
        followUpId: id,
        status,
        notes,
        user: req.user,
      });


    return res.status(200).json({
      success: true,
      message:
        "Follow-up updated successfully",

      data: {
        followUp,
      },
    });

  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET PENDING FOLLOW-UPS
|--------------------------------------------------------------------------
*/

const getPendingFollowUpsController =
  async (
    req,
    res,
    next
  ) => {
    try {

      const followUps =
        await getPendingFollowUps({
          user: req.user,
        });


      return res.status(200).json({
        success: true,

        message:
          "Pending follow-ups fetched successfully",

        data: {
          followUps,
        },
      });

    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| GET OVERDUE FOLLOW-UPS
|--------------------------------------------------------------------------
*/

const getOverdueFollowUpsController =
  async (
    req,
    res,
    next
  ) => {
    try {

      const followUps =
        await getOverdueFollowUps({
          user: req.user,
        });


      return res.status(200).json({
        success: true,

        message:
          "Overdue follow-ups fetched successfully",

        data: {
          followUps,
        },
      });

    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| GET FOLLOW-UP SUMMARY
|--------------------------------------------------------------------------
*/

const getFollowUpSummaryController =
  async (
    req,
    res,
    next
  ) => {
    try {

      const summary =
        await getFollowUpSummary({
          user: req.user,
        });


      return res.status(200).json({
        success: true,

        message:
          "Follow-up summary fetched successfully",

        data: {
          summary,
        },
      });

    } catch (error) {
      next(error);
    }
  };


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
  createFollowUpController,
  updateFollowUpController,

  getPendingFollowUpsController,
  getOverdueFollowUpsController,
  getFollowUpSummaryController,
};