const router = require("express").Router();
const colorController = require("./color.controller");

// Product Routes
router.get("/", colorController.getAllColors);

module.exports = router;