const router = require("express").Router();
const sizeController = require("./size.controller");

// Product Routes
router.get("/", sizeController.getAllSizes);

module.exports = router;