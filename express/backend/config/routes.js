var indexRouter = require("../routes/index");
var tagsRouter = require("../routes/tags");
var flashcardsRouter = require("../routes/flashcards");
var aiEndpointsRouter = require("../routes/ai_endpoints");
var analyticsRouter = require("../routes/analytics");

module.exports = (app) => {
  app.use("/", indexRouter);
  app.use("/api/ai", aiEndpointsRouter);
  app.use("/tags", tagsRouter);
  app.use("/flashcards", flashcardsRouter);
  app.use("/analytics", analyticsRouter);
  // !-- Do not remove this line --! //
};
