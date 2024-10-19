// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  
  devtools: { enabled: true },
  
  runtimeConfig: {
    ZoomVideoSDKKey: process.env.ZOOM_SDK_KEY,
    ZoomVideoSDKSecret: process.env.ZOOM_SDK_SECRET
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'video-player-container'
    }
  }

})
