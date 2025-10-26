var indexRouter = require("../routes/index");
var tagsRouter = require("../routes/tags");
var flashcardsRouter = require("../routes/flashcards");
var aiEndpointsRouter = require("../routes/ai_endpoints");

module.exports = (app) => {
  app.use("/", indexRouter);
  app.use("/api/ai", aiEndpointsRouter);
  app.use("/tags", tagsRouter);
  app.use("/flashcards", flashcardsRouter);
  // !-- Do not remove this line --! //
};
