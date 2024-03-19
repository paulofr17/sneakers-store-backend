const prisma = require("../../config/prisma");

module.exports = {
  getAllColors: async (req, res) => {
    try {
      const colors = await prisma.color.findMany();
      res.json(colors.map(color => color.name));
    } catch (error) {
      res.status(500).json({ error: 'Error fetching available colors' });
    }
  }
}