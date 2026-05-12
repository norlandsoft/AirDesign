# AirDesign

AirDesign 是基于 `@umijs/max` 的前端应用 + React 组件库，提供毛玻璃（glassmorphism）风格 UI 组件，支持场景模拟展示与 npm 包发布双模式。

## 技术栈

- `@umijs/max` 框架 + React 19 + TypeScript
- antd 6 UI 库
- Less 样式
- Rollup 构建 npm 包（ESM + CJS，Less 输出为独立 CSS）
- 内置字体：Space Grotesk（界面）、JetBrains Mono（代码）

## 快速开始

```bash
npm install
npm run dev          # 启动 Umi 开发服务器 → http://localhost:8000
npm run build        # 构建 Umi 应用（产物 → dist/）
npm run build:lib    # 构建 npm 包（产物 → lib/）
```

## 场景页面

| 路由 | 说明 |
|------|------|
| `/` | 首页 — 组件分类概览 |
| `/table` | 表格场景 — Table + TableRowMenu + Pagination |
| `/tree` | 树形场景 — Tree + 搜索 + 右键菜单 + 拖拽 |
| `/form` | 表单场景 — Button + EditableLabel + ColorPicker + Dialog + Notification |
| `/layout` | 布局场景 — Splitter + SlidePanel + TabPanel + GroupSplitter |

## 作为 npm 包使用

```ts
import { Button, Icon, Dialog } from 'air-design';
import 'air-design/lib/index.css';
```

`package.json` 引用：

```json
"air-design": "file:../AirDesign"
```

## 已包含组件

- **Button 系**：Button、IconButton、MenuButton、ToggleButton
- **基础**：Icon、ColorPicker、Message、Notification、EditableLabel、Help、LoadingPanel
- **布局/容器**：Dialog、UploadDialog、SlidePanel、Splitter（含 Pane）、GroupSplitter、TabPanel
- **数据展示**：Table、TableRowMenu、Tree、List

## Peer 依赖

使用方需提供：`react`、`react-dom`。

## 作者

ChaiMingxu
