var createError = require("http-errors");

module.exports = (app) => {
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    console.error("Error caught by handler:", {
      message: err.message,
      status: err.status || 500,
      stack: err.stack,
    });
    res.status(err.status || 500).json({
      error: err.message,
      ...(req.app.get("env") === "development" && { stack: err.stack }),
    });
  });
};
