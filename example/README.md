# AirDesign 组件库 Demo

基于 Vite + React 的组件效果展示项目，引用 workspace 中的 `air-design` 与 `air-kit`。

## 运行

```bash
# 1. 安装依赖（Monorepo 根目录）
cd /opt/AirDesign
npm install          # 或 pnpm install

# 2. 构建组件库（Demo 依赖 dist/ 产物）
npm run build        # 构建 air-design + air-kit

# 3. 启动 Demo
npm run dev:example
# 或：cd example && npm run dev
```

浏览器打开 http://localhost:5174。

## 改动组件后的刷新

修改 `packages/air-design/src/` 或 `packages/air-kit/src/` 后需重新构建，Demo 刷新即可：

```bash
npm run build        # 重新构建 air-design + air-kit
# Demo 页面刷新
```

## 内容

左侧导航分类展示：

| 页面 | 组件 |
|------|------|
| Button | Button / IconButton / MenuButton / ToggleButton |
| Icon | 自有 SVG 图标库 |
| Dialog | Dialog 命令式对话框 |
| SlidePanel | 侧滑抽屉 |
| Message/Notice | 命令式轻提示 / 通知 |
| Table | TanStack 表格 + 行菜单 + 分页 |
| Tree | react-arborist 树（搜索/菜单/展开） |
| TabPanel | 可关闭标签页 |
| ColorPicker | react-colorful 取色器 |
| Avatar | Avatar 头像 / Avatar.Group |
| Grid | Row / Col 栅格 / useBreakpoint |
| 表单组件 | Form 布局 / 字段 / 校验 / Form.List / FormInstance API |
| Splitter | 可拖拽分割面板 |
| Spin/Loading | 加载动画 / 骨架屏 / 全屏加载 |
| NavMenu | 左侧模块导航 |
| PropertiesNaviBar | 属性页左侧导航栏 |

## 暗色模式

在 `index.html` 的 `<html>` 加 `class="dark"` 可预览暗色主题。
