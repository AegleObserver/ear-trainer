import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base 需与 GitHub 仓库名一致 (替换为实际仓库名)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ear-trainer/',
})
