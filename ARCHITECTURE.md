# AirDesign 架构与设计说明

## 一、定位与目标

- **定位**：AirMachine 项目根目录下的独立前端组件包，提供可复用的 React 组件。
- **目标**：与主前端解耦，便于多应用共享、单独构建与版本管理；承接 frontend/src/components/AirDesign 下的全部组件，统一维护与发布。

## 二、技术选型

- **语言**：TypeScript，保证类型与主项目一致。
- **样式**：Less，与现有前端一致，变量与风格（如毛玻璃）可延续。
- **构建**：Rollup。原因：需同时处理 TS、Less，产出 ESM + CJS 及独立 CSS；Rollup 插件生态支持 Less 输出为单独 CSS 文件，便于使用方按需引入样式。
- **React**：以 peerDependencies 形式声明，由使用方提供版本，避免重复打包与多实例问题。
- **外部 UI**：antd、@douyinfe/semi-ui 以 peerDependencies 声明，由使用方提供，本库不打包。CodeEditor 因 Monaco 需 monaco-editor-webpack-plugin 配置，保留在前端。
- **字体**：Space Grotesk（界面）、JetBrains Mono（代码）通过 @fontsource 嵌入，构建时复制 woff2 到 dist/fonts，base.less 使用 @font-face 引用，无需 HTTP 请求。
- **全局样式**：base.less 提供 :root 设计令牌（--primary-color、--color-*、--font-family、--border-radius、--text-*、--font-size-form 等）、html 根字号、body 与 * 基础样式，组件直接使用变量定义样式。

## 三、Icon 与 SVG 策略

- **构建时**：`scripts/generate-icons.js` 扫描 `src/Icon/svg/*.svg` 与 `src/Splitter/*.svg`，生成 `src/Icon/icons-data.ts`，将 SVG 内容内联为字符串。
- **运行时**：Icon 组件从 `iconData` 中按 name 读取 SVG 字符串，经 DOMParser 解析后渲染；支持 name 的精确匹配及 toLowerCase/toUpperCase 等 fallback。
- **优势**：无需动态 import 或 fetch，无 238 个 chunk，构建与运行时路径简单；icons-data.ts 为构建产物，已加入 .gitignore。

## 四、组件设计原则

1. **无业务耦合**：不依赖具体业务接口、路由或状态库，仅依赖 React 及 peer 声明的 UI 库。
2. **内部引用**：组件间使用相对路径（如 `../Icon`、`../Button`），不依赖 `aird` 或 `@/` 等宿主别名。
3. **样式独立**：每个组件的 Less 在库内编译为 CSS，通过 `air-design/dist/index.css` 由使用方引入。
4. **类型导出**：构建产出 `.d.ts`，使用方可获得完整类型提示。

## 五、与主前端的集成方式

- 主前端通过 `"air-design": "file:../AirDesign"` 引用本地包。
- `frontend/src/components/AirDesign/` 仅保留 `index.ts`（re-export）与 `index.css`（CSS 变量）；`aird` 别名指向该目录，业务代码 `import { X } from 'aird'` 无需修改。
- 样式：re-export 入口引入 `air-design/dist/index.css` 与本地 `index.css`，一次引入即可。

## 六、全量组件列表

| 组件 | 说明 |
|------|------|
| Button | 毛玻璃风格按钮 |
| IconButton | 图标按钮，支持 Dropdown、Tooltip |
| MenuButton | 菜单按钮（semi Dropdown） |
| ToggleButton | 切换按钮 |
| Icon | 按 name 渲染 SVG 图标 |
| ColorPicker | 颜色选择器（antd） |
| Message | 消息提示 |
| Notification | 通知（success/warn/error/info） |
| Dialog | 对话框 |
| UploadDialog | 上传对话框 |
| EditableLabel | 可编辑标签 |
| GroupSplitter | 分组分割器 |
| Help | 帮助提示 |
| SlidePanel | 滑出面板 |
| Splitter | 分割面板（含 Pane） |
| TabPanel | 标签页 |
| Tree | 树形控件 |
| List | 列表 |
| LoadingPanel | 加载面板 |
| Table | 表格 |
| TableRowMenu | 表格行菜单 |
| CodeEditor | Monaco 代码编辑器（因 Monaco 需 webpack 插件配置，保留在前端） |

## 七、扩展新组件

1. 在 `src/` 下新建组件目录（如 `src/NewComponent/index.tsx` 及样式）。
2. 在 `src/index.ts` 中 `export` 新组件。
3. 若使用 Less，在对应组件内 `import './index.less'`，Rollup 的 Less 插件会将其合并进 `dist/index.css`。
4. 在 README 的「已包含组件」中补充说明。

---

Created by ChaiMingxu
