import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://freelancerpro-e7cbdnb6bkayc2f8.eastasia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
