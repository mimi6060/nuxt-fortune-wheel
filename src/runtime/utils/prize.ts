/**
 * Prize utility functions
 */
import type { Prize } from '../types'

/**
 * Select a random prize index based on probability weights
 * @param prizes Array of prizes with probability fields
 * @returns The index of the selected prize
 */
export function selectRandomPrizeIndex(prizes: Prize[]): number {
  if (prizes.length === 0) return -1

  const random = Math.random() * 100
  let cumulative = 0

  for (let i = 0; i < prizes.length; i++) {
    cumulative += prizes[i].probability
    if (random <= cumulative) {
      return i
    }
  }

  return prizes.length - 1
}

/**
 * Select a random prize based on probability weights
 * @param prizes Array of prizes with probability fields
 * @returns The selected prize or null if no prizes
 */
export function selectRandomPrize(prizes: Prize[]): Prize | null {
  const index = selectRandomPrizeIndex(prizes)
  return index >= 0 ? prizes[index] : null
}

/**
 * Validate that prize probabilities sum to 100
 * @param prizes Array of prizes
 * @returns true if valid
 */
export function validateProbabilities(prizes: Prize[]): boolean {
  const total = prizes.reduce((sum, p) => sum + p.probability, 0)
  return Math.abs(total - 100) < 0.01 // Allow small floating point errors
}
