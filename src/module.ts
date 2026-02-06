import { defineNuxtModule, addComponent, addImports, createResolver } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * API endpoint to fetch wheel configuration
   */
  apiEndpoint?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-fortune-wheel',
    configKey: 'fortuneWheel',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    apiEndpoint: undefined,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register components
    addComponent({
      name: 'FortuneWheel',
      filePath: resolver.resolve('./runtime/components/FortuneWheel.vue'),
    })

    addComponent({
      name: 'WinModal',
      filePath: resolver.resolve('./runtime/components/WinModal.vue'),
    })

    // Register composables
    addImports({
      name: 'useFortuneWheel',
      as: 'useFortuneWheel',
      from: resolver.resolve('./runtime/composables/useFortuneWheel'),
    })

    // Make module options available at runtime
    nuxt.options.runtimeConfig.public.fortuneWheel = options
  },
})
