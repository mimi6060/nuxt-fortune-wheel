<script setup lang="ts">
/**
 * WinModal Component
 * Displays the winning prize with animation and QR code
 * Fully accessible with focus trap, keyboard navigation, and ARIA attributes
 */
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Prize } from '../types'

interface Props {
  show: boolean
  prize: Prize | null
  qrCode: string | null
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Présentez ce QR code en caisse pour récupérer votre gain !',
})

const emit = defineEmits<{
  close: []
}>()

const showConfetti = ref(false)
const qrCodeUrl = ref<string | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const confirmButtonRef = ref<HTMLButtonElement | null>(null)

// Generate QR code image URL using a free API
watch(
  () => props.qrCode,
  (newVal) => {
    if (newVal) {
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(newVal)}`
    }
  },
  { immediate: true },
)

// Handle modal show/hide
watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      // Trigger confetti
      showConfetti.value = true
      setTimeout(() => {
        showConfetti.value = false
      }, 3000)

      // Focus the confirm button when modal opens
      await nextTick()
      confirmButtonRef.value?.focus()
    }
  },
)

// Handle keyboard events
function handleKeyDown(event: KeyboardEvent) {
  if (!props.show) return

  if (event.key === 'Escape') {
    event.preventDefault()
    handleClose()
    return
  }

  // Focus trap: Tab and Shift+Tab
  if (event.key === 'Tab') {
    const focusableElements = modalRef.value?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="win-modal-overlay"
        role="presentation"
        @click.self="handleClose"
      >
        <!-- Confetti animation (respects reduced motion) -->
        <div
          v-if="showConfetti"
          class="confetti-container"
          aria-hidden="true"
        >
          <div
            v-for="i in 50"
            :key="i"
            class="confetti"
            :style="{ '--delay': `${Math.random() * 3}s`, '--x': `${Math.random() * 100}vw` }"
          />
        </div>

        <div
          ref="modalRef"
          class="win-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-modal-title"
          aria-describedby="win-modal-description"
        >
          <!-- Close button -->
          <button
            ref="closeButtonRef"
            class="win-modal-close"
            aria-label="Fermer"
            @click="handleClose"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <!-- Trophy icon -->
          <div
            class="win-modal-trophy"
            aria-hidden="true"
          >
            🎉
          </div>

          <!-- Title -->
          <h2
            id="win-modal-title"
            class="win-modal-title"
          >
            Félicitations !
          </h2>

          <!-- Prize info -->
          <div
            v-if="prize"
            id="win-modal-description"
            class="win-modal-prize"
          >
            <img
              v-if="prize.image"
              :src="prize.image"
              :alt="prize.name"
              class="win-modal-prize-image"
            >
            <p class="win-modal-prize-name">
              Vous avez gagné
            </p>
            <h3 class="win-modal-prize-title">
              {{ prize.name }}
            </h3>
          </div>

          <!-- QR Code -->
          <div
            v-if="qrCodeUrl"
            class="win-modal-qr"
          >
            <img
              :src="qrCodeUrl"
              alt="QR Code de votre gain"
              class="win-modal-qr-image"
            >
            <p class="win-modal-message">
              {{ message }}
            </p>
          </div>

          <!-- Action button -->
          <button
            ref="confirmButtonRef"
            class="win-modal-button"
            @click="handleClose"
          >
            Compris !
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.win-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.win-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: bounceIn 0.6s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .win-modal {
    animation: none;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.win-modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.win-modal-close:hover,
.win-modal-close:focus {
  background: rgba(255, 255, 255, 0.3);
  outline: 2px solid white;
  outline-offset: 2px;
}

.win-modal-trophy {
  font-size: 80px;
  margin-bottom: 10px;
  animation: pulse 1s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .win-modal-trophy {
    animation: none;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.win-modal-title {
  color: white;
  font-size: 32px;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.win-modal-prize {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.win-modal-prize-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
  border-radius: 10px;
}

.win-modal-prize-name {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.win-modal-prize-title {
  color: #333;
  font-size: 24px;
  margin: 5px 0 0 0;
}

.win-modal-qr {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.win-modal-qr-image {
  width: 150px;
  height: 150px;
  margin-bottom: 10px;
}

.win-modal-message {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.win-modal-button {
  background: white;
  color: #764ba2;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.win-modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.win-modal-button:focus {
  outline: 3px solid white;
  outline-offset: 2px;
}

/* Confetti */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1001;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #ff0 0%, #f0f 50%, #0ff 100%);
  top: -10px;
  left: var(--x);
  animation: fall 3s linear var(--delay) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    animation: none;
    display: none;
  }
}

.confetti:nth-child(odd) {
  background: linear-gradient(45deg, #f00 0%, #ff0 50%, #0f0 100%);
  width: 8px;
  height: 8px;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Modal transitions */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .win-modal,
.modal-leave-to .win-modal {
  transform: scale(0.9);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.1s;
  }

  .modal-enter-from .win-modal,
  .modal-leave-to .win-modal {
    transform: none;
  }
}
</style>
