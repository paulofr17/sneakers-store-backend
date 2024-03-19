const prisma = require("../../config/prisma");

module.exports = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories.map(category => category.name));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching available categories' });
    }
  }
}