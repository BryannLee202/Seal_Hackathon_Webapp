import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // BFF only allows CORS from localhost:3000 (the dockerized frontend), so
  // `npm run dev` on any other port needs this proxy to reach it.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4001', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
