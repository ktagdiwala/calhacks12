var indexRouter = require("../routes/index");
var tagsRouter = require("../routes/tags");
var flashcardsRouter = require("../routes/flashcards");

module.exports = (app) => {
  app.use("/", indexRouter);
  app.use("/tags", tagsRouter);
  app.use("/flashcards", flashcardsRouter);
  // !-- Do not remove this line --! //
};
