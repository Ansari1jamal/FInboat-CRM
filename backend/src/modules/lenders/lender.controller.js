const service = require("./lender.service");

const createLender = async (req, res, next) => {
  try {
    const lender =
      await service.createLender(req.body);

    res.status(201).json({
      success: true,
      data: lender,
    });
  } catch (error) {
    next(error);
  }
};

const getLenders = async (req, res, next) => {
  try {
    const lenders =
      await service.getLenders();

    res.json({
      success: true,
      data: lenders,
    });
  } catch (error) {
    next(error);
  }
};

const updateLender = async (req, res, next) => {
  try {
    const lender =
      await service.updateLender({
        id: req.params.id,
        ...req.body,
      });

    res.json({
      success: true,
      data: lender,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLender,
  getLenders,
  updateLender,
};