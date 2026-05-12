# AirDesign 架构与设计说明

## 一、定位与目标

- **定位**：基于 `@umijs/max` 的前端应用 + 可复用 React 组件库。
- **双模式**：通过 `npm run dev` 启动场景模拟展示应用；通过 `npm run build:lib` 构建 npm 包供外部项目引用。
- **目标**：与主前端解耦，便于多应用共享、单独构建与版本管理。

## 二、技术选型

- **框架**：`@umijs/max`，提供路由、antd 集成、构建优化。
- **语言**：TypeScript。
- **样式**：Less，与现有前端一致，变量与风格可延续。
- **应用构建**：Umi 内置（产出 `dist/`）。
- **包构建**：Rollup，产出 ESM + CJS 及独立 CSS（产出 `lib/`）。
- **React**：以 peerDependencies 形式声明，由使用方提供版本。
- **外部 UI**：antd 以 dependencies 声明，应用直接使用，npm 包以 peerDependencies 声明。
- **字体**：Space Grotesk（界面）、JetBrains Mono（代码）通过 @fontsource 嵌入，复制到 `public/fonts/`，base.less 使用 `@font-face` 引用。
- **全局样式**：`src/components/AirDesign/base.less` 提供 :root 设计令牌，通过 `src/global.less` 导入。

## 三、目录结构

```
/opt/AirDesign/
├── .umirc.ts                    # Umi 路由与构建配置
├── .env                         # PORT=8000
├── package.json                 # @umijs/max + rollup 双模式
├── tsconfig.json
├── rollup.config.mjs            # npm 包构建配置
├── public/
│   └── fonts/                   # 字体 woff2 文件
├── scripts/
│   ├── generate-icons.js        # SVG → icons-data.ts
│   └── copy-fonts.js            # 字体复制到 public/fonts + lib/fonts
├── src/
│   ├── global.less              # 全局样式入口
│   ├── layouts/index.tsx        # 应用布局（侧边导航 + 内容区）
│   ├── pages/                   # 场景模拟页面
│   │   ├── index.tsx            # 首页
│   │   ├── table-demo.tsx       # 表格场景
│   │   ├── tree-demo.tsx        # 树形场景
│   │   ├── form-demo.tsx        # 表单场景
│   │   ├── layout-demo.tsx      # 布局场景
│   │   └── 404.tsx              # 404 页
│   └── components/
│       └── AirDesign/           # 组件库
│           ├── index.ts         # 统一导出
│           ├── base.less        # 设计令牌与字体
│           ├── types.d.ts
│           ├── Button/
│           ├── Icon/
│           ├── Table/
│           ├── Tree/
│           └── ... (所有组件)
├── dist/                        # Umi 应用构建产物
└── lib/                         # npm 包构建产物
```

## 四、Icon 与 SVG 策略

- **构建时**：`scripts/generate-icons.js` 扫描 `src/components/AirDesign/Icon/svg/` 与 `src/components/AirDesign/Splitter/*.svg`，生成 `icons-data.ts`。
- **运行时**：Icon 组件从 `iconData` 中按 name 读取 SVG 字符串渲染。

## 五、组件设计原则

1. **无业务耦合**：不依赖具体业务接口、路由或状态库。
2. **内部引用**：组件间使用相对路径。
3. **样式独立**：组件 Less 通过 Rollup 编译为 `lib/index.css`。
4. **类型导出**：构建产出 `.d.ts`。

## 六、与主前端的集成方式

- 主前端通过 `"air-design": "file:../AirDesign"` 引用。
- `import { X } from 'air-design'`，样式通过 `import 'air-design/lib/index.css'` 引入。

## 七、全量组件列表

| 组件 | 说明 |
|------|------|
| Button | 毛玻璃风格按钮 |
| IconButton | 图标按钮，支持 Dropdown、Tooltip |
| MenuButton | 菜单按钮（antd Dropdown） |
| ToggleButton | 切换按钮 |
| Icon | 按 name 渲染 SVG 图标 |
| ColorPicker | 颜色选择器 |
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

---

Created by ChaiMingxu
