# AirDesign Monorepo

企业级前端基础设施 Monorepo，为接口测试平台、测试管理平台、数据治理平台等企业应用提供统一的 UI 组件与业务页面框架。

| 包名 | 路径 | 职责 |
|------|------|------|
| **air-design** | `packages/air-design` | 通用 React UI 组件库（Button、Table、RichEditor 等），底层 shadcn/ui + Radix UI + TailwindCSS |
| **air-sdk** | `packages/air-sdk` | 业务前端脚手架（登录页、安全布局、用户设置、跨应用切换、HttpRequest 等），仅服务于自有服务 |

架构设计详见 [docs/architecture.md](docs/architecture.md)，接入与组件用法详见 [docs/usage-manual.md](docs/usage-manual.md)。各包 API 细节见 `packages/air-design/README.md` 与 `packages/air-sdk/README.md`。

---

## 目录结构

```
AirDesign/
├── package.json                 # Workspace 根配置（private）
├── packages/
│   ├── air-design/              # 通用 UI 组件库
│   │   ├── src/
│   │   ├── dist/                # 构建产物（git 忽略）
│   │   └── package.json
│   └── air-sdk/                 # 业务前端 SDK
│       ├── src/
│       ├── dist/                # 构建产物（git 忽略）
│       └── package.json
└── docs/
    ├── architecture.md          # 详细设计架构说明
    └── usage-manual.md          # 使用手册
```

---

## 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | >= 18 |
| npm | >= 9 |

---

## 构建

### 1. 克隆并安装依赖

在 Monorepo **根目录**执行（不要在子包目录单独 install，除非调试特殊场景）：

```bash
cd /opt/AirDesign
npm install
```

npm workspaces 会将 `packages/air-design` 与 `packages/air-sdk` 的依赖统一安装到根目录 `node_modules/`，子包之间通过 workspace 协议自动链接。

### 2. 构建全部包

```bash
npm run build
```

等价于依次执行：

```bash
npm run build -w air-design   # 构建通用 UI 组件库
npm run build -w air-sdk      # 构建业务 SDK（依赖 air-design 已构建）
```

### 3. 单独构建

```bash
# 仅构建 air-design
npm run build:design

# 仅构建 air-sdk（需 air-design 已构建，或在 workspace 中已 link）
npm run build:sdk
```

### 4. 监听模式（开发 air-sdk）

```bash
npm run dev -w air-sdk
```

修改 `packages/air-sdk/src/` 后自动重新构建到 `packages/air-sdk/dist/`。

### 5. 构建产物说明

**air-design**（`packages/air-design/dist/`）：

```
dist/
├── index.mjs              # 主入口（ESM，保留模块结构）
├── style.css              # 合并样式（Tailwind + 组件 CSS，必须引入）
├── src/index.d.ts         # TypeScript 类型入口
├── components/、primitives/、lib/  # 按组件拆分的 .mjs / .d.ts
```

**air-sdk**（`packages/air-sdk/dist/`）：

```
dist/
├── index.mjs              # 主入口
├── air-sdk.css            # 业务组件样式（必须引入）
├── src/index.d.ts         # TypeScript 类型入口
├── config.mjs             # 配置模块
├── models/user.mjs        # DVA User Model
├── layouts/               # SecurityLayout
├── pages/Login/           # 登录页
├── components/            # AppSwitcher、UserSettings
└── utils/                 # HttpRequest 等
```

构建特性：

- Vite Library Mode，仅输出 ESM
- `preserveModules` 保留模块结构，支持 tree-shaking
- React、Radix UI、TipTap、Monaco、Umi 等标记为 `external`，不打包进产物
- `vite-plugin-dts` 自动生成 `.d.ts`

### 6. 修改源码后的更新流程

```bash
# 在 Monorepo 根目录
npm run build

# 若业务项目通过 file: 安装，需重新 install 以同步 dist/
cd /path/to/your-app
npm install air-design air-sdk
```

若使用 **npm link** 联调，重新 build 后业务项目刷新即可，无需 reinstall。

### 7. CI/CD 构建示例

```bash
#!/bin/bash
set -e
cd AirDesign
npm ci          # 或 npm install
npm run build
# 产物位于 packages/air-design/dist 与 packages/air-sdk/dist
```

