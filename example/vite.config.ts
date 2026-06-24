/**
 * example Demo Vite 配置
 *
 * 独立的 Vite + React 应用，通过 workspace 引用 air-design / air-kit。
 * 运行前需先构建：npm run build 或 pnpm run build
 *
 * @author ChaiMingXu, 2026/06/24
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'node:path'

const monorepoRoot = resolve(__dirname, '..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // CSS 子路径需指向 dist 产物（优先于包名 alias）
      {
        find: 'air-design/style.css',
        replacement: resolve(monorepoRoot, 'packages/air-design/dist/style.css'),
      },
      {
        find: 'air-kit/style.css',
        replacement: resolve(monorepoRoot, 'packages/air-kit/dist/air-kit.css'),
      },
      {find: 'air-design', replacement: resolve(monorepoRoot, 'packages/air-design')},
      {find: 'air-kit', replacement: resolve(monorepoRoot, 'packages/air-kit')},
    ],
  },
  optimizeDeps: {
    exclude: ['air-design', 'air-kit'],
  },
  server: {
    port: 5174,
    open: true,
    fs: {
      allow: [monorepoRoot],
    },
  },
  build: {
    outDir: 'dist',
  },
})
