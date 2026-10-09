const dashboardService = require("./dashboard.service");

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboard({
      user: req.user,
    });

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};