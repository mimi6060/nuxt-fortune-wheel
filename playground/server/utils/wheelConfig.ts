/**
 * Wheel configuration utilities
 * Shared logic for managing wheel config
 */
import prisma from './prisma'

const DEFAULT_CONFIG = {
  name: 'default',
  availableSpins: 3,
  spinDuration: 4000,
  isActive: true,
}

/**
 * Get the active wheel config, or create default if none exists
 */
export async function getOrCreateActiveConfig(includePrizes = false) {
  let config = await prisma.wheelConfig.findFirst({
    where: { isActive: true },
    include: includePrizes ? { prizes: { orderBy: { createdAt: 'asc' } } } : undefined,
  })

  if (!config) {
    config = await prisma.wheelConfig.create({
      data: DEFAULT_CONFIG,
      include: includePrizes ? { prizes: true } : undefined,
    })
  }

  return config
}

/**
 * Serialize a prize for API response
 */
export function serializePrize(prize: {
  id: string
  type: string
  productId: string | null
  name: string
  image: string | null
  probability: number
  color: string
  discountValue: number | null
}) {
  return {
    id: prize.id,
    type: prize.type,
    productId: prize.productId,
    name: prize.name,
    image: prize.image,
    probability: prize.probability,
    color: prize.color,
    discountValue: prize.discountValue,
  }
}
