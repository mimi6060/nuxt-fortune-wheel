/**
 * Shared types and constants for Fortune Wheel playground
 * Re-exports from module types and adds playground-specific types
 */

// Re-export from module
export { PrizeType, type PrizeTypeValue, type Prize } from '../../src/runtime/types'

// ============================================
// Playground-specific Constants
// ============================================

export const DiscountValues = [5, 10, 15, 20, 25, 30] as const
export type DiscountValue = typeof DiscountValues[number]

export const DiscountColors: Record<DiscountValue, string> = {
  5: '#6A1B9A',
  10: '#1565C0',
  15: '#00838F',
  20: '#2E7D32',
  25: '#F9A825',
  30: '#EF6C00',
}

export const LostColor = '#424242'

export const PrizeLabels = {
  product: 'Article (produit)',
  discount: 'Bon de réduction (%)',
  lost: 'Perdu',
} as const

// ============================================
// Playground-specific Interfaces
// ============================================

export interface Product {
  id: string
  name: string
  image?: string
  suggestedColor: string
}

export interface WheelConfig {
  prizes: import('../../src/runtime/types').Prize[]
  availableSpins: number
  spinDuration: number
}
