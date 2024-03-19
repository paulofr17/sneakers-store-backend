const prisma = require("../../config/prisma.js");

module.exports = {
  async updateProductVariantStock(req, res) {
    try {
      const stockItems = req.body;

      const productVariantId = Number(req.params.productVariantId);
      if(isNaN(productVariantId)){
        return res.status(400).json({ error: "Product variant id is required" })
      }

      const updatedStockPromises = stockItems.map(async (stock) => (
        prisma.product_stock.update({
          where: { product_variant_id_size_number: { product_variant_id: productVariantId, size_number: stock.size } },
          data: {
            quantity: Number(stock.quantity),
          },
        })
      ))
      const updatedStockResults = await Promise.all(updatedStockPromises);
    
      return res.send(updatedStockResults);
    
    } catch (error) {
      res.status(500).json({ error: "An error occurred while updating stock" });
    }
  }
 }