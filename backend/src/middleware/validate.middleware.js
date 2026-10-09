const validate = (schema) => {
  return (req, res, next) => {
    try {
      // ======================================
      // VALIDATE REQUEST BODY
      // ======================================

      const schemaInput =
        schema.shape?.body
          ? {
              body: req.body || {},
              params: req.params,
              query: req.query,
            }
          : req.body;

      const result = schema.safeParse(
        schemaInput
      );

      // ======================================
      // VALIDATION FAILED
      // ======================================

      if (!result.success) {
        const errors =
          result.error.issues.map(
            (issue) => ({
              field:
                issue.path.length > 0
                  ? issue.path.join(".")
                  : "request",

              message:
                issue.message,
            })
          );

        return res.status(400).json({
          success: false,
          message:
            "Validation failed",
          errors,
        });
      }

      // ======================================
      // STORE VALIDATED DATA
      // ======================================

      const isRequestSchema =
        Boolean(schema.shape?.body);

      req.validated = {
        body: isRequestSchema
          ? result.data.body || {}
          : result.data || {},
        params: isRequestSchema
          ? result.data.params || {}
          : req.params || {},
        query: isRequestSchema
          ? result.data.query || {}
          : req.query || {},
      };

      // ======================================
      // NEXT MIDDLEWARE
      // ======================================

      next();

    } catch (error) {
      next(error);
    }
  };
};

// ========================================
// EXPORT
// ========================================

module.exports = validate;