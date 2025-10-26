var indexRouter = require("../routes/index");
var tagsRouter = require("../routes/tags");

module.exports = (app) => {
  app.use("/", indexRouter);
  app.use("/tags", tagsRouter);
  // !-- Do not remove this line --! //
};
