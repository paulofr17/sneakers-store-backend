const router = require("express").Router();
const categoryController = require("./category.controller");

// Product Routes
router.get("/", categoryController.getAllCategories);

module.exports = router;