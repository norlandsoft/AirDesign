/**
 * Vite 组件库构建配置（air-design 2.0）
 *
 * 重构后底层：shadcn/ui（Radix UI）+ TailwindCSS v4。
 * Tailwind 经 @tailwindcss/vite 插件编译，最终合并输出 style.css。
 * 第三方包（React / Radix / Tiptap / Monaco / XYFlow / dnd-kit / Markdown 等）标记 external，
 * 不打包进产物，由消费方按需安装。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import {resolve} from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.build.json',
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    // 关闭 CSS 压缩：组件库产物由消费者项目负责压缩
    cssMinify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
      cssFileName: 'style',
    },

    rollupOptions: {
      // 第三方包不打包进产物（函数匹配所有子路径，避免 Vite CJS polyfill 把源码打进产物）
      external: (id: string) => {
        if (id.startsWith('\0')) return false
        // React 全家桶（含 scheduler）
        if (id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.startsWith('react-dom/') || id === 'scheduler' || id.startsWith('scheduler/')) return true
        // Radix UI 原语
        if (id.startsWith('@radix-ui/')) return true
        // 通用工具
        const utils = ['clsx', 'tailwind-merge', 'class-variance-authority', 'sonner', 'react-colorful', 'react-arborist']
        if (utils.some(u => id === u || id.startsWith(u + '/'))) return true
        // TanStack Table
        if (id === '@tanstack/react-table' || id.startsWith('@tanstack/react-table/')) return true
        // Tiptap
        if (id.startsWith('@tiptap/')) return true
        // XYFlow
        if (id === '@xyflow/react' || id.startsWith('@xyflow/react/')) return true
        // DnD Kit
        if (id.startsWith('@dnd-kit/')) return true
        // Monaco Editor
        if (id === '@monaco-editor/react' || id.startsWith('@monaco-editor/react/') || id === 'monaco-editor' || id.startsWith('monaco-editor/')) return true
        // Markdown / 代码高亮
        if (id === 'react-markdown' || id.startsWith('react-markdown/') || id === 'react-syntax-highlighter' || id.startsWith('react-syntax-highlighter/')) return true
        // 其他渲染相关
        const others = ['react-textarea-autosize', 'lowlight', 'mermaid', 'remark-gfm', 'remark-math', 'rehype-raw', 'rehype-katex', 'katex', 'highlight.js', 'tippy.js']
        if (others.some(o => id === o || id.startsWith(o + '/'))) return true
        return false
      },

      output: {
        // 保留模块结构，支持消费者 tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
      },
    },

    // 字体等资源不内联为 base64
    assetsInlineLimit: 0,
    copyPublicDir: false,
  },
})
