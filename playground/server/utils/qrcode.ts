/**
 * QR Code generation and verification utilities
 * Uses HMAC-SHA256 for signing to prevent forgery
 */
import { createHmac } from 'node:crypto'

// Secret key for signing - should be in environment variable in production
const QR_SECRET = process.env.QR_SECRET || 'fortune-wheel-secret-key-change-in-production'

export interface QRCodeData {
  prizeId: string
  prizeName: string
  prizeType: string
  discountValue?: number | null
  timestamp: number
  validUntil: number
}

export interface SignedQRCode extends QRCodeData {
  signature: string
}

/**
 * Generate HMAC signature for QR code data
 */
function generateSignature(data: QRCodeData): string {
  const payload = JSON.stringify({
    prizeId: data.prizeId,
    prizeName: data.prizeName,
    prizeType: data.prizeType,
    discountValue: data.discountValue,
    timestamp: data.timestamp,
    validUntil: data.validUntil,
  })

  return createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('hex')
}

/**
 * Create a signed QR code data object
 */
export function createSignedQRCode(data: QRCodeData): string {
  const signature = generateSignature(data)

  const signedData: SignedQRCode = {
    ...data,
    signature,
  }

  return Buffer.from(JSON.stringify(signedData)).toString('base64')
}

/**
 * Verify and decode a signed QR code
 * Returns null if invalid or expired
 */
export function verifyQRCode(encodedData: string): QRCodeData | null {
  try {
    const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8')) as SignedQRCode

    // Check if expired
    if (Date.now() > decoded.validUntil) {
      return null
    }

    // Verify signature
    const { signature, ...data } = decoded
    const expectedSignature = generateSignature(data)

    if (signature !== expectedSignature) {
      return null
    }

    return data
  }
  catch {
    return null
  }
}
