/**
 * Types for the Fortune Wheel module
 */

// For Vue refs
import type { Ref } from 'vue'

// ============================================
// Prize Types
// ============================================

export const PrizeType = {
  PRODUCT: 'product',
  DISCOUNT: 'discount',
  LOST: 'lost',
} as const

export type PrizeTypeValue = typeof PrizeType[keyof typeof PrizeType]

export interface Prize {
  id: string
  name: string
  image?: string | null
  probability: number // Percentage (0-100)
  color?: string // Segment color
  // Extended fields for specific prize types
  type?: PrizeTypeValue
  productId?: string | null
  discountValue?: number | null
}

// ============================================
// Configuration Types
// ============================================

export interface SpinConfig {
  prizes: Prize[]
  availableSpins: number
  spinDuration?: number // in ms, default 4000
  onWin?: (prize: Prize) => void
}

export interface SpinResult {
  prize: Prize
  qrCode: string // QR code data or URL
  message: string
  claimedAt?: Date
}

// ============================================
// Component Types
// ============================================

export interface FortuneWheelProps {
  prizes: Prize[]
  spinning?: boolean
  disabled?: boolean
  size?: number // wheel size in px
  spinDuration?: number
}

export interface FortuneWheelEmits {
  (e: 'spin-start'): void
  (e: 'spin-end', prize: Prize, index: number): void
  (e: 'spin-request', index: number): void
}

// ============================================
// Composable Types
// ============================================

export interface UseFortuneWheelOptions {
  apiEndpoint?: string
  mockData?: SpinConfig
}

export interface UseFortuneWheelReturn {
  prizes: Ref<Prize[]>
  availableSpins: Ref<number>
  currentPrize: Ref<Prize | null>
  isSpinning: Ref<boolean>
  hasWon: Ref<boolean>
  qrCode: Ref<string | null>
  spin: () => Promise<SpinResult | null>
  reset: () => void
  fetchConfig: () => Promise<void>
}
