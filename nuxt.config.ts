// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  vuetify: {
    defaults: {
      VApp: {
        style: {
          backgroundColor: '#121212'
        }
      }
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            primary: '#1DB954',
            secondary: '#181818',
            background: '#121212',
            surface: '#282828'
          }
        }
      }
    }
  },
  runtimeConfig: {
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    public: {
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID
    }
  }
})