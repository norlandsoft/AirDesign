/**
 * Vite 组件库构建配置
 *
 * 使用 Vite library mode 构建 air-design 组件库。
 * 输出 ESM 格式，保留模块结构以支持 tree-shaking。
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import dts from 'vite-plugin-dts'
import {resolve} from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.build.json',
    }),
  ],

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
      cssFileName: 'style',
    },

    rollupOptions: {
      // 第三方包不打包进产物（使用函数匹配所有子路径，避免 Vite CJS polyfill 将源码打包进来）
      external: (id: string) => {
        if (id.startsWith('\0')) return false
        // React 全家桶（含 scheduler）
        if (id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.startsWith('react-dom/') || id === 'scheduler' || id.startsWith('scheduler/')) return true
        // Ant Design
        if (id === 'antd' || id.startsWith('antd/') || id === '@ant-design/icons' || id.startsWith('@ant-design/icons/') || id === '@ant-design/colors' || id.startsWith('@ant-design/colors/')) return true
        // Semi UI
        if (id === '@douyinfe/semi-ui' || id.startsWith('@douyinfe/semi-ui/')) return true
        // Tiptap
        if (id.startsWith('@tiptap/')) return true
        // XYFlow
        if (id === '@xyflow/react' || id.startsWith('@xyflow/react/')) return true
        // DnD Kit
        if (id.startsWith('@dnd-kit/')) return true
        // Monaco Editor
        if (id === 'react-monaco-editor' || id.startsWith('react-monaco-editor/') || id === 'monaco-editor' || id.startsWith('monaco-editor/')) return true
        // Markdown / 代码高亮
        if (id === 'react-markdown' || id.startsWith('react-markdown/') || id === 'react-syntax-highlighter' || id.startsWith('react-syntax-highlighter/')) return true
        // 其他
        const others = ['react-textarea-autosize', 'lowlight', 'mermaid', 'tippy.js', 'remark-gfm', 'remark-math', 'rehype-raw', 'rehype-katex', 'katex', 'react-lifecycles-compat']
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
