# AirDesign

企业级 React 组件库，为全平台企业应用（JettoAuthor、AirMachine、测试管理平台等）提供统一的 UI 基础组件和业务组件。

## 技术栈

- **语言**: TypeScript（`strict: true`）
- **框架**: React 18+
- **构建工具**: Vite（Library Mode）
- **UI 基础**: **shadcn/ui（Radix UI 无障碍原语）** —— 禁止 Ant Design / Semi UI / ElementUI
- **样式方案**: **TailwindCSS v4 + 设计 Token（CSS 变量）** —— 禁止 Less / CSS-in-JS
- **图标**: 沿用自有 `Icon` 组件（229 个 SVG，主题适配）

## 项目结构（Monorepo）

本包位于 `packages/air-design/`，与 `packages/air-sdk/` 业务脚手架同属 AirDesign Monorepo。

```
packages/air-design/src/
├── index.ts                        # 组件库主入口
├── typings.d.ts                    # 全局类型声明
├── theme/                          # 设计 Token + TailwindCSS 入口
│   ├── index.css                   # @import tailwindcss + 语义变量（亮/暗）+ @layer base
│   ├── fonts.css                   # @font-face（Space Grotesk / JetBrains Mono）
│   └── fonts/                      # 字体 woff2 文件
├── primitives/                     # Radix UI 薄封装（shadcn 风格）
│   ├── button.tsx / dialog.tsx / alert-dialog.tsx / sheet.tsx
│   ├── tooltip.tsx / popover.tsx / dropdown-menu.tsx / tabs.tsx
│   ├── input.tsx / switch.tsx / checkbox.tsx / select.tsx
│   ├── separator.tsx / scroll-area.tsx / skeleton.tsx / slider.tsx / avatar.tsx
│   └── sonner.tsx                  # Toaster（sonner）
├── lib/cn.ts                       # className 合并工具（clsx + tailwind-merge）
└── components/                     # 业务级组件（基于 primitives 组合）
    ├── Button/                     # Button / IconButton / MenuButton / ToggleButton
    ├── Icon/                       # 自有图标（229 SVG）
    ├── ColorPicker/                # 颜色选择器（react-colorful + Popover）
    ├── Message/ / Notice/          # 命令式轻提示 / 通知
    ├── Dialog/                     # 对话框（Dialog / UploadDialog / AlertDialog）
    ├── EditableLabel/ / GroupSplitter/ / Help/
    ├── SlidePanel/                 # 侧滑抽屉（基于 Sheet）
    ├── Splitter/                   # 分割面板（Splitter / Pane）
    ├── TabPanel/                   # 标签页（基于 Tabs）
    ├── Tree/                       # 树（react-arborist）
    ├── List/ / MenuBar/ / PropertiesNaviBar/
    ├── Table/                      # 表格（TanStack Table / TableRowMenu）
    ├── LoadingPanel/ / Spin/
    ├── CodeEditor/                 # Monaco Editor
    ├── RichEditor/                 # TipTap 富文本
    ├── Markdown/                   # Markdown 渲染（react-markdown + mermaid）
    ├── Kanban/                     # 看板（dnd-kit）
    ├── MindPanel/                  # 思维导图（@xyflow/react）
    └── WebClient/                  # WebSocket 客户端
```

## 构建

本包位于 Monorepo 的 `packages/air-design/`。请在 **仓库根目录** 执行构建，不要在子包内单独 `npm install`（除非特殊调试）。

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与构建

```bash
# 在 AirDesign 根目录
cd /opt/AirDesign
npm install
npm run build:design    # 仅构建本包
# 或
npm run build           # 构建 air-design + air-sdk
```

### 构建产物

输出到 `packages/air-design/dist/`：

```
dist/
├── index.mjs              # ESM 主入口
├── style.css              # 合并样式（Tailwind + 组件 CSS，消费者必须引入）
├── src/index.d.ts         # TypeScript 类型入口
├── components/...         # 按组件拆分的模块
├── primitives/...         # Radix 薄封装模块
└── lib/cn.mjs
```

构建配置说明：

