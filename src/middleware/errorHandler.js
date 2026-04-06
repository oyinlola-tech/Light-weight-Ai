module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Something went wrong."
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
