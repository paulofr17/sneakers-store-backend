const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const categories = [
  'Nike',
  'Adidas',
  'Puma',
  'Reebok',
  'Vans',
  'Converse',
  'New Balance',
]

const colors = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Orange',
  'Pink',
  'Brown',
]

const sizes = [
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
]

async function main() {
  console.log(`Start seeding ...`)

  await Promise.all([
    prisma.category.createMany({
      data: categories.map(category => ({ name: category })),
      skipDuplicates: true,
    }),
    prisma.color.createMany({
      data: colors.map(color => ({ name: color })),
      skipDuplicates: true,
    }),
    prisma.size.createMany({
      data: sizes.map(size => ({ number: size })),
      skipDuplicates: true,
    })
  ]);

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
