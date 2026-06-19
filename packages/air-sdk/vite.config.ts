/**
 * Vite 业务 SDK 构建配置
 *
 * 构建 air-sdk 业务组件框架，输出 ESM 格式并保留模块结构以支持 tree-shaking。
 * 样式合并为 dist/air-sdk.css，供宿主应用统一引入。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import {resolve} from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    cssMinify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
      cssFileName: 'air-sdk',
    },

    rollupOptions: {
      external: (id: string) => {
        if (id.startsWith('\0')) return false
        if (id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.startsWith('react-dom/')) return true
        if (id === 'umi' || id.startsWith('umi/')) return true
        if (id === 'air-design' || id.startsWith('air-design/')) return true
        if (id === 'crypto-js' || id.startsWith('crypto-js/')) return true
        return false
      },

      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
      },
    },

    copyPublicDir: false,
  },
})
