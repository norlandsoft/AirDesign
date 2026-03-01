# AirDesign

AirDesign 是 AirMachine 体系下的前端 React 组件库，提供一套常用 UI 组件，采用毛玻璃（glassmorphism）风格，与主项目前端解耦，可被多个应用复用。

## 技术栈

- React 18 + TypeScript
- Less 样式
- Rollup 构建（ESM + CJS，Less 输出为独立 CSS）
- 依赖 antd、@douyinfe/semi-ui（peerDependencies）
- 内置字体：Space Grotesk（界面）、JetBrains Mono（代码），字体文件内置于 dist/fonts，无需 HTTP 请求
- 全局设计令牌：base.less 提供 :root 变量（--primary-color、--font-family、--border-radius、--text-* 等），html/body 基础样式

## 目录结构

```
AirDesign/
├── src/
│   ├── index.ts          # 库入口，统一导出组件
│   ├── Button/          # 按钮系（Button、IconButton、MenuButton、ToggleButton）
│   ├── Icon/            # 图标（含 icons-data 构建生成）
│   ├── ColorPicker/     # 颜色选择器
│   ├── Message/         # 消息
│   ├── Notification/    # 通知（success/warn/error/info）
│   ├── Dialog/          # 对话框
│   ├── SlidePanel/      # 滑出面板
│   ├── Splitter/        # 分割面板
│   ├── Table/           # 表格
│   ├── Tree/             # 树
│   └── ...              # 其他组件
├── scripts/
│   └── generate-icons.js # 构建时生成 icons-data.ts
├── dist/                 # 构建产物（build 后生成）
├── package.json
├── tsconfig.json
├── rollup.config.mjs
└── ARCHITECTURE.md       # 架构与设计说明
```

## 使用方式

### 在 AirMachine 前端中引用

1. 在 `frontend/package.json` 的 `dependencies` 中增加：

   ```json
   "air-design": "file:../AirDesign"
   ```

2. 在 `frontend` 根目录执行 `npm install`。

3. 前端通过 `aird` 别名引用（已配置 re-export）：

   ```ts
   import { Button, Icon, Dialog } from 'aird';
   ```

4. 或直接引用 air-design 包：

   ```ts
   import { Button } from 'air-design';
   import 'air-design/dist/index.css';
   ```

### 构建

```bash
cd AirDesign
npm install
npm run build
```

产物在 `dist/`：`index.js`、`index.mjs`、`index.d.ts`、`index.css`。

## 已包含组件

- **Button 系**：Button、IconButton、MenuButton、ToggleButton
- **基础**：Icon、ColorPicker、Message、Notification（success/warn/error/info）、EditableLabel、Help、LoadingPanel
- **布局/容器**：Dialog、UploadDialog、SlidePanel、Splitter（含 Pane）、GroupSplitter、TabPanel
- **数据展示**：Table、TableRowMenu、Tree、List
- **编辑**：CodeEditor（因 Monaco 依赖，保留在前端 `frontend/src/components/AirDesign/CodeEditor`）

## Peer 依赖

使用方需提供：`react`、`react-dom`、`antd`、`@douyinfe/semi-ui`。

## 规范与作者

- 组件注释与设计说明见各文件头部；作者信息：ChaiMingxu。
- 新增组件时在 `src/index.ts` 中导出，并在本 README 的「已包含组件」中补充说明。
