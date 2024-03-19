const prisma = require("../../config/prisma");

module.exports = {
  async getOrdersByUserId(req, res) {
    try {
      const orders = await prisma.order.findMany({
        where: { user_id: parseInt(req.params.userId) },
        include: {
          order_item: {
            include: {
              product_stock: {
                select: {
                  product_variant: {
                    select: {
                      id: true,
                      slug: true,
                    }
                  }
                }
              }
            }
          },
        },
      }).then((orders) => 
        orders.map((order) => ({
            ...order,
            order_item: order.order_item.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              preview_image: item.preview_image,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
              product_id: item.product_stock.product_variant.id,
              slug: item.product_stock.product_variant.slug
            }))
          })
        )
      );

      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async createOrder(req, res) {
    try{
      const { userId } = req.body;
      if(!userId){
        return res.status(400).json({ error: "Invalid request data" });
      }
      const order = await prisma.$transaction(async (tx) => {

        const cart = await tx.cart.findFirst({
          where: { userId: parseInt(userId) },
          include: {
            cart_item: {
              select: {
                id: true,
                quantity: true,
                product_stock: {
                  select: {
                    id: true,
                    size_number: true,
                    product_variant_id: true,
                    product_variant: {
                      select: {
                        color: true,
                        price: true,
                        preview_image: true,
                        product: {
                          select: {
                            name: true,
                            description: true,
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

        const createdOrder = await tx.order.create({
          data: {
            user: { connect: { id: parseInt(userId) } },
            price: cart.cart_item.reduce((acc, cur) => cur.quantity * cur.product_stock.product_variant.price + acc, 0),
            order_item: {
              create: await Promise.all(cart.cart_item.map(async (item) => {
                // Create the order_item
                const orderItem = {
                  name: item.product_stock.product_variant.product.name,
                  description: item.product_stock.product_variant.product.description,
                  preview_image: item.product_stock.product_variant.preview_image,
                  color: item.product_stock.product_variant.color.name,
                  size: item.product_stock.size_number,
                  quantity: item.quantity,
                  price: Number(item.product_stock.product_variant.price),
                  totalPrice: item.quantity * item.product_stock.product_variant.price,
                  product_stock: { connect: { id: item.product_stock.id } },
                };
        
                // Get the current product_stock quantity
                const productStock = await tx.product_stock.findUnique({
                  where: { id: item.product_stock.id },
                  select: { quantity: true, product_variant: { select: { product: { select: { name: true }}}}}
                });

                // Check if the new quantity will be less than 0
                if (productStock.quantity - item.quantity < 0) {
                  throw new Error(`No stock available for the product "${productStock.product_variant.product.name}"`);
                }

                // Update the product_stock quantity
                await tx.product_stock.update({
                  where: { id: item.product_stock.id },
                  data: { quantity: { decrement: item.quantity } },
                });
        
                return orderItem;
              })),
            },
          },
          include: {
            order_item: true,
          }
        });

        await tx.cart_item.deleteMany({
          where: {
            cart_id: cart.id
          }
        })
        return createdOrder;
      });
      
      return res.status(200).json(order);
    } catch (error) {
      if (error.message.startsWith('No stock available')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async getBestSellerProducts(req, res) {
    try{
      const products = await prisma.$queryRaw`
        SELECT 
          product_stock.product_variant_id as id,
          product.name,
          product.price,
          product_variant.slug as slug,
          product_variant.preview_image as image,
          SUM(order_item.quantity) as sold_products
        FROM 
          order_item 
        INNER JOIN 
          product_stock ON product_stock.id = order_item.product_stock_id
        INNER JOIN 
          product_variant ON product_variant.id = product_stock.product_variant_id
        INNER JOIN
          product ON product_variant.product_id = product.id
        GROUP BY 
          product_stock.product_variant_id,
          product.name,
          product.price,
          product_variant.slug,
          product_variant.preview_image
        ORDER BY 
          sold_products DESC
        LIMIT 10;`;

      const convertedProducts = products.map(product => {
        const { sold_products, ...rest } = product;
        return {
        ...rest,
        }
      });
      res.send(convertedProducts);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
}