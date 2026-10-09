const {
  createTarget,
  getTargets,
  updateTarget,
  deleteTarget,
  getTargetAchievement,
} = require("./target.service");

// CREATE TARGET
const createTargetController = async (
  req,
  res,
  next
) => {
  try {
    const target = await createTarget({
      ...req.body,
      user: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Target created successfully",
      data: {
        target,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET TARGETS
const getTargetsController = async (
  req,
  res,
  next
) => {
  try {
    const targets = await getTargets({
      user: req.user,
      period: req.query.period,
    });

    res.status(200).json({
      success: true,
      message: "Targets fetched successfully",
      data: {
        targets,
      },
    });
  } catch (error) {
    next(error);
  }
};
// UPDATE TARGET
const updateTargetController = async (
  req,
  res,
  next
) => {
  try {
    const target =
      await updateTarget({
        targetId: req.params.id,
        ...req.body,
        user: req.user,
      });

    res.status(200).json({
      success: true,
      message: "Target updated successfully",
      data: {
        target,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE TARGET
const deleteTargetController = async (
  req,
  res,
  next
) => {
  try {
    await deleteTarget({
      targetId: req.params.id,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Target deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
// GET TARGET ACHIEVEMENT
const getAchievementController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getTargetAchievement({
        targetId: req.params.id,
        user: req.user,
      });

    res.status(200).json({
      success: true,
      message:
        "Target achievement fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTargetController,
  getTargetsController,
  updateTargetController,
  deleteTargetController,
  getAchievementController,
};