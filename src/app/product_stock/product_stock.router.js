const productStockController = require("./product_stock.controller");
const router = require("express").Router();

router.put("/:productVariantId", productStockController.updateProductVariantStock);

module.exports = router;
