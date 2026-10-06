import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Dev only: forward API calls (and the session cookie) to the Express server.
  server: { proxy: { '/api': 'http://localhost:3000' } },
})
