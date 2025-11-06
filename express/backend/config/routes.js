const indexRouter = require("../routes/index");
const tagsRouter = require("../routes/tags");
const flashcardsRouter = require("../routes/flashcards");
const questionsRouter = require("../routes/questions");
const statsRouter = require("../routes/stats");
const aiEndpointsRouter = require("../routes/ai_endpoints");
const analyticsRouter = require("../routes/analytics");

module.exports = (app) => {
  app.use("/", indexRouter);
  app.use("/api/ai", aiEndpointsRouter);
  app.use("/tags", tagsRouter);
  app.use("/flashcards", flashcardsRouter);
  app.use("/questions", questionsRouter);
  app.use("/stats", statsRouter);
  app.use("/analytics", analyticsRouter);
  // !-- Do not remove this line --! //
};
