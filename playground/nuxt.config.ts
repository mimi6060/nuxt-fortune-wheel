export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  fortuneWheel: {
    // Configuration will come from API in production
  },
})