- 使用 Vite library mode，仅输出 ESM 格式
- 通过 `@tailwindcss/vite` 编译 TailwindCSS，合并为 `style.css`
- 通过 `vite-plugin-dts` 自动生成 `.d.ts` 类型声明文件
- 第三方依赖（React、Radix、TipTap、Monaco、TanStack、dnd-kit、XYFlow 等）标记为 `external`，不打包进产物
- 开启 `preserveModules` 保留模块结构，消费者项目可按需加载

## 在项目中引用

```tsx
// 引入样式（必须）
import 'air-design/style.css'

// 按需引入组件
import { Button, Table, CodeEditor, Icon, ColorPicker } from 'air-design'

// 引入类型
import type { CodeEditorRef, RichEditorRef } from 'air-design'
```

由于构建产物保留了模块结构并开启了 `sideEffects` 标记，打包工具（Webpack / Vite）会自动进行 tree-shaking，未使用的组件不会被打包。

---

### 方式一：本地路径引用（file: 协议）

适用于组件库和业务项目在同一台机器上的场景。

```bash
# 先在 Monorepo 根目录构建
cd /opt/AirDesign
npm run build:design

# 在业务项目中安装
cd /path/to/your-project
npm install file:../AirDesign/packages/air-design
```

或在 `package.json` 中配置：

```json
{
  "dependencies": {
    "air-design": "file:../AirDesign/packages/air-design"
  }
}
```

**注意事项：**

- 安装前需先构建，生成 `packages/air-design/dist/`
- 修改源码后重新构建；`file:` 安装会复制 dist，需再次 `npm install air-design`

```bash
cd /opt/AirDesign && npm run build:design
cd /path/to/your-project && npm install air-design
```

- 绝对路径示例：`"air-design": "file:/opt/AirDesign/packages/air-design"`

---

### 方式二：npm link 开发调试

适用于组件库开发阶段，需要频繁修改并实时在业务项目中验证的场景。`npm link` 创建的是符号链接，不复制文件，因此重新构建后业务项目立即生效，无需重新安装。

**步骤一：构建并创建全局链接**

```bash
cd /opt/AirDesign
npm install
npm run build:design
npm link -w air-design
```

**步骤二：在业务项目中链接**

```bash
cd /path/to/your-project
npm link air-design
```

**步骤三：开发联调**

```bash
cd /opt/AirDesign
npm run build:design
# 业务项目刷新即可
```

**取消链接：**

```bash
cd /path/to/your-project
npm unlink air-design

cd /opt/AirDesign
npm unlink -w air-design
```

**注意事项：**

- npm link 使用符号链接，业务项目直接引用 AirDesign 目录下的 `dist/`，不占用额外磁盘空间
- 构建后立即生效，无需重新安装，适合高频联调
- 如果业务项目使用 Webpack，可能遇到 React 双实例问题（组件库和业务项目各加载一份 React），解决方案是在业务项目的 `webpack.config.js` 中添加别名：

```js
resolve: {
  alias: {
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
  }
}
```

---

### 方式三：从 Git 仓库直接引用

适用于业务项目需要通过 `git clone` 获取组件库的场景，如 CI/CD 环境或团队协作。

由于 `dist/` 目录在 `.gitignore` 中被排除，Git 仓库中不包含构建产物，因此需要在安装后执行构建。有两种实现方式：

#### 方案 A：在 package.json 中配置 postinstall 自动构建

在 AirDesign 的 `package.json` 中添加 `postinstall` 脚本：

```json
{
  "scripts": {
    "postinstall": "npm run build"
  }
}
```

这样当业务项目通过 Git 安装时，npm 会自动执行构建。业务项目使用方式：

```bash
# SSH 协议
npm install git+ssh://git@github.com:your-org/AirDesign.git

# HTTPS 协议
npm install git+https://github.com/your-org/AirDesign.git

# 指定分支
npm install git+ssh://git@github.com:your-org/AirDesign.git#master

# 指定标签
npm install git+ssh://git@github.com:your-org/AirDesign.git#v1.0.0

# 指定 commit
npm install git+ssh://git@github.com:your-org/AirDesign.git#04330d7
```

或在 `package.json` 中配置：

```json
{
  "dependencies": {
    "air-design": "git+ssh://git@github.com:your-org/AirDesign.git#master"
  }
}
```

