import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Use Vite's default developer port (5173) to avoid conflicts with macOS
    // services that may bind port 5000. We explicitly set 5173 here so the
    // helper script can reliably open the frontend at http://localhost:5173.
    port: 5173,
    proxy: {
      '/api': {
        // Backend is running on 5001 (5000 used by a macOS system service),
        // update the proxy to point to the working backend port.
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
