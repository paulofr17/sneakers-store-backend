const prisma = require("../../config/prisma.js");
const { imagePathToBytes } = require("../helpers/helper.js");

module.exports = {
  getProductVariants: async (req, res) => {
    try {
      const productItems = await prisma.product_variant.findMany({
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
  getNewArrivals: async (req, res) => {
    try{
      const products = await prisma.product_variant.findMany({
        take: 10,
        orderBy: {
          created_at: 'desc'
        },
        select: {
          slug: true,
          price: true,
          preview_image: true,
          product: {
            select: {
              name: true
            }
          }
        }
      });

      const newArrivals = products.map((product) => ({
        name: product.product.name,
          slug: product.slug,
          price: product.price,
          image: product.preview_image
        })
      )

      return res.send(newArrivals);
    } catch(error){
      return res.send(500).json({error: "An error occurred while fetching new arrivals"})
    }
  },
  getProductVariantBySlug: async (req, res) => {
    try {
      const productId = await prisma.product_variant.findFirst({
        where: { slug: req.params.slug },
        select: {
          product_id: true,
        }
      }).then((product) => product?.product_id);

      if(!productId) {
        return res.status(404).json({
          success: 0,
          message: "Product not found",
        });
      }

      const product = await prisma.product.findFirst({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          product_variant: {
            select: {
              id: true,
              slug: true,
              preview_image: true,
              image: true,
              color: true,
              product_stock: {
                select: {
                  id: true,
                  size: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });

      if (product) {
        product.variants = product.product_variant.map((productVariant) => {
          return {
            ...productVariant,
            image: productVariant.image.map((image) => image.url),
            color: productVariant.color.name,
            product_stock: productVariant.product_stock.map((stock) => {
              return {
                id: stock.id,
                size: stock.size.number,
                quantity: stock.quantity,
              };
            })
          };
        });
        const { product_variant, ...productWithVariants } = product;
        return res.send(productWithVariants);
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
  createProductVariant: async (req, res) => {
    try {
      const productItem = await prisma.product_variant.upsert({
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
  addProductVariantStock: async (req, res) => {
    try {
      const productsToCreate = [];
      const productsToUpdate = await prisma.product_stock.findMany({
        where: {
          product_variant_id: req.body.product_variant_id,
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
            product_variant_id: req.body.product_variant_id,
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
              product_variant_id_size_number: {
                product_variant_id: product.product_variant_id,
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
