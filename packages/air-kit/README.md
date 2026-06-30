# air-kit

企业应用前端业务组件框架，基于 `air-design` 通用 UI 层，提供登录、认证布局、用户管理等开箱即用的业务模块。

适用场景：接口测试平台、测试管理平台、数据治理平台等需要统一登录体验与主布局的企业前端。

## 依赖关系

```
业务应用 (UmiJS 4)
    └── air-kit          ← 本包
            └── air-design   ← 通用 UI（shadcn/Radix + TailwindCSS，peerDependency）
                    └── react
```

**Peer Dependencies**（宿主项目必须安装）：

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "air-design": ">=2.0.0"
}
```

> 状态管理基于 **Zustand**（随 air-kit 自动安装），不依赖 Umi/DVA。

## 构建

在 Monorepo 根目录：

```bash
npm run build:sdk
# 或
npm run build -w air-kit
```

监听模式：

```bash
npm run dev -w air-kit
```

产物目录 `dist/`：

| 文件 | 说明 |
|------|------|
| `index.mjs` | 主入口 |
| `air-kit.css` | 业务样式，通过 `air-kit/style.css` 引入 |
| `src/index.d.ts` | 类型声明 |

## 安装

```json
{
  "dependencies": {
    "air-design": "file:../AirDesign/packages/air-design",
    "air-kit": "file:../AirDesign/packages/air-kit"
  }
}
```

安装前先构建 Monorepo：`cd AirDesign && npm run build`。

## 快速接入（UmiJS）

### 1. 配置

```tsx
// src/app.tsx
import { defineSdkConfig } from 'air-kit';

defineSdkConfig({
  storagePrefix: 'my-app',
  appName: '我的应用',
  appTagline: 'Intelligent Platform',
  theme: 'teal',
});
```

`SdkConfig` 字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `storagePrefix` | string | sessionStorage 键前缀，多应用隔离 |
| `appName` | string | 应用名称，显示在登录页 |
| `appTagline` | string? | 登录页副标题 |
| `theme` | 见 `LoginTheme` | 登录页主题色，默认 blue |

### 2. 用户状态（Zustand）

air-kit 内置 `useUserStore`，无需注册 DVA Model：

```tsx
import { useUserStore } from 'air-kit'

// 精确订阅（推荐）
const currentUser = useUserStore((s) => s.currentUser)
const login = useUserStore((s) => s.login)
await login({ id, password })

// 或在非组件代码中直接访问
useUserStore.getState().logout()
```

| Action | 说明 |
|--------|------|
| `login` | 登录（密码 SHA256 后提交） |
| `logout` | 登出并清除 session |
| `validateToken` | 校验当前 Token |
| `changePassword` | 修改密码 |
| `updateUserInfo` | 更新用户信息 |
| `fetchUserSettings` / `updateUserSettings` | 获取 / 更新用户设置（AirFramework 持久化，字号等写入 sessionStorage 并应用 `--base-font-size`） |

### 3. 布局

```tsx
// src/layouts/index.tsx
import { SecurityLayout } from 'air-kit';
import 'air-design/style.css';
import 'air-kit/style.css';

export default function Layout({ children }) {
  return <SecurityLayout>{children}</SecurityLayout>;
}
```

`SecurityLayout` 行为：

- 无 Token → 渲染 `Login` 页
- URL 含 `transferToken` → 自动兑换 SSO Token 后进入
- 有 Token → 校验通过后渲染 `children`，并拉取用户显示设置（字号偏好）
- 校验中 → 全屏 `Spin`

应用入口调用 `defineSdkConfig` 时会从 sessionStorage 恢复字号，减少刷新闪烁。显示设置在 `UserSettings` 面板中修改，所有 SSO 应用共享同一套逻辑。

### 4. 业务组件

```tsx
import { AppSwitcher, UserSettings } from 'air-kit';
import { useState } from 'react';

function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <AppSwitcher />
      <button onClick={() => setSettingsOpen(true)}>设置</button>
      <UserSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
```

## 工具函数

```typescript
import {
  POST, GET, SSE_POST,
  SHA,
  getAvatarUrl, getAgentIconUrl,
  randomString, UUID, shortId,
  formatFileSize,
} from 'air-kit';
```

`POST` / `GET` 自动附加请求头：

- `Authorization: Bearer {token}`
- `X-User-Id`
- `X-User-Login-Id`

401 时自动清除 session 并触发 `auth-state-changed` 事件。

## 子路径导出

| 路径 | 用途 |
|------|------|
| `air-kit` | 主入口 |
| `air-kit/config` | 配置模块 |
| `air-kit/models/user` | useUserStore（Zustand） |
| `air-kit/layouts/SecurityLayout` | 安全布局 |
| `air-kit/pages/Login` | 登录页 |
| `air-kit/utils/HttpRequest` | HTTP 封装 |
| `air-kit/utils/CryptoUtils` | SHA256 |
| `air-kit/style.css` | 样式 |

## 类型导出

```typescript
import type {
  SdkConfig,
  UserResponse,
  UserLoginRequest,
  DisplaySettings,
  UserSettingsResponse,
} from 'air-kit';
```

## 从 air-auth / air-sdk 迁移

| 旧 | 新 |
|----|-----|
| `air-auth` / `air-sdk` | `air-kit` |
| `defineAuthConfig` | `defineSdkConfig` |
| `getAuthConfig` | `getSdkConfig` |
| `import 'air-auth/dist/air-auth.css'` | `import 'air-kit/style.css'` |

## 2.0 重构说明（不向后兼容）

air-kit 2.0 随 air-design 2.0 一起完成底层重构，**不保留旧 API 兼容**：

- **登录页**：使用 air-design `Form` / `Input` / `PasswordInput` / `Button`，校验由 Form.rules 驱动。
- **用户设置**：`BasicInfo` / `DisplaySettings` / `ChangePassword` 使用 air-design `Form` 体系；头像选择为自定义 `AvatarPicker`，头像展示使用 air-design `Avatar`（antd 兼容 API）。
- **AppSwitcher**：antd `Dropdown` 改用 air-design 的 `DropdownMenu` 原语；`layoutSize` 改为 props 传入（默认值）。
- **状态管理**：去 Umi/DVA，改用 **Zustand** `useUserStore`；`connect`/`useDispatch`/`useSelector` 全部移除。纯 React 与 Umi 应用均可使用。
- 表单校验由 air-design `Form.Item` 的 `rules` / `form.validateFields()` 完成，接口错误仍通过 `Notice` 提示。

