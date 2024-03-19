const prisma = require("../../config/prisma");

module.exports = {
  getAllSizes: async (req, res) => {
    try {
      const sizes = await prisma.size.findMany();
      res.json(sizes.map(size => size.number));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching available sizes' });
    }
  }
}