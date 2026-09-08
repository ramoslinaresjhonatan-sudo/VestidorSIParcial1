import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'KEY_STRIPE'],
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(currentDirectory, './src'),
    },
  },
})
