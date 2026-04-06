module.exports = function validate(schema) {
  return (req, res, next) => {
    try {
      if (!schema || typeof schema.safeParse !== "function") {
        const err = new Error("Validation schema is not defined.");
        err.status = 500;
        err.code = "VALIDATION_SCHEMA_MISSING";
        return next(err);
      }

      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (!result.success) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          details: result.error.flatten()
        });
      }

      req.validated = result.data;
      return next();
    } catch (error) {
      error.status = error.status || 500;
      error.code = error.code || "VALIDATION_ERROR";
      return next(error);
    }
  };
};
