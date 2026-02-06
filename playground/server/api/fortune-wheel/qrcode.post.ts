// QR Code generation endpoint - POST /api/fortune-wheel/qrcode
import { z } from 'zod'
import { createSignedQRCode, type QRCodeData } from '../../utils/qrcode'
import { validateBody } from '../../utils/validation'

const qrCodeRequestSchema = z.object({
  prizeId: z.string().min(1),
  prizeName: z.string().min(1),
  prizeType: z.string().min(1),
  discountValue: z.number().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = validateBody(qrCodeRequestSchema, body)

  const now = Date.now()
  const qrData: QRCodeData = {
    prizeId: validatedData.prizeId,
    prizeName: validatedData.prizeName,
    prizeType: validatedData.prizeType,
    discountValue: validatedData.discountValue,
    timestamp: now,
    validUntil: now + 24 * 60 * 60 * 1000, // 24 hours
  }

  const signedQRCode = createSignedQRCode(qrData)

  return {
    qrCode: signedQRCode,
    validUntil: qrData.validUntil,
  }
})
