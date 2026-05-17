# AirDesign

企业级 React 组件库，为 AirMachine 智能中台提供统一的 UI 基础组件和业务组件。

## 技术栈

- **语言**: TypeScript 5.x
- **框架**: React 18+
- **构建工具**: Vite 6（Library Mode）
- **UI 基础**: Ant Design 5 + Semi Design
- **样式方案**: Less + CSS Modules

## 项目结构

```
src/
├── index.ts                        # 组件库主入口
├── typings.d.ts                    # 全局类型声明
├── style/
│   ├── base.less                   # 全局样式、字体、CSS 变量
│   └── fonts/                      # 字体文件（Space Grotesk / JetBrains Mono）
├── Button/                         # 按钮（Button / IconButton / MenuButton / ToggleButton）
├── Icon/                           # 图标
├── ColorPicker/                    # 颜色选择器
├── Message/                        # 消息提示
├── Notification/                   # 通知提示
├── Dialog/                         # 对话框（Dialog / UploadDialog）
├── EditableLabel/                  # 可编辑标签
├── GroupSplitter/                  # 分组分隔器
├── Help/                           # 帮助组件
├── SlidePanel/                     # 滑动面板
├── Splitter/                       # 分割面板（Splitter / Pane）
├── TabPanel/                       # 标签页面板
├── Tree/                           # 树组件
├── List/                           # 列表组件
├── Table/                          # 表格（Table / TableRowMenu）
├── LoadingPanel/                   # 加载面板
├── Spin/                           # 加载旋转
├── CodeEditor/                     # 代码编辑器（Monaco Editor）
├── RichEditor/                     # 富文本编辑器（TipTap）
├── Markdown/                       # Markdown 渲染
├── Kanban/                         # 看板（dnd-kit）
├── MindPanel/                      # 思维导图（XYFlow）
├── MenuBar/                        # 菜单栏
├── PropertiesNaviBar/              # 属性导航栏
└── WebClient/                      # Web 客户端
```

## 构建

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 构建组件库

```bash
npm run build
```

构建产物输出到 `dist/` 目录：

```
dist/
├── index.mjs          # ESM 入口（保留模块结构，支持 tree-shaking）
├── index.d.ts         # TypeScript 类型声明入口
├── style.css          # 合并后的样式文件
├── components/        # 按组件拆分的 .mjs 和 .d.ts 文件
│   ├── AirDesign/
│   │   ├── Button/
│   │   │   ├── index.mjs
│   │   │   └── index.d.ts
│   │   ├── Table/
│   │   └── ...
│   ├── CodeEditor/
│   ├── RichEditor/
│   └── ...
└── fonts/             # 字体资源（WOFF2）
```

构建配置说明：

- 使用 Vite library mode，仅输出 ESM 格式
- 通过 `vite-plugin-dts` 自动生成 `.d.ts` 类型声明文件
- 第三方依赖（React、Ant Design、TipTap、Monaco 等）标记为 `external`，不打包进产物
- 开启 `preserveModules` 保留模块结构，消费者项目可按需加载
- 所有 `.less` 文件自动作为 CSS Modules 处理，编译为 `style.css`

## 在项目中引用

以下所有方式在代码中的使用方法一致：

```tsx
// 引入样式（必须）
import 'air-design/style.css'

// 按需引入组件
import { Button, Table, CodeEditor } from 'air-design'

// 引入类型
import type { CodeEditorRef, RichEditorRef } from 'air-design'
```

由于构建产物保留了模块结构并开启了 `sideEffects` 标记，打包工具（Webpack / Vite）会自动进行 tree-shaking，未使用的组件不会被打包。

---

### 方式一：本地路径引用（file: 协议）

适用于组件库和业务项目在同一台机器上、目录相邻的场景。`npm install` 时会将 `dist/` 目录复制到业务项目的 `node_modules/air-design/` 中。

```bash
# 在业务项目中执行，路径指向 AirDesign 的本地目录
npm install file:../AirDesign
```

或在 `package.json` 中直接配置：

```json
{
  "dependencies": {
    "air-design": "file:../AirDesign"
  }
}
```

**注意事项：**

- 安装前需先在 AirDesign 目录执行 `npm run build` 生成 `dist/` 产物
- 修改组件库代码后，需重新构建并重新安装：

```bash
# 组件库目录
cd AirDesign
npm run build

# 业务项目目录（重新安装以同步最新产物）
cd ../your-project
npm install air-design
```

- `npm install` 时会复制 `package.json` 中 `files` 字段指定的内容（即 `dist/` 目录），不会复制源码和 node_modules
- 路径可以是相对路径也可以是绝对路径：`file:/opt/AirDesign`

---

### 方式二：npm link 开发调试

适用于组件库开发阶段，需要频繁修改并实时在业务项目中验证的场景。`npm link` 创建的是符号链接，不复制文件，因此重新构建后业务项目立即生效，无需重新安装。

**步骤一：构建并在组件库目录创建全局链接**

```bash
cd /opt/AirDesign
npm install
npm run build
npm link
```

`npm link` 会根据 `package.json` 中的 `name` 字段（`air-design`）注册一个全局符号链接。

**步骤二：在业务项目中链接**

```bash
cd /path/to/your-project
npm link air-design
```

**步骤三：开发联调**

修改组件库代码后，只需重新构建，业务项目立即生效：

```bash
# 在 AirDesign 目录
npm run build
# 业务项目无需任何操作，刷新页面即可看到变更
```

**取消链接：**

```bash
# 在业务项目中取消链接，恢复为 node_modules 中的版本
cd /path/to/your-project
npm unlink air-design

# 在组件库目录取消全局注册
cd /opt/AirDesign
npm unlink
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

不在组件库中配置 postinstall，而是在业务项目的构建脚本中显式处理：

```bash
# 1. 安装依赖（会 clone Git 仓库到 node_modules/air-design）
npm install

# 2. 进入组件库目录安装依赖并构建
cd node_modules/air-design
npm install
npm run build
cd ../..

# 3. 构建业务项目
npm run build
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

> 核心 UI 组件（Button、Table、Tree 等）仅依赖 `antd` 和 `@ant-design/icons`，无额外安装要求。

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
