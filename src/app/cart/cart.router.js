const router = require("express").Router();
const { checkToken } = require("../../lib/auth");
const cartController = require("./cart.controller");

router.get("/:userId", checkToken, cartController.getCartItemsByUserId);
router.post("/cartItem/", checkToken, cartController.createCartItem);
router.post("/cartItem/:id", checkToken, cartController.reduceCartItemQuantity);
router.delete("/cartItem/:id", checkToken, cartController.deleteCartItemById);
router.delete("/:userId", checkToken, cartController.deleteAllCartItemsByUserId);

module.exports = router;
