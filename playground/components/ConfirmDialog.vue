<script setup lang="ts">
/**
 * Confirm dialog component
 * Accessible modal for confirmation dialogs
 */
const { state, handleConfirm, handleCancel } = useConfirm()

const confirmButtonRef = ref<HTMLButtonElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

// Focus management and keyboard handling
watch(
  () => state.value.show,
  async (show) => {
    if (show) {
      await nextTick()
      confirmButtonRef.value?.focus()
    }
  },
)

function handleKeyDown(event: KeyboardEvent) {
  if (!state.value.show) return

  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
    return
  }

  // Focus trap
  if (event.key === 'Tab') {
    const focusableElements = dialogRef.value?.querySelectorAll('button')
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

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="state.show"
        class="confirm-overlay"
        role="presentation"
        @click.self="handleCancel"
      >
        <div
          ref="dialogRef"
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          <h3
            v-if="state.options?.title"
            id="confirm-title"
            class="confirm-title"
          >
            {{ state.options.title }}
          </h3>

          <p
            id="confirm-message"
            class="confirm-message"
          >
            {{ state.options?.message }}
          </p>

          <div class="confirm-actions">
            <button
              class="confirm-btn confirm-btn--cancel"
              @click="handleCancel"
            >
              {{ state.options?.cancelText || 'Annuler' }}
            </button>
            <button
              ref="confirmButtonRef"
              class="confirm-btn"
              :class="state.options?.confirmVariant === 'danger' ? 'confirm-btn--danger' : 'confirm-btn--primary'"
              @click="handleConfirm"
            >
              {{ state.options?.confirmText || 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.confirm-dialog {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  border: 1px solid #333;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.confirm-title {
  color: #fff;
  font-size: 1.25rem;
  margin: 0 0 12px 0;
}

.confirm-message {
  color: #aaa;
  font-size: 1rem;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.confirm-btn:focus {
  outline: 2px solid #4ECDC4;
  outline-offset: 2px;
}

.confirm-btn--cancel {
  background: #444;
  color: #fff;
}

.confirm-btn--cancel:hover {
  background: #555;
}

.confirm-btn--primary {
  background: #4ECDC4;
  color: #1a1a2e;
}

.confirm-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.confirm-btn--danger {
  background: #E74C3C;
  color: #fff;
}

.confirm-btn--danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* Transitions */
.confirm-enter-active {
  transition: all 0.2s ease-out;
}

.confirm-leave-active {
  transition: all 0.15s ease-in;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

.confirm-enter-from .confirm-dialog,
.confirm-leave-to .confirm-dialog {
  transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .confirm-enter-active,
  .confirm-leave-active {
    transition: opacity 0.1s;
  }

  .confirm-enter-from .confirm-dialog,
  .confirm-leave-to .confirm-dialog {
    transform: none;
  }
}
</style>
