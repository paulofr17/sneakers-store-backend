const router = require("express").Router();
const dashboardController = require("./dashboard.controller");

// Product Routes
router.get("/", dashboardController.getDashboard);

module.exports = router;
