import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rubi/',
  plugins: [react()],
  server: {
    port: 3001,
    host: 'localhost',
    cors: false,
    proxy: {
      '/api': {
        target: 'https://www.ganjianping.com',
        // target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxying request to:', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Proxy response status:', proxyRes.statusCode)
          })
        },
      },
    },
  },
})
