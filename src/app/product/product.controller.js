const prisma = require("../../config/prisma");
const { bytesToBase64, imagePathToBytes } = require("../helpers/helper.js");

module.exports = {
  getProducts: async (req, res) => {
    try {
      const { price, category } = req.query;
      const where = {};
      if (price) {
        const [minPrice, maxPrice] = price.split("-");
        where.product_item = {
          some: {
            price: {
              gte: parseFloat(minPrice),
              lte: parseFloat(maxPrice),
            },
          },
        };
      }
      if (category) {
        const categories = category.split(",");
        where.product_category = {
          some: {
            category_name: {
              in: categories,
            },
          },
        };
      }
      const fullProductsInfo = await prisma.product.findMany({
        where: where,
        select: {
          id: true,
          name: true,
          description: true,
          product_item: {
            select: {
              id: true,
              price: true,
              color_name: true,
              preview_image: true,
              product_stock: {
                select: {
                  size_number: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });

      const reducer = (accumulator, current) => {
        return accumulator + current.quantity;
      };

      const products = fullProductsInfo.map(({ product_item, ...product }) => {
        let product_quantity = 0;
        const productItems = product_item.map(
          ({ product_stock, color_name, preview_image, ...productItem }) => {
            let quantity = product_stock.reduce(reducer, 0);
            product_quantity += quantity;

            return {
              ...productItem,
              color: color_name,
              quantity: quantity,
              preview_image: bytesToBase64(preview_image),
            };
          }
        );
        return {
          ...product,
          quantity: product_quantity,
          productItems,
        };
      });

      res.send(products);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching products",
      });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id: parseInt(req.params.id) },
        select: {
          id: true,
          name: true,
          description: true,
          product_item: {
            select: {
              id: true,
              preview_image: true,
            },
          },
        },
      });

      if (product) {
        product.product_item.map((productItem) => {
          productItem.preview_image = bytesToBase64(productItem.preview_image);
        });
        product.productItems = product.product_item;
        delete product.product_item;
        return res.send(product);
      }
      res.status(404).json({
        success: 0,
        message: "Product not found",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching products",
      });
    }
  },
  createProduct: async (req, res) => {
    try {
      const product = await prisma.product.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          image: imagePathToBytes(req.body.image),
        },
      });
      res.status(201).send(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: 0,
        message: "An error occurred while creating product",
      });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const product = await prisma.product.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      res.send(product);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: 0,
        message: "An error occurred while deleting product",
      });
    }
  },
};
