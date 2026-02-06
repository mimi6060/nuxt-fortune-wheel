// Catalog endpoint - GET /api/fortune-wheel/catalog
import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  })

  return { products }
})
