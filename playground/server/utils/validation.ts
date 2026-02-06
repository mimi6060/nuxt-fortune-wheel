/**
 * Zod validation schemas for API endpoints
 */
import { z } from 'zod'
import { PrizeType, DiscountValues } from '~/types'

// Color validation (hex color)
const hexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')

// Prize type enum
const prizeTypeSchema = z.enum([PrizeType.PRODUCT, PrizeType.DISCOUNT, PrizeType.LOST])

// Create prize schema
export const createPrizeSchema = z.object({
  type: prizeTypeSchema,
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
  probability: z.number().int().min(0).max(100).default(10),
  color: hexColorSchema.optional(),
  discountValue: z.number().refine(
    val => DiscountValues.includes(val as typeof DiscountValues[number]),
    { message: 'Invalid discount value' },
  ).optional().nullable(),
  productId: z.string().min(1).max(50).optional().nullable(),
}).refine(
  (data) => {
    // If type is discount, discountValue is required
    if (data.type === PrizeType.DISCOUNT && !data.discountValue) {
      return false
    }
    // If type is product, productId is required
    if (data.type === PrizeType.PRODUCT && !data.productId) {
      return false
    }
    return true
  },
  {
    message: 'discountValue required for discount type, productId required for product type',
  },
)

// Update prize schema (all fields optional)
export const updatePrizeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
  probability: z.number().int().min(0).max(100).optional(),
  color: hexColorSchema.optional(),
  discountValue: z.number().refine(
    val => DiscountValues.includes(val as typeof DiscountValues[number]),
    { message: 'Invalid discount value' },
  ).optional().nullable(),
  productId: z.string().min(1).max(50).optional().nullable(),
})

// Update config schema
export const updateConfigSchema = z.object({
  availableSpins: z.number().int().min(1).max(99).optional(),
  spinDuration: z.number().int().min(1000).max(10000).optional(),
})

// Utility to validate and return typed data or throw error
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: `Validation error: ${result.error.errors.map(e => e.message).join(', ')}`,
    })
  }
  return result.data
}
