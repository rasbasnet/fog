import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = '/fog/'

export default defineConfig({
  base,
  plugins: [react()],
})
