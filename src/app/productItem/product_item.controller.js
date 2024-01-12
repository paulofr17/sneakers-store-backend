const prisma = require("../../config/prisma");
const { bytesToBase64, imagePathToBytes } = require("../helpers/helper.js");

module.exports = {
  getProductItems: async (req, res) => {
    try {
      const productItems = await prisma.product_item.findMany({
        include: {
          _count: true,
        },
      });
      res.send(productItems);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching product items",
      });
    }
  },
  getProductItemById: async (req, res) => {
    try {
      const productItem = await prisma.product_item.findFirst({
        where: { id: parseInt(req.params.id) },
        select: {
          id: true,
          price: true,
          product_id: true,
          color_name: true,
          preview_image: true,
          image: true,
          product: {
            select: {
              name: true,
              description: true,
            },
          },
          product_stock: {
            select: {
              id: true,
              size_number: true,
              quantity: true,
            },
          },
        },
      });
      if (productItem) {
        const product = [productItem].map(
          ({
            id,
            product_id,
            price,
            color_name,
            product,
            preview_image,
            image,
            product_stock,
            ...productItem
          }) => {
            const productStock = product_stock.map((stock) => {
              return {
                id: stock.id,
                size: stock.size_number,
                quantity: stock.quantity,
              };
            });
            return {
              id,
              product_id,
              name: product.name,
              description: product.description,
              price,
              color: color_name,
              product_stock: productStock,
              ...productItem,
              preview_image: bytesToBase64(preview_image),
              images: image.map((image) => {
                return bytesToBase64(image.file);
              }),
            };
          }
        );
        return res.send(product[0]);
      }
      res.status(404).json({
        success: 0,
        message: "Product not found",
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching products",
      });
    }
  },
  createProductItem: async (req, res) => {
    try {
      const productItem = await prisma.product_item.upsert({
        where: {
          product_id_color_name: {
            product_id: req.body.product_id,
            color_name: req.body.color,
          },
        },
        create: {
          product_id: req.body.product_id,
          color_name: req.body.color,
          description: req.body.description,
          price: req.body.price,
          preview_image: imagePathToBytes(req.body.preview_image),
          image: {
            createMany: {
              data: req.body.images.map((image) => {
                return { file: imagePathToBytes(image.path) };
              }),
            },
          },
          product_stock: {
            createMany: {
              data: req.body.size.map((size) => {
                return { size_number: size };
              }),
            },
          },
        },
        update: {
          description: req.body.description,
          price: req.body.price,
          product_stock: {
            createMany: {
              skipDuplicates: true,
              data: req.body.size.map((size) => {
                return { size_number: size };
              }),
            },
          },
        },
      });
      return res.status(201).send(productItem);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while adding product item",
      });
    }
  },
  addProductStock: async (req, res) => {
    try {
      const productsToCreate = [];
      const productsToUpdate = await prisma.product_stock.findMany({
        where: {
          product_item_id: req.body.product_item_id,
          size_number: {
            in: req.body.stock.map((product) => product.size),
          },
        },
      });
      // Create product stocks
      req.body.stock.forEach((product) => {
        const index = productsToUpdate.findIndex(
          (stock) => stock.size_number == product.size
        );
        if (index == -1) {
          productsToCreate.push({
            product_item_id: req.body.product_item_id,
            size_number: product.size,
            quantity: product.quantity,
          });
        } else {
          productsToUpdate[index].quantity =
            productsToUpdate[index].quantity + product.quantity;
        }
      });

      const createdProducts = await prisma.product_stock.createMany({
        skipDuplicates: true,
        data: productsToCreate,
      });
      // Update existing product stocks
      const updatedProducts = await prisma.$transaction(async (tx) => {
        productsToUpdate.forEach(async (product) => {
          await prisma.product_stock.update({
            where: {
              product_item_id_size_number: {
                product_item_id: product.product_item_id,
                size_number: product.size_number,
              },
            },
            data: {
              quantity: product.quantity,
            },
          });
        });
      });
      res
        .status(201)
        .json({ sucess: 1, message: "Product stock updated successfully" });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while adding product item",
      });
    }
  },
};
