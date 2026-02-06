// QR Code verification endpoint - GET /api/fortune-wheel/qrcode?code=xxx
import { verifyQRCode } from '../../utils/qrcode'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing QR code' })
  }

  const data = verifyQRCode(code)

  if (!data) {
    throw createError({ statusCode: 400, message: 'Invalid or expired QR code' })
  }

  return {
    valid: true,
    data,
  }
})
