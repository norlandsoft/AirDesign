# AirDesign 详细设计架构说明

> 作者：ChaiMingXu | 版本：2.0 | 更新：2026/06/19
>
> 本文档描述 AirDesign 2.0 的整体架构、技术选型、分层设计、构建体系与约束规则。
> 面向维护者与架构评审。组件 API 与接入步骤详见 [使用手册](./usage-manual.md)。

---

## 一、定位

AirDesign 是**全平台统一的 UI 组件库 + 业务前端脚手架**，为 JettoAuthor、AirMachine、测试管理平台等**自有企业应用**提供一致的前端体验。

两段式结构：

| 包 | 路径 | 职责 |
|----|------|------|
| **air-design** | `packages/air-design` | 通用 React UI 组件库（shadcn/ui + Radix UI + TailwindCSS） |
| **air-kit** | `packages/air-kit` | 业务前端整合脚手架（登录、布局、用户设置、应用切换、请求封装），仅服务于自有服务 |

**核心价值**：一处建设、全平台一致；业务应用引入 SDK 即可获得完整登录/布局/用户体系，无需重复搭建。

---

## 二、技术栈

| 项 | 选型 | 约束 |
|----|------|------|
| 底层组件 | **shadcn/ui**（Radix UI 无障碍原语） | 禁止 Ant Design / Semi UI / ElementUI |
| 样式 | **TailwindCSS v4** | 原子化 CSS；禁止 Less / CSS-in-JS 混用 |
| 语言 | **TypeScript**（`strict: true`） | — |
| 构建 | **Vite**（library 模式） | 单一构建工具 |
| 包管理 | **npm workspace** | `packages/*` |
| Tree 组件 | **react-arborist** | shadcn 无原生 Tree |
| 富文本 | **Tiptap** | 保留内核，工具栏 UI 重写 |
| 代码编辑 | **Monaco Editor** | 保留，不变 |
| 思维导图 | **@xyflow/react** | 保留引擎与布局算法 |
| 看板拖拽 | **dnd-kit** | 保留 |
| 表格 | **@tanstack/react-table** | 替代 Semi Table |
| 轻提示 | **sonner** + 自建命令式 Message/Notice | — |
| 图标 | **沿用自有 Icon 组件** | 229 SVG，主题适配，不引入 lucide-react |

---

## 三、分层架构

```
业务应用（UmiJS 4 + DVA）
    └── air-kit              业务脚手架（页面/布局/Model/请求）
            └── air-design   通用 UI 层
                    ├── primitives   Radix 薄封装
                    ├── components   业务级组件（组合 primitives）
                    └── theme        设计 Token 单一来源
```

### 分层规则

- **primitives**：直接基于 Radix UI，提供一致的开箱即用样式与无障碍能力（焦点管理、键盘导航、ARIA）。消费方一般不直接使用。
- **components**：业务级组件，组合 primitives 实现。`Message` / `Notice` / `Dialog` 等命令式组件在此层。
- **theme**：设计 Token 单一来源（颜色 / 间距 / 圆角 / 字号 / 字体），全平台共享。暗色模式经 Token 切换，组件无需特殊处理。
- **lib/cn.ts**：`clsx` + `tailwind-merge`，合并外部 className 并解决 Tailwind class 冲突。

> 单一底层栈：AirDesign 内部**只允许一套底层**（Radix + Tailwind）。若 shadcn 组件能力不足，优先基于 Radix 原语自建，而非引入第二个 UI 库。

---

## 四、设计 Token 体系

Token 定义在 `packages/air-design/src/theme/index.css`，经 Tailwind v4 `@theme inline` 暴露为工具类。

### 语义颜色槽（亮 / 暗双套，OKLCH 色空间）

| Token | 用途 |
|-------|------|
| `--color-background` / `--color-foreground` | 页面背景 / 主文字 |
| `--color-card` / `--color-card-foreground` | 卡片表面 |
| `--color-popover` / `--color-popover-foreground` | 弹层（Popover/Tooltip/菜单） |
| `--color-primary` / `--color-primary-foreground` | 主色（品牌色 #123F68） / 主色上的文字 |
| `--color-secondary` / `--color-secondary-foreground` | 次级背景 |
| `--color-muted` / `--color-muted-foreground` | 静默背景 / 次要文字 |
| `--color-accent` / `--color-accent-foreground` | hover/选中态 |
| `--color-destructive` / `--color-destructive-foreground` | 危险/删除 |
| `--color-border` / `--color-input` / `--color-ring` | 边框 / 输入框边 / 聚焦环 |

### 字体

