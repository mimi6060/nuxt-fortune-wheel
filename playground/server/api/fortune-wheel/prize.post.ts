// Prize endpoint - POST /api/fortune-wheel/prize
import prisma from '../../utils/prisma'
import { getOrCreateActiveConfig, serializePrize } from '../../utils/wheelConfig'
import { createPrizeSchema, validateBody } from '../../utils/validation'
import { PrizeType, LostColor, DiscountColors, type DiscountValue } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = validateBody(createPrizeSchema, body)

  const config = await getOrCreateActiveConfig()

  // Build prize name based on type
  let name = validatedData.name
  if (validatedData.type === PrizeType.DISCOUNT && !name) {
    name = `Bon ${validatedData.discountValue}%`
  }
  else if (validatedData.type === PrizeType.LOST && !name) {
    name = 'Perdu !'
  }
  else if (validatedData.type === PrizeType.PRODUCT && validatedData.productId) {
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })
    if (product) {
      name = name || product.name
    }
    else {
      throw createError({ statusCode: 400, message: 'Product not found' })
    }
  }

  // Determine color
  let color = validatedData.color
  if (!color) {
    if (validatedData.type === PrizeType.DISCOUNT && validatedData.discountValue) {
      color = DiscountColors[validatedData.discountValue as DiscountValue]
    }
    else {
      color = LostColor
    }
  }

  const prize = await prisma.prize.create({
    data: {
      type: validatedData.type,
      name: name || 'Unknown',
      image: validatedData.image || null,
      probability: validatedData.probability,
      color,
      discountValue: validatedData.type === PrizeType.DISCOUNT ? validatedData.discountValue : null,
      productId: validatedData.type === PrizeType.PRODUCT ? validatedData.productId : null,
      wheelConfigId: config.id,
    },
  })

  setResponseStatus(event, 201)
  return serializePrize(prize)
})
