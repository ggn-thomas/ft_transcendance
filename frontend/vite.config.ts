import { defineConfig } from 'vite'
import fs from 'fs'

const httpsConfig = fs.existsSync('/certs/key.pem') ? {
  key: fs.readFileSync('/certs/key.pem'),
  cert: fs.readFileSync('/certs/cert.pem')
} : undefined;

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'https://backend:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

