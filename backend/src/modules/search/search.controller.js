const {
  globalSearch,
} = require("./search.service");

const search = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await globalSearch({
        user: req.user,
        q: req.query.q,
        type: req.query.type,
        limit: req.query.limit,
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
  search,
};