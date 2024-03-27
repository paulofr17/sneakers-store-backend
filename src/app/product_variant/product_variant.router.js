const productController = require("./product_variant.controller");
const router = require("express").Router();

router.get("/new_arrivals", productController.getNewArrivals);
router.get("/:slug", productController.getProductVariantBySlug);
router.get("/", productController.getProductVariants);
router.post("/create", productController.createProductVariant);
router.post("/add_stock", productController.addProductVariantStock);

module.exports = router;
