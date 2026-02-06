// Prize endpoint - PUT /api/fortune-wheel/prize/:id
import prisma from '../../../utils/prisma'
import { serializePrize } from '../../../utils/wheelConfig'
import { updatePrizeSchema, validateBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing prize ID' })
  }

  const body = await readBody(event)
  const validatedData = validateBody(updatePrizeSchema, body)

  // Check if prize exists
  const existing = await prisma.prize.findUnique({
    where: { id },
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Prize not found' })
  }

  // Update prize
  const prize = await prisma.prize.update({
    where: { id },
    data: {
      name: validatedData.name ?? existing.name,
      image: validatedData.image !== undefined ? validatedData.image : existing.image,
      probability: validatedData.probability ?? existing.probability,
      color: validatedData.color ?? existing.color,
      discountValue: validatedData.discountValue !== undefined ? validatedData.discountValue : existing.discountValue,
      productId: validatedData.productId !== undefined ? validatedData.productId : existing.productId,
    },
  })

  return serializePrize(prize)
})
