import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Default Vite port
  },
  preview: {
    host: '0.0.0.0', // Listen on all network interfaces for preview
    port: 4173, // Default preview port
  }
})
