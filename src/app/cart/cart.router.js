const router = require("express").Router();
const {
  getCartItemsByUserId,
  createCartItem,
  reduceCartItemQuantity,
  deleteCartItemById,
  deleteAllCartItemsByUserId,
} = require("./cart.controller");

router.get("/:userId", getCartItemsByUserId);
router.post("/cartItem/", createCartItem);
router.post("/cartItem/:id", reduceCartItemQuantity);
router.delete("/cartItem/:id", deleteCartItemById);
router.delete("/:userId", deleteAllCartItemsByUserId);

module.exports = router;
