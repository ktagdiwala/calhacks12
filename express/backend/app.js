require("dotenv").config();

var express = require("express");
var cors = require("cors");
var errorConfig = require("./config/error");
var utilitiesConfig = require("./config/utilities");
var routesConfig = require("./config/routes");

var app = express();

// Enable CORS for React frontend
app.use(cors());

utilitiesConfig(app);
routesConfig(app);
errorConfig(app);

module.exports = app;