业务项目 CI 中若通过 Git 引用本仓库，需在安装后手动构建（`dist/` 不在 Git 中）：

```bash
npm install
cd node_modules/air-design && npm install && npm run build && cd ../..
# 或通过 workspace 路径引用本地 clone 后 build
```

---

## 在业务项目中使用

### 安装方式

#### 方式一：本地路径（推荐，同机开发）

在业务项目 `package.json` 中：

```json
{
  "dependencies": {
    "air-design": "file:../AirDesign/packages/air-design",
    "air-sdk": "file:../AirDesign/packages/air-sdk"
  }
}
```

```bash
# 先在 Monorepo 构建
cd ../AirDesign && npm run build

# 再在业务项目安装
cd ../your-app && npm install
```

路径可为相对或绝对路径，例如 `"file:/opt/AirDesign/packages/air-design"`。

#### 方式二：npm link（高频联调）

```bash
# Monorepo 根目录
cd /opt/AirDesign
npm run build
npm link -w air-design
npm link -w air-sdk

# 业务项目
cd /path/to/your-app
npm link air-design air-sdk
```

取消链接：

```bash
cd /path/to/your-app
npm unlink air-design air-sdk

cd /opt/AirDesign
npm unlink -w air-design
npm unlink -w air-sdk
```

#### 方式三：Git 仓库引用

```json
{
  "dependencies": {
    "air-design": "git+ssh://git@your-host/AirDesign.git#master:packages/air-design",
    "air-sdk": "git+ssh://git@your-host/AirDesign.git#master:packages/air-sdk"
  }
}
```

Git 安装后需在对应包目录执行 `npm install && npm run build`（dist 未入库）。

---

### 仅使用 air-design（通用 UI）

适用于不需要统一登录/布局、只要 UI 组件的项目。

**1. 安装 peer 依赖**

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

> air-design 2.0 不再依赖 antd / Semi UI；底层为 Radix UI + TailwindCSS，随 `air-design` 的 `dependencies` 自动安装，宿主无需额外配置。

**2. 引入样式与组件**

```tsx
// 入口文件（如 app.tsx）— 样式必须引入
import 'air-design/style.css'

// 主入口按需导入
import { Button, Table, Spin, Icon, ColorPicker } from 'air-design'

// 类型
import type { CodeEditorRef, RichEditorRef } from 'air-design'
```

**3. 使用复合组件时的额外依赖**

| 组件 | 宿主项目需安装 |
|------|----------------|
| CodeEditor | `@monaco-editor/react` |
| RichEditor | `@tiptap/react`、`@tiptap/starter-kit` 等 TipTap 扩展 |
| Markdown | `react-markdown`、`react-syntax-highlighter`、`remark-gfm` 等 |
| Kanban | `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities` |
| MindPanel | `@xyflow/react` |

---

### 使用 air-design + air-sdk（企业应用标准方案）

适用于接口测试平台、测试管理平台、数据治理平台等需要**统一登录页、主布局、用户管理**的应用。基于 **UmiJS 4 + DVA**。

**1. 安装依赖**

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "umi": "^4",
    "air-design": "file:../AirDesign/packages/air-design",
    "air-sdk": "file:../AirDesign/packages/air-sdk"
  }
}
```

**2. 应用入口配置 SDK**

```tsx
// src/app.tsx
import { defineSdkConfig } from 'air-sdk';

defineSdkConfig({
  storagePrefix: 'air-test-platform',   // sessionStorage 前缀，多应用隔离
  appName: '接口测试平台',
  appTagline: 'API Testing Platform',
  theme: 'teal',                        // 登录页主题：blue | teal | amber
});
```

**3. 注册 DVA Model**

```tsx
// src/app.tsx 或 models 目录
export { UserModel } from 'air-sdk';

