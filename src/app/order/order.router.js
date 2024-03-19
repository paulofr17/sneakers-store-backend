const router = require("express").Router();
const { checkToken } = require("../../lib/auth");
const orderController = require("./order.controller");

router.get("/bestSellers", orderController.getBestSellerProducts);  
router.get("/:userId", checkToken, orderController.getOrdersByUserId);
router.post("/", checkToken, orderController.createOrder);

module.exports = router;
