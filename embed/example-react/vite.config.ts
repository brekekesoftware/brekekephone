import ssl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), ...(process.env.HTTPS ? [ssl()] : [])],
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: Infinity,
  },
  base: process.env.NODE_ENV === 'production' ? '/embed' : undefined,
})
