<script setup lang="ts">
/**
 * Loading spinner component
 */
interface Props {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  message: 'Chargement...',
  size: 'medium',
})
</script>

<template>
  <div
    class="loading"
    role="status"
    aria-live="polite"
  >
    <div
      class="spinner"
      :class="`spinner--${size}`"
    />
    <p v-if="message">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 20px;
}

.loading p {
  color: #888;
  font-size: 1.1rem;
}

.spinner {
  border: 4px solid #333;
  border-top-color: #4ECDC4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner--small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

.spinner--medium {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

.spinner--large {
  width: 70px;
  height: 70px;
  border-width: 5px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
