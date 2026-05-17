/**
 * Vite 组件库构建配置
 *
 * 使用 Vite library mode 构建 air-design 组件库。
 * 输出 ESM 格式，保留模块结构以支持 tree-shaking。
 *
 * @author ChaiMingXu, on 2026/05/14
 */
import {defineConfig, type Plugin} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import dts from 'vite-plugin-dts'
import {resolve} from 'node:path'
import {readFileSync} from 'node:fs'

/**
 * 自定义插件：将所有 .less 文件作为 CSS Modules 处理
 *
 * Vite 默认只对 *.module.less 启用 CSS Modules，但本项目所有组件
 * 使用 import styles from './xxx.less' 的方式导入样式。
 * 此插件在 resolveId 阶段将 .less 扩展名重写为 .module.less，
 * 触发 Vite 内置的 CSS Modules 处理流程，然后在 load 阶段
 * 从原始文件路径读取内容，确保 Less 编译器正常工作。
 */
function lessAsCSSModules(): Plugin {
  /** 记录被重定向的模块 ID，避免 load 钩子误拦截 */
  const redirectedIds = new Set<string>()

  return {
    name: 'less-as-css-modules',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.endsWith('.less') || !importer || source.includes('base.less')) {
        return null
      }
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      })
      if (!resolved) return null
      // 将 .less 改为 .module.less，让 Vite 识别为 CSS Module
      const moduleId = resolved.id.replace(/\.less$/, '.module.less')
      redirectedIds.add(moduleId)
      return {id: moduleId}
    },
    load(id) {
      if (redirectedIds.has(id)) {
        const realPath = id.replace(/\.module\.less$/, '.less')
        try {
          return readFileSync(realPath, 'utf-8')
        } catch {
          return null
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    lessAsCSSModules(),
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.build.json',
    }),
  ],

  css: {
    modules: {
      generateScopedName: '[local]',
      localsConvention: 'camelCaseOnly',
    },
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
