/**
 * Confirm dialog composable
 * Provides a promise-based confirmation dialog
 */

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
}

interface ConfirmState {
  show: boolean
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({
  show: false,
  options: null,
  resolve: null,
})

export function useConfirm() {
  function confirm(options: ConfirmOptions | string): Promise<boolean> {
    return new Promise((resolve) => {
      state.value = {
        show: true,
        options: typeof options === 'string' ? { message: options } : options,
        resolve,
      }
    })
  }

  function handleConfirm() {
    state.value.resolve?.(true)
    closeDialog()
  }

  function handleCancel() {
    state.value.resolve?.(false)
    closeDialog()
  }

  function closeDialog() {
    state.value = {
      show: false,
      options: null,
      resolve: null,
    }
  }

  return {
    state: readonly(state),
    confirm,
    handleConfirm,
    handleCancel,
  }
}
