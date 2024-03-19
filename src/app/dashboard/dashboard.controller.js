const prisma = require("../../config/prisma");

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      if(isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({
          error: "Start date and end date are required",
        });
      }

      const { _sum: { price: revenue } } = await prisma.order.aggregate({ _sum: { price: true } })
      const { _sum: { price: revenueInRange } } = await prisma.order.aggregate({
        _sum: { price: true },
        where: { created_at: { gte: startDate, lte: endDate } }
      })
      const orders = await prisma.order.count();
      const ordersInRange = await prisma.order.count({ where: { created_at: { gte: startDate, lte: endDate, }}});
      const products = await prisma.product.count();
      const productsInRange = await prisma.product.count({ where: { created_at: { gte: startDate, lte: endDate, }}});
      const productVariants = await prisma.product_variant.count();
      const productVariantsInRange = await prisma.product_variant.count({ where: { created_at: { gte: startDate, lte: endDate, }}});
      const users = await prisma.user.count();
      const usersInRange = await prisma.user.count({ where: { created_at: { gte: startDate, lte: endDate, }}});

      res.json({
        orders,
        ordersInRange,
        products,
        productsInRange,
        productVariants,
        productVariantsInRange,
        users,
        usersInRange,
        revenue: Number(revenue) || 0,
        revenueInRange: Number(revenueInRange) || 0,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the dashboard data",
      });
    }
  },
}