import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            tag === 'digital35-meinfahrzeugshop-suche'
        }
      }
    })
  ],
  server: {
    host: true,
    cors: true,
    allowedHosts: ['d35-challenge.cypherweb.dev']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2019',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/widget.js',
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/widget.css'
          }

          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
