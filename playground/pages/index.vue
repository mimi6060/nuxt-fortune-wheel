<script setup lang="ts">
/**
 * Fortune Wheel - User Page
 * The wheel for end users to spin
 */

import type { Prize } from '~/types'

// Toast notifications
const toast = useToast()

// State
const wheelPrizes = ref<Prize[]>([])
const availableSpins = ref(3)
const spinDuration = ref(4000)
const isLoading = ref(true)
const isSpinning = ref(false)
const showWinModal = ref(false)
const currentPrize = ref<Prize | null>(null)
const qrCode = ref<string | null>(null)
const wheelRef = ref<InstanceType<typeof FortuneWheel> | null>(null)

// Computed
const probabilityValid = computed(() =>
  wheelPrizes.value.reduce((sum, p) => sum + p.probability, 0) === 100,
)

// API
async function loadConfig() {
  try {
    const data = await $fetch<{ prizes: Prize[], availableSpins: number, spinDuration: number }>('/api/fortune-wheel/config')
    wheelPrizes.value = data.prizes
    availableSpins.value = data.availableSpins
    spinDuration.value = data.spinDuration || 4000
  }
  catch {
    toast.error('Erreur lors du chargement de la roue')
  }
}

onMounted(async () => {
  isLoading.value = true
  await loadConfig()
  isLoading.value = false
})

// Wheel functions
function handleSpinRequest(prizeIndex: number) {
  if (isSpinning.value || availableSpins.value <= 0) return
  triggerSpin(prizeIndex)
}

function triggerSpin(prizeIndex: number) {
  isSpinning.value = true
  wheelRef.value?.spinToIndex(prizeIndex)
}

async function handleSpinEnd(_prize: Prize, index: number) {
  isSpinning.value = false
  availableSpins.value--

  // Get prize from our local state using the index
  const prize = wheelPrizes.value[index]
  currentPrize.value = prize

  if (prize.type !== 'lost') {
    // Generate signed QR code via API
    try {
      const response = await $fetch<{ qrCode: string }>('/api/fortune-wheel/qrcode', {
        method: 'POST',
        body: {
          prizeId: prize.id,
          prizeName: prize.name,
          prizeType: prize.type,
          discountValue: prize.discountValue,
        },
      })
      qrCode.value = response.qrCode
    }
    catch {
      toast.error('Erreur lors de la génération du QR code')
      qrCode.value = null
    }
    showWinModal.value = true
  }
}

function closeModal() {
  showWinModal.value = false
  currentPrize.value = null
  qrCode.value = null
}

function spinWheel() {
  if (isSpinning.value || availableSpins.value <= 0) return
  isSpinning.value = true
  const index = wheelRef.value?.selectRandomPrizeIndex()
  if (index !== undefined) {
    wheelRef.value?.spinToIndex(index)
  }
}
</script>

<template>
  <div class="wheel-page">
    <header class="header">
      <h1>Roue de la Fortune</h1>
      <p>Tentez votre chance !</p>
    </header>

    <!-- Loading state -->
    <LoadingSpinner v-if="isLoading" />

    <main
      v-else
      class="main"
    >
      <div class="spins-counter">
        <span class="spins-label">Tours disponibles:</span>
        <span class="spins-value">{{ availableSpins }}</span>
      </div>

      <FortuneWheel
        ref="wheelRef"
        :prizes="wheelPrizes"
        :disabled="availableSpins <= 0 || isSpinning"
        :size="420"
        :spin-duration="spinDuration"
        @spin-start="isSpinning = true"
        @spin-end="handleSpinEnd"
        @spin-request="handleSpinRequest"
      />

      <button
        class="spin-button"
        :disabled="availableSpins <= 0 || isSpinning || !probabilityValid"
        @click="spinWheel"
      >
        <span v-if="!probabilityValid">Configuration invalide</span>
        <span v-else-if="isSpinning">En cours...</span>
        <span v-else-if="availableSpins <= 0">Plus de tours</span>
        <span v-else>Tourner la roue !</span>
      </button>
    </main>

    <!-- Win Modal -->
    <WinModal
      :show="showWinModal"
      :prize="currentPrize"
      :qr-code="qrCode"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.wheel-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  color: #888;
  font-size: 1.2rem;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.spins-counter {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 40px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.spins-label {
  font-size: 1.1rem;
  color: #aaa;
}

.spins-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4ECDC4;
}

.spin-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 20px 60px;
  font-size: 1.4rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.spin-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.spin-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