**注意：** postinstall 方式要求宿主机器有 Node.js 和 npm 环境，且需要能安装组件库的 devDependencies（Vite、TypeScript 等）。如果安装时间较长，不适合 CI 环境。

#### 方案 B：业务项目手动构建（推荐用于 CI/CD）

```bash
npm install
cd node_modules/air-design
npm install && npm run build
cd ../..
npm run build
```

## 与 air-sdk 配合使用

企业应用建议同时安装 `air-sdk`（业务脚手架），详见仓库根目录 [README.md](../../README.md) 与 [packages/air-sdk/README.md](../air-sdk/README.md)。

```tsx
import 'air-design/style.css'
import 'air-sdk/style.css'
import { Button, Table } from 'air-design'
import { SecurityLayout, defineSdkConfig } from 'air-sdk'
```

## 组件列表

### 核心 UI 组件

| 组件 | 导出名 | 说明 |
|------|--------|------|
| Button | `Button` | 基础按钮 |
| IconButton | `IconButton` | 图标按钮 |
| MenuButton | `MenuButton` | 菜单按钮 |
| ToggleButton | `ToggleButton` | 切换按钮 |
| Icon | `Icon` | 图标组件 |
| ColorPicker | `ColorPicker` | 颜色选择器 |
| Message | `Message` | 全局消息提示 |
| Notification | `success` / `warn` / `error` / `info` | 全局通知 |
| Dialog | `Dialog` | 对话框 |
| UploadDialog | `UploadDialog` | 上传对话框 |
| EditableLabel | `EditableLabel` | 可编辑文本标签 |
| GroupSplitter | `GroupSplitter` | 分组分隔面板 |
| Help | `Help` | 帮助提示组件 |
| SlidePanel | `SlidePanel` | 侧滑面板 |
| Splitter | `Splitter` / `Pane` | 可调整大小的分割面板 |
| TabPanel | `TabPanel` | 标签页面板 |
| Tree | `Tree` | 树形控件 |
| List | `List` | 列表控件 |
| Table | `Table` / `TableRowMenu` | 数据表格 |
| LoadingPanel | `LoadingPanel` | 加载状态面板 |
| Spin | `Spin` | 加载旋转指示器 |

### 业务组件

| 组件 | 导出名 | 说明 | 核心依赖 |
|------|--------|------|----------|
| CodeEditor | `CodeEditor` | 代码编辑器 | Monaco Editor |
| RichEditor | `RichEditor` | 富文本编辑器 | TipTap |
| Markdown | `Markdown` | Markdown 渲染 | react-markdown |
| Kanban | `Kanban` | 看板 | dnd-kit |
| MindPanel | `MindPanel` | 思维导图 | XYFlow |
| MenuBar | `MenuBar` | 菜单栏 | -- |
| PropertiesNaviBar | `PropertiesNaviBar` | 属性导航栏 | -- |
| WebClient | `WebClient` | Web 客户端 | -- |

## 对等依赖

在宿主项目中使用本组件库前，需确保已安装以下对等依赖：

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

以下第三方包作为 `external` 不打包进组件库产物，使用对应业务组件时需在宿主项目中安装：

| 业务组件 | 需要安装的依赖 |
|----------|----------------|
| CodeEditor | `@monaco-editor/react`（Monaco 从 CDN 自动加载，无需额外配置） |
| RichEditor | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm` 等 TipTap 扩展 |
| Markdown | `react-markdown`, `react-syntax-highlighter`, `remark-gfm`, `rehype-katex` |
| Kanban | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| MindPanel | `@xyflow/react` |

> 核心 UI 组件（Button、Table、Tree、Dialog 等）基于 Radix UI 原语，宿主无需额外安装 —— Radix 已随 `air-design` 的 `dependencies` 一起安装。

## TypeScript 支持

组件库构建时自动生成 `.d.ts` 类型声明文件，无需额外配置即可获得类型提示：

```tsx
import { CodeEditor, CodeEditorRef } from 'air-design'
import { RichEditor, RichEditorRef } from 'air-design'
import type { KanbanProps, ActionStatus } from 'air-design'
```

## 浏览器兼容性

支持所有主流现代浏览器：

- Chrome >= 90
- Firefox >= 90
- Safari >= 15
- Edge >= 90
