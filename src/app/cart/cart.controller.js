const prisma = require("../../config/prisma");
const { bytesToBase64, imagePathToBytes } = require("../helpers/helper.js");

module.exports = {
  getCartItemsByUserId: async (req, res) => {
    try {
      const cart = await prisma.cart.findFirst({
        where: { user_id: parseInt(req.params.userId) },
        include: {
          cart_item: {
            select: {
              id: true,
              quantity: true,
              product_stock: {
                select: {
                  id: true,
                  size_number: true,
                  product_item: {
                    select: {
                      color: true,
                      description: true,
                      price: true,
                      preview_image: true,
                      product: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (cart) {
        const flattenedCart = cart.cart_item.map((item) => {
          const {
            id: cart_item_id,
            quantity,
            product_stock: {
              id: product_stock_id,
              size_number,
              product_item: {
                color,
                description,
                price,
                preview_image,
                product: { name },
              },
            },
          } = item;
          return {
            cart_item_id: cart_item_id,
            product_id: product_stock_id,
            quantity: quantity,
            name: name,
            description: description,
            price: Number(price),
            color: color.name,
            size: Number(size_number),
            preview_image: bytesToBase64(preview_image),
          };
        });
        return res.status(200).json({
          id: cart.id,
          cartItems: flattenedCart,
        });
      }
      res.status(404).json({
        success: 0,
        message: "Cart not found",
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching cart items",
      });
    }
  },
  createCartItem: async (req, res) => {
    try {
      const cartItem = await prisma.cart_item.upsert({
        where: {
          cart_id_product_stock_id: {
            cart_id: req.body.cart_id,
            product_stock_id: req.body.product_stock_id,
          },
        },
        update: {
          quantity: {
            increment: req.body.quantity,
          },
        },
        create: {
          quantity: req.body.quantity,
          cart: {
            connect: { id: req.body.cart_id },
          },
          product_stock: {
            connect: { id: req.body.product_stock_id },
          },
        },
      });

      res.status(200).send(cartItem);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while adding items to cart",
      });
    }
  },
  reduceCartItemQuantity: async (req, res) => {
    try {
      await prisma.$transaction(async (tx) => {
        const cartItem = await tx.cart_item.findFirst({
          where: { id: parseInt(req.params.id) },
        });

        if (!cartItem)
          return res.status(404).json({
            success: 0,
            message: "Cart Item doenst exist",
          });

        if (cartItem.quantity < 2) {
          const deletedCartItem = await tx.cart_item.delete({
            where: { id: parseInt(req.params.id) },
          });
          return res.status(200).send(deletedCartItem);
        } else {
          const updatedCartItem = await tx.cart_item.update({
            where: { id: parseInt(req.params.id) },
            data: {
              quantity: {
                decrement: 1,
              },
            },
          });
          return res.status(200).send(updatedCartItem);
        }
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while reducing cart item quantity",
      });
    }
  },
  deleteCartItemById: async (req, res) => {
    try {
      const cartItem = await prisma.cart_item.delete({
        where: { id: parseInt(req.params.id) },
      });
      if (cartItem) {
        return res.status(200).send(cartItem);
      }
      res.status(405).json({
        success: 0,
        message: "Delete not allowed",
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while deleting cart item",
      });
    }
  },
  deleteAllCartItemsByUserId: async (req, res) => {
    try {
      const deletedCartItems = await prisma.cart_item.deleteMany({
        where: { cart_id: parseInt(req.params.userId) },
      });
      return res.status(200).send(deletedCartItems);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while deleting cart items",
      });
    }
  },
};
