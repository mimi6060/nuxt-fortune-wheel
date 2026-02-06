import { ref } from 'vue'
import type { Prize, SpinConfig, SpinResult, UseFortuneWheelOptions, UseFortuneWheelReturn } from '../types'

/**
 * Composable for managing fortune wheel state and logic
 */
export function useFortuneWheel(options: UseFortuneWheelOptions = {}): UseFortuneWheelReturn {
  const prizes = ref<Prize[]>([])
  const availableSpins = ref(0)
  const currentPrize = ref<Prize | null>(null)
  const isSpinning = ref(false)
  const hasWon = ref(false)
  const qrCode = ref<string | null>(null)

  /**
   * Select a prize based on probabilities
   */
  function selectPrize(): Prize {
    const random = Math.random() * 100
    let cumulative = 0

    for (const prize of prizes.value) {
      cumulative += prize.probability
      if (random <= cumulative) {
        return prize
      }
    }

    // Fallback to last prize
    return prizes.value[prizes.value.length - 1]
  }

  /**
   * Generate QR code data for the prize
   */
  function generateQRCode(prize: Prize): string {
    const timestamp = Date.now()
    const data = {
      prizeId: prize.id,
      prizeName: prize.name,
      timestamp,
      validUntil: timestamp + 24 * 60 * 60 * 1000, // Valid 24h
    }
    // Return base64 encoded JSON for QR code
    return btoa(JSON.stringify(data))
  }

  /**
   * Fetch configuration from API
   */
  async function fetchConfig(): Promise<void> {
    if (options.mockData) {
      prizes.value = options.mockData.prizes
      availableSpins.value = options.mockData.availableSpins
      return
    }

    if (options.apiEndpoint) {
      try {
        const response = await fetch(options.apiEndpoint)
        const data: SpinConfig = await response.json()
        prizes.value = data.prizes
        availableSpins.value = data.availableSpins
      }
      catch (error) {
        console.error('Failed to fetch fortune wheel config:', error)
        throw error
      }
    }
  }

  /**
   * Spin the wheel and get a result
   */
  async function spin(): Promise<SpinResult | null> {
    if (isSpinning.value || availableSpins.value <= 0) {
      return null
    }

    isSpinning.value = true
    hasWon.value = false
    currentPrize.value = null
    qrCode.value = null

    // Select prize based on probabilities
    const prize = selectPrize()

    // Return the result (the actual animation is handled by the component)
    return new Promise((resolve) => {
      // We set the prize immediately, but the component will animate
      currentPrize.value = prize

      // The component will call onSpinEnd when animation completes
      // For now, we just return the data structure
      const result: SpinResult = {
        prize,
        qrCode: generateQRCode(prize),
        message: `Félicitations ! Vous avez gagné : ${prize.name}`,
      }

      qrCode.value = result.qrCode
      resolve(result)
    })
  }

  /**
   * Called when spin animation ends
   */
  function onSpinComplete(): void {
    isSpinning.value = false
    availableSpins.value--
    hasWon.value = true
  }

  /**
   * Reset the wheel state
   */
  function reset(): void {
    currentPrize.value = null
    hasWon.value = false
    qrCode.value = null
  }

  return {
    prizes,
    availableSpins,
    currentPrize,
    isSpinning,
    hasWon,
    qrCode,
    spin,
    reset,
    fetchConfig,
    // Internal method exposed for component
    onSpinComplete,
  } as UseFortuneWheelReturn & { onSpinComplete: () => void }
}
