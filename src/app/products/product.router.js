const router = require("express").Router();
const productController = require("./product.controller");

// Product Routes
router.get("/:id", productController.getProductById);
router.get("/", productController.getProducts);
router.post("/", productController.createProduct);
router.post("/products-variants", productController.createProductWithVariants);
router.put("/products-variants/:id", productController.updateProductVariants);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