- `--font-sans`：Space Grotesk（界面）
- `--font-mono`：JetBrains Mono（代码）
- 字体文件内置于 `theme/fonts/`（woff2），无需 HTTP 请求

### 暗色模式

在根元素添加 `.dark` 类即可切换。所有语义变量在 `.dark` 选择器下重新赋值，组件自动适配，无需为暗色写额外样式。

---

## 五、目录结构

```
AirDesign/
├── package.json                 # npm workspace 根配置
├── docs/
│   ├── architecture.md          # 本文档（架构说明）
│   └── usage-manual.md          # 使用手册
├── packages/
│   ├── air-design/              # 通用 UI 组件库
│   │   ├── src/
│   │   │   ├── index.ts         # 主入口（引入 theme、统一导出）
│   │   │   ├── theme/           # 设计 Token + Tailwind 入口 + 字体
│   │   │   ├── primitives/      # Radix 薄封装（17 个原子件）
│   │   │   ├── components/      # 业务组件（27 个目录，含 Icon）
││   │   │   │   ├── Button/ Icon/ ColorPicker/ Message/ Notice/
│   │   │   │   ├── Dialog/ EditableLabel/ GroupSplitter/ Help/
│   │   │   │   ├── SlidePanel/ Splitter/ TabPanel/ Tree/ List/
│   │   │   │   ├── Table/ LoadingPanel/ Spin/
│   │   │   │   ├── CodeEditor/ RichEditor/ Markdown/
│   │   │   │   ├── Kanban/ MindPanel/ MenuBar/
│   │   │   │   ├── PropertiesNaviBar/ WebClient/
│   │   │   ├── lib/cn.ts        # className 合并工具
│   │   │   └── typings.d.ts     # CSS / SVG / woff2 模块声明
│   │   ├── tsconfig.json        # strict + @ 别名
│   │   ├── vite.config.ts       # library mode + Tailwind 插件
│   │   └── package.json
│   └── air-kit/                 # 业务前端脚手架
│       ├── src/
│       │   ├── index.ts         # 主入口
│       │   ├── config.ts        # defineSdkConfig / getSdkConfig / storageKey
│       │   ├── models/user.ts   # Zustand useUserStore（登录/登出/Token校验/设置）
│       │   ├── layouts/SecurityLayout.tsx
│       │   ├── pages/           # 业务页面（登录页由各服务自行实现，air-kit 不内置）
│       │   ├── components/      # AppSwitcher / UserSettings（3 子页）
│       │   ├── utils/           # HttpRequest / CryptoUtils / IconUtils / ...
│       │   ├── types/           # 类型定义
│       │   └── typings.d.ts
│       ├── vite.config.ts
│       └── package.json
└── example/                     # 组件效果展示 Demo（见使用手册）
```

---

## 六、组件分层与映射

### primitives（Radix 薄封装）

`button` `dialog` `alert-dialog` `sheet` `tooltip` `popover` `dropdown-menu` `tabs` `input` `textarea` `switch` `checkbox` `select` `separator` `scroll-area` `skeleton` `slider` `avatar` `sonner`

### components 业务组件

