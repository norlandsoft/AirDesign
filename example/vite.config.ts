/**
 * example Demo Vite 配置
 *
 * 独立的 Vite + React 应用，通过 workspace 链接引用 air-design。
 * 运行前需先构建 air-design：npm run build:design
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
