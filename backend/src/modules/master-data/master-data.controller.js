
const masterDataService = require("./master-data.service");

// ========================================
// CREATE MASTER DATA
// ========================================

const createMasterData = async (req, res, next) => {
  try {
    const result =
      await masterDataService.createMasterData({
        category: req.body.category,
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        sortOrder: req.body.sortOrder,
        metadata: req.body.metadata,
      });

    return res.status(201).json({
      success: true,
      message: "Master data created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET MASTER DATA LIST
// ========================================

const getMasterData = async (req, res, next) => {
  try {
    const result =
      await masterDataService.getMasterData({
        category: req.query.category,
        isActive: req.query.isActive,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET SINGLE MASTER DATA
// ========================================

const getMasterDataById = async (req, res, next) => {
  try {
    const result =
      await masterDataService.getMasterDataById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE MASTER DATA
// ========================================

const updateMasterData = async (req, res, next) => {
  try {
    const result =
      await masterDataService.updateMasterData({
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        sortOrder: req.body.sortOrder,
        isActive: req.body.isActive,
        metadata: req.body.metadata,
      });

    return res.status(200).json({
      success: true,
      message: "Master data updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// TOGGLE MASTER DATA STATUS
// ========================================

const toggleMasterDataStatus = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await masterDataService.toggleMasterDataStatus({
        id: req.params.id,
        isActive: req.body.isActive,
      });

    return res.status(200).json({
      success: true,
      message:
        "Master data status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  createMasterData,
  getMasterData,
  getMasterDataById,
  updateMasterData,
  toggleMasterDataStatus,
};
