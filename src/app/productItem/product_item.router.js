const productController = require("./product_item.controller");
const router = require("express").Router();

// ProductItem Routes
router.get("/:id", productController.getProductItemById);
router.get("/", productController.getProductItems);
router.post("/create", productController.createProductItem);
router.post("/add_stock", productController.addProductStock);

module.exports = router;