| 组件 | 底层 | 说明 |
|------|------|------|
| Button / IconButton / MenuButton / ToggleButton | primitives/button (cva) | 五种类型语义 |
| Dialog / UploadDialog / AlertDialog | primitives/dialog | 可拖拽、命令式 `Dialog()` |
| SlidePanel | primitives/sheet | 侧滑抽屉、双层、size 类型 |
| TabPanel | primitives/tabs | 可关闭标签 + tooltip 截断 |
| Table / TableRowMenu | @tanstack/react-table | 排序/分页/行菜单 |
| Tree | react-arborist | 搜索/图标/菜单/拖拽/受控展开选中/checkable/disabled |
| Message / Notice | 自建 createRoot | 命令式轻提示/通知 |
| ColorPicker | react-colorful + primitives/popover | 取色 + 预设 |
| Splitter / GroupSplitter | 自建（保留逻辑） | 拖拽分割 |
| Spin / LoadingPanel | 自建 | 三圆点动画 |
| EditableLabel / Help | primitives/input / tooltip | — |
| List / MenuBar / PropertiesNaviBar | 自建 | Tailwind 化 |
| CodeEditor | @monaco-editor/react | Monaco 内核不变 |
| RichEditor | @tiptap/* | Tiptap 内核不变，工具栏去 antd |
| Markdown | react-markdown + mermaid | 渲染层 CSS Token 化 |
| Kanban | @dnd-kit/* | dnd-kit 逻辑不变 |
| MindPanel | @xyflow/react | 引擎与布局算法不变 |
| Icon | 自有 SVG sprite | 229 图标，主题适配 |
| WebClient | 原生 WebSocket | 心跳/重连 |

---

## 七、构建体系

### 工具链

- **Vite** library mode，仅输出 ESM
- **@tailwindcss/vite** 编译 Tailwind，合并为 `style.css`
- **vite-plugin-dts** 生成 `.d.ts`
- **preserveModules** 保留模块结构，支持消费方 tree-shaking
- 第三方包标记 `external`（React / Radix / Tiptap / Monaco / TanStack / dnd-kit / XYFlow / Markdown 栈 / sonner / tippy.js 等），不打包进产物

### 命令（在 Monorepo 根目录）

| 命令 | 说明 |
|------|------|
| `npm run build` | 构建 air-design → air-kit |
| `npm run build:design` | 仅 air-design |
| `npm run build:sdk` | 仅 air-kit |
| `npm run dev -w air-design` | air-design 监听模式 |
| `npm run dev -w air-kit` | air-kit 监听模式 |

### 产物

```
packages/air-design/dist/
├── index.mjs              # 主入口
├── style.css              # Tailwind + 组件 CSS（消费方必须引入）
├── src/index.d.ts         # 类型入口
├── components/...         # 按组件拆分
├── primitives/...
└── lib/cn.mjs
```

---

## 八、air-kit 业务脚手架设计

air-kit 已**去 Umi/DVA 化**，状态管理基于 **Zustand**（`useUserStore`），不依赖任何宿主框架 —— 纯 React 应用与 Umi 应用均可即插即用。

### 核心模块

- **config**：`defineSdkConfig` 在应用入口注入 `storagePrefix` / `appName` / `appTagline` / `theme`
- **useUserStore**（Zustand）：`login` / `logout` / `validateToken` / `changePassword` / `updateUserInfo` / `fetchUserSettings` / `updateUserSettings`；密码 SHA256；通过 `auth-state-changed` CustomEvent 与非 React 代码（HttpRequest 等）通信
- **SecurityLayout**：未登录渲染消费方提供的登录页（`login` prop）；URL 含 `transferToken` 自动兑换 SSO；校验中全屏 Spin
- **Login**：Canvas 星野动画 + 原生受控表单
- **UserSettings**：基本信息 / 显示设置 / 修改密码 三子页，原生表单
- **AppSwitcher**：跨应用免登切换，基于 DropdownMenu 原语；`layoutSize` 经 props 传入（默认值，无需宿主全局 store）
- **HttpRequest**：fetch 封装，自动注入 Authorization / X-User-Id 头，401 清理 session；含 SSE_POST 流式请求

### 后端契约

| 模块 | 端点 |
|------|------|
| 登录 | `POST /admin/user/login`（admin）/ `POST /api/v1/auth/login` |
| Token 校验 | `POST /api/v1/auth/current` |
| 用户更新 | `POST /api/v1/user/update` |
| 用户设置 | `POST /api/v1/user/settings/get` · `/update` |
| 修改密码 | `POST /api/v1/user/password` |
| SSO 中转 | `POST /api/v1/transfer/apply` · `/accept` |
| 服务列表 | `POST /api/v1/service/list` |

---

## 九、最终约束

| 原则 | 约束 |
|------|------|
| Single UI Library | air-design（全平台唯一组件源） |
| Single Component Base | shadcn/ui + Radix UI |
| Single Styling | TailwindCSS + 设计 Token |
| Single Icon | 沿用现有 AirDesign Icon 组件 |
| Full Refactor | 完全重构，无需向后兼容，旧实现一律删除 |
| Token First | 视觉属性一律经 Token，禁止硬编码 |
| Business SDK | air-kit 提供自有服务开箱即用的业务脚手架 |

违反任一原则即视为架构退化。

---

## 十、扩展指引

- **新增通用组件**：放 `components/`，基于 primitives 组合，样式用 Tailwind + Token；在 `index.ts` 导出。
- **新增 Radix 原语**：放 `primitives/`，参考 shadcn 实现，经 `cn` 合并 className；在 `primitives/index.ts` 导出。
- **新增业务页面**：放 `air-kit/src/pages/`，DVA Model 放 `models/`，在 `air-kit/src/index.ts` 导出。
- **新增设计 Token**：在 `theme/index.css` 的 `:root` / `.dark` 增加变量，必要时在 `@theme inline` 映射为工具类。
- **新增图标**：SVG 放 `components/Icon/svg/`，构建时经 `import.meta.glob` 自动注册，按文件名（去 `.svg`）引用。