// UmiJS 约定：将 UserModel 放入 src/models/user.ts
// 内容可直接 re-export：
// export { UserModel as default } from 'air-sdk';
```

或新建 `src/models/user.ts`：

```typescript
export { UserModel as default } from 'air-sdk';
```

**4. 布局中使用 SecurityLayout**

```tsx
// src/layouts/index.tsx
import React from 'react';
import { SecurityLayout } from 'air-sdk';
import 'air-design/style.css';
import 'air-sdk/style.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SecurityLayout>{children}</SecurityLayout>;
}
```

未登录时自动渲染 SDK 提供的 `Login` 页；已登录时渲染 `children`。

**5. 主布局中集成业务组件**

```tsx
import { AppSwitcher, UserSettings } from 'air-sdk';
import { Icon, Button } from 'air-design';

// AppSwitcher：顶部跨应用免登切换
// UserSettings：用户设置侧滑面板（基本信息、显示设置、修改密码）
```

**6. 使用 HttpRequest**

```typescript
import { POST, GET, SSE_POST } from 'air-sdk';

// POST 自动携带 Authorization、X-User-Id 等头
const resp = await POST('/api/v1/your-endpoint', { key: 'value' });

// SSE 流式请求
await SSE_POST('/api/v1/stream', { prompt: '...' }, (chunk) => {
  console.log(chunk);
});
```

**7. 按需子路径导入（可选）**

```typescript
import { defineSdkConfig } from 'air-sdk/config';
import UserModel from 'air-sdk/models/user';
import SecurityLayout from 'air-sdk/layouts/SecurityLayout';
import Login from 'air-sdk/pages/Login';
import { POST } from 'air-sdk/utils/HttpRequest';
```

---

### UmiJS 完整接入 checklist

- [ ] `package.json` 添加 `air-design`、`air-sdk` 依赖
- [ ] Monorepo 执行 `npm run build`
- [ ] 业务项目 `npm install`
- [ ] `app.tsx` 调用 `defineSdkConfig`
- [ ] `src/models/user.ts` 注册 `UserModel`
- [ ] 根布局引入 `SecurityLayout` 及两份 CSS
- [ ] 配置开发代理，使 `/api/v1/auth/*` 等接口可达后端
- [ ] 登录页 Logo 放置于宿主项目 `public/icons/logo/default.svg`

---

## air-sdk 导出清单

| 分类 | 导出 | 说明 |
|------|------|------|
| 配置 | `defineSdkConfig`, `getSdkConfig`, `storageKey` | 应用级配置 |
| Model | `UserModel` | 登录、登出、Token 校验、用户设置 |
| 布局 | `SecurityLayout` | 认证守卫布局 |
| 页面 | `Login` | 登录页（星野动画背景） |
| 组件 | `AppSwitcher`, `UserSettings` | 应用切换、用户设置 |
| 工具 | `POST`, `GET`, `SSE_POST`, `SHA`, `getAvatarUrl` 等 | HTTP 与工具函数 |
| 类型 | `SdkConfig`, `UserResponse`, `DisplaySettings` 等 | TypeScript 类型 |

---

## 从 air-auth 迁移

原 `/opt/AirFramework/frontend-sdk`（包名 `air-auth`）已合并为 `air-sdk`：

| 旧 API | 新 API |
|--------|--------|
| `air-auth` | `air-sdk` |
| `defineAuthConfig` | `defineSdkConfig`（旧名仍可用，已 @deprecated） |
| `getAuthConfig` | `getSdkConfig` |
| `AuthConfig` | `SdkConfig` |
| `air-auth/dist/air-auth.css` | `air-sdk/style.css` |

---

## 常见问题

### React 双实例（hooks 报错）

npm link 联调时，确保业务项目 webpack/vite 将 react 指向自身 node_modules：

```js
// vite.config.ts
resolve: {
  alias: {
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
  },
}
```

### 样式未生效

必须同时引入：

```tsx
import 'air-design/style.css'
import 'air-sdk/style.css'   // 使用 SDK 时
```

### 构建后业务项目未更新

`file:` 协议会复制 `dist/` 到 `node_modules`，修改后需重新 `npm run build` 并 `npm install`。

### air-sdk 构建失败

先构建 air-design：`npm run build:design`，再 `npm run build:sdk`。

---

## 相关文档

- [详细设计架构说明](docs/architecture.md)
- [使用手册](docs/usage-manual.md)
- [air-design 组件列表与 API](packages/air-design/README.md)
- [air-sdk 业务模块说明](packages/air-sdk/README.md)
