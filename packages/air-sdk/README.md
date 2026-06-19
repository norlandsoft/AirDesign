# air-sdk

企业应用前端业务组件框架，基于 `air-design` 通用 UI 层，提供登录、认证布局、用户管理等开箱即用的业务模块。

适用场景：接口测试平台、测试管理平台、数据治理平台等需要统一登录体验与主布局的企业前端。

## 依赖关系

```
业务应用 (UmiJS 4)
    └── air-sdk          ← 本包
            └── air-design   ← 通用 UI（shadcn/Radix + TailwindCSS，peerDependency）
                    └── react
```

**Peer Dependencies**（宿主项目必须安装）：

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "umi": ">=4",
  "air-design": ">=2.0.0"
}
```

## 构建

在 Monorepo 根目录：

```bash
npm run build:sdk
# 或
npm run build -w air-sdk
```

监听模式：

```bash
npm run dev -w air-sdk
```

产物目录 `dist/`：

| 文件 | 说明 |
|------|------|
| `index.mjs` | 主入口 |
| `air-sdk.css` | 业务样式，通过 `air-sdk/style.css` 引入 |
| `src/index.d.ts` | 类型声明 |

## 安装

```json
{
  "dependencies": {
    "air-design": "file:../AirDesign/packages/air-design",
    "air-sdk": "file:../AirDesign/packages/air-sdk"
  }
}
```

安装前先构建 Monorepo：`cd AirDesign && npm run build`。

## 快速接入（UmiJS）

### 1. 配置

```tsx
// src/app.tsx
import { defineSdkConfig } from 'air-sdk';

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
| `theme` | `'blue' \| 'teal' \| 'amber'`? | 登录页主题色，默认 teal |

### 2. 注册 Model

```typescript
// src/models/user.ts
export { UserModel as default } from 'air-sdk';
```

`UserModel` 提供 effects：

| Effect | 说明 |
|--------|------|
| `user/login` | 登录（密码 SHA256 后提交） |
| `user/logout` | 登出并清除 session |
| `user/validateToken` | 校验当前 Token |
| `user/changePassword` | 修改密码 |
| `user/fetchUserSettings` | 获取用户设置 |
| `user/updateUserSettings` | 更新用户设置 |

### 3. 布局

```tsx
// src/layouts/index.tsx
import { SecurityLayout } from 'air-sdk';
import 'air-design/style.css';
import 'air-sdk/style.css';

export default function Layout({ children }) {
  return <SecurityLayout>{children}</SecurityLayout>;
}
```

`SecurityLayout` 行为：

- 无 Token → 渲染 `Login` 页
- URL 含 `transferToken` → 自动兑换 SSO Token 后进入
- 有 Token → 校验通过后渲染 `children`
- 校验中 → 全屏 `Spin`

### 4. 业务组件

```tsx
import { AppSwitcher, UserSettings } from 'air-sdk';
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
} from 'air-sdk';
```

`POST` / `GET` 自动附加请求头：

- `Authorization: Bearer {token}`
- `X-User-Id`
- `X-User-Login-Id`

401 时自动清除 session 并触发 `auth-state-changed` 事件。

## 子路径导出

| 路径 | 用途 |
|------|------|
| `air-sdk` | 主入口 |
| `air-sdk/config` | 配置模块 |
| `air-sdk/models/user` | UserModel |
| `air-sdk/layouts/SecurityLayout` | 安全布局 |
| `air-sdk/pages/Login` | 登录页 |
| `air-sdk/utils/HttpRequest` | HTTP 封装 |
| `air-sdk/utils/CryptoUtils` | SHA256 |
| `air-sdk/style.css` | 样式 |

## 类型导出

```typescript
import type {
  SdkConfig,
  UserResponse,
  UserLoginRequest,
  DisplaySettings,
  UserSettingsResponse,
} from 'air-sdk';
```

## 从 air-auth 迁移

| 旧 | 新 |
|----|-----|
| `air-auth` | `air-sdk` |
| `defineAuthConfig` | `defineSdkConfig` |
| `getAuthConfig` | `getSdkConfig` |
| `import 'air-auth/dist/air-auth.css'` | `import 'air-sdk/style.css'` |

## 2.0 重构说明（不向后兼容）

air-sdk 2.0 随 air-design 2.0 一起完成底层重构，**不保留旧 API 兼容**：

- **登录页**：移除 antd `Form` / `Input` / `ConfigProvider`，改为原生受控表单 + 手动校验。Canvas 星野动画保持不变。
- **用户设置**：`BasicInfo` / `DisplaySettings` / `ChangePassword` 的 antd `Form` / `Radio` / `Input.Password` 改为原生 input / radio-button-group，`Avatar` 改用 air-design 的 Radix Avatar 原语。
- **AppSwitcher**：antd `Dropdown` 改用 air-design 的 `DropdownMenu` 原语。
- **umi/DVA**：保留（`connect` / `useDispatch` / `useSelector`），仅替换 UI 层。
- 表单校验由各组件内部手动完成（`Notice` 提示），不再依赖 antd Form 的 `rules`/`validateFields`。

