const productController = require("./product.controller");
const router = require("express").Router();

// Product Routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
