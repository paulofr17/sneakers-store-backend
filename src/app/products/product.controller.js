const prisma = require("../../config/prisma");
const { generateImagesUrl } = require("../../lib/image_upload.js");
const { bytesToBase64, imagePathToBytes } = require("../helpers/helper.js");

module.exports = {
  getProducts: async (req, res) => {
    try {
      const { min, max, price, category } = req.query;
      const where = {};

      if (price) {
        const [minPrice, maxPrice] = price.split("-");
        where.product_variant = {
          some: {
            price: {
              gte: parseFloat(minPrice),
              lte: parseFloat(maxPrice),
            },
          },
        };
      }
      else if (min || max) {
        where.product_variant = {
          some: {
            price: {
              gte: min ? parseFloat(min) : 0,
              lte: max ? parseFloat(max) : 99999999,
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
          price: true,
          product_category: {
            select: {
              category_name: true,
            },
          },
          product_variant: {
            select: {
              id: true,
              slug: true,
              price: true,
              color_name: true,
              preview_image: true,
              product_stock: {
                select: {
                  size_number: true,
                  quantity: true,
                },
                orderBy: {
                  size_number: 'asc'
                },
              },
            },
          },
        },
      });

      const reducer = (accumulator, current) => {
        return accumulator + current.quantity;
      };

      const products = fullProductsInfo.map(({ product_variant, product_category, ...product }) => {
        let productTotalStock = 0;
        const variants = product_variant.map(
          ({ product_stock, color_name, preview_image, ...productItem }) => {
            const stock = product_stock.reduce(reducer, 0);
            productTotalStock += stock;
            return {
              ...productItem,
              color: color_name,
              stock,
              product_stock: product_stock.map((stock) => ({ size: stock.size_number, quantity: stock.quantity})),
              preview_image,
            };
          }
        );
        return {
          ...product,
          stock: productTotalStock,
          categories: product_category.map((category) => category.category_name),
          variants,
        };
      });
      res.send(products);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching products",
      });
    }
  },
  //   try {
  //     const product = await prisma.product.findFirst({
  //       where: { id: parseInt(req.params.id) },
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //         image: true,
  //         product_variant: {
  //           select: {
  //             id: true,
  //             price: true,
  //             active: true,
  //             preview_image: true,
  //             image: true,
  //             color: true,
  //             product_stock: {
  //               select: {
  //                 size: true,
  //                 quantity: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (product) {
  //       product.variants = product.product_variant.map((productItem) => {
  //         return {
  //           ...productItem,
  //           image: productItem.image.map((image) => image.url),
  //           color: productItem.color.name,
  //           product_stock: productItem.product_stock.map((stock) => {
  //             return {
  //               size: stock.size.number,
  //               quantity: stock.quantity,
  //             };
  //           })
  //         };
  //       });
  //       const { product_variant, ...productWithVariants } = product;
  //       return res.send(productWithVariants);
  //     }
  //     res.status(404).json({
  //       success: 0,
  //       message: "Product not found",
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: 0,
  //       message: "An error occurred while fetching products",
  //     });
  //   }
  // },
  getProductById: async (req, res) => {
    try {
      if(!req.params?.id || isNaN(req.params.id)) {
        return res.status(404).json({
          success: 0,
          message: "Invalid product id",
        });
      }

      const product = await prisma.product.findFirst({
        where: { id: parseInt(req.params.id) },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          product_category: {
            select: {
              category_name: true,
            }
          },
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
                orderBy: {
                  size_number: 'asc'
                }
              },
            },
          },
        },
      });

      if (product) {
        product.categories = product.product_category.map((category) => category.category_name);
        product.colors = product.product_variant.map((variant) => variant.color.name);
        product.variants = product.product_variant.map((productVariant) => {
          return {
            id: productVariant.id,
            slug: productVariant.slug,
            preview_image: productVariant.preview_image,
            images: productVariant.image.map((image) => image.url),
            color: productVariant.color.name,
            sizes: productVariant.product_stock.map((stock) => stock.size.number)
          };
        });
        const { product_variant, product_category, ...productWithVariants } = product;
        return res.send(productWithVariants);
      }

      res.status(404).json({
        success: 0,
        message: "Product not found",
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred fetching product",
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
      res.status(500).json({
        success: 0,
        message: "An error occurred while creating product",
      });
    }
  },
  createProductWithVariants: async (req, res) => {
    try {
      // Upload images to Google Cloud Storage
      const files = await generateImagesUrl(req.files);
      // // Create product with variants
      const product = JSON.parse(req.body.jsonData);
      await prisma.$transaction(async (prisma) => {
        const variants = product.variants;
        // Check if slug already exists
        const existingSlug = await prisma.product_variant.findFirst({
          select:{
            slug: true
          },
          where: {
            slug: {
              in: variants.map((variant) => variant.slug),
            },
          }
        });
        if(existingSlug) {
          return res.status(400).json({
            error: `Already exists a product with the following slug - ${existingSlug.slug}`,
          });
        }

        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            // Create product category records
            product_category: {
              create: product.categories.map((category) => ({
                category_name: category,
              })),
            },
            product_variant: {
              create: variants.map((variant) => ({
                price: product.price,
                slug: variant.slug,
                preview_image: files.find((file) => file.fieldname === `variants[${variant.color}][preview_image]`).url,
                // Connect to color table
                color: {
                  connect: {
                    name: variant.color,
                  }
                },
                // Create product image records
                image: {
                  create: files.filter((file) => file.fieldname.includes(`variants[${variant.color}][images]`)).map((file) => ({
                    url: file.url
                  }))
                },
                // Create product stock records
                product_stock: {
                  create: variant.sizes.map((size) => ({
                    size: {
                      connect: {
                        number: size,
                      }
                    },
                  }))
                },
              })),
            },
          },
        });
        res.status(201).send(newProduct);
      }, {
        maxWait: 5000,
        timeout: 10000,
      })
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while creating product with variants",
      });
    }
  },
  updateProductVariants: async (req, res) => {
    try {
      if(!req.params?.id || isNaN(req.params.id)) {
        return res.status(404).json({
          success: 0,
          message: "Invalid product id",
        });
      }
      // Upload images to Google Cloud Storage
      const files = await generateImagesUrl(req.files);
      // // Create product with variants
      const product = JSON.parse(req.body.jsonData);
      await prisma.$transaction(async (prisma) => {
        const variants = product.variants;

        const existingVariants = await prisma.product.findFirst({
          where: {
            id: parseInt(req.params.id),
          },
          select: {
            product_variant: {
              select: {
                color_name: true,
                product_stock: true,
                image: true,
              }
            }
          }

        })
        const variantsToDelete = existingVariants.product_variant.filter((variant) => !variants.some((newVariant) => newVariant.color === variant.color_name));
        const variantsToUpdate = variants.filter((variant) => existingVariants.product_variant.some((existingVariant) => existingVariant.color_name === variant.color));
        const variantsToCreate = variants.filter((variant) => !existingVariants.product_variant.some((existingVariant) => existingVariant.color_name === variant.color));

        const updatedProduct = await prisma.product.update({
          where: {
            id: parseInt(req.params.id),
          },
          include: {
            product_variant: {
              include: {
                image: true,
                product_stock: true
              }
            },
          },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            product_category: {
              deleteMany: {},
              create: product.categories.map((category) => ({
                category_name: category,
              })),
            },
            product_variant: {
              deleteMany: {
                color_name: {
                  in: variantsToDelete.map((variant) => variant.color_name)
                }
              },
              update: variantsToUpdate.map((variant) => ({
                where: {
                  product_id_color_name: {
                    product_id: parseInt(req.params.id),
                    color_name: variant.color,
                  }
                },
                data: {
                  price: product.price,
                  slug: variant.slug,
                  preview_image: files.find((file) => file.fieldname === `variants[${variant.color}][preview_image]`)?.url || variant.preview_image,
                  image: {
                    delete: files.find((file) => file.fieldname.includes(`variants[${variant.color}][images]`)) ? 
                            existingVariants.product_variant.find((prodvariant) => prodvariant.color_name == variant.color).image :
                            [],
                    create: files.filter((file) => file.fieldname.includes(`variants[${variant.color}][images]`)).map((file) => ({ url: file.url })) 
                  },
                  product_stock: {
                    delete: existingVariants.product_variant.find((prodvariant) => prodvariant.color_name == variant.color).
                            product_stock.filter((stock) => !variant.sizes.includes(stock.size_number.toString())),
                    create: variant.sizes.filter((size) => 
                      {
                        const existingVariant = existingVariants.product_variant.find((prodvariant) => prodvariant.color_name == variant.color)
                        if(!existingVariant){
                          return true;
                        }
                        return !existingVariant.product_stock.some((stock) => stock.size_number == size)
                      }).map((size) => ({
                      size: {
                        connect: {
                          number: size,
                        }
                      },
                    }))
                  },
                },
              })),
              create: variantsToCreate.map((variant) => ({
                price: product.price,
                slug: variant.slug,
                preview_image: files.find((file) => file.fieldname === `variants[${variant.color}][preview_image]`).url, 
                color: {
                  connect: {
                    name: variant.color,
                  }
                },
                image: {
                  create: files.filter((file) => file.fieldname.includes(`variants[${variant.color}][images]`)).map((file) => ({ url: file.url }))
                },
                product_stock: {
                  create: variant.sizes.map((size) => ({
                    size: {
                      connect: {
                        number: size,
                      }
                    },
                  }))
                },
              })),
            },
          },
        });
        res.status(201).send(updatedProduct);
      }, {
        maxWait: 5000,
        timeout: 10000,
      })
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while creating product with variants",
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
      res.status(500).json({
        success: 0,
        message: "An error occurred while deleting product",
      });
    }
  },
};
