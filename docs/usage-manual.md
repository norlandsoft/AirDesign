# AirDesign 使用手册

> 作者：ChaiMingXu | 版本：2.0 | 更新：2026/06/19
>
> 面向消费方开发者。架构设计详见 [架构说明](./architecture.md)。
> 组件交互效果可在 `example/` Demo 中预览（见文末「Demo 项目」）。

---

## 一、快速开始

### 1. 安装

在 Monorepo 根目录构建：

```bash
cd /opt/AirDesign
npm install
npm run build          # 构建 air-design + air-kit
```

业务项目 `package.json`：

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "air-design": "file:../AirDesign/packages/air-design",
    "air-kit": "file:../AirDesign/packages/air-kit"
  }
}
```

```bash
cd /path/to/your-app
npm install            # file: 协议会复制 dist/，修改源码后需重新 build + install
```

> 联调推荐 `npm link`（符号链接，build 后即时生效，无需 reinstall）。

### 2. 引入样式与组件

```tsx
import 'air-design/style.css'                    // 必须：Tailwind + 组件样式
import { Button, Table, Icon, Dialog } from 'air-design'
import type { CodeEditorRef, RichEditorRef } from 'air-design'
```

### 3. 暗色模式

在根元素加 `.dark` 类即可（无需改组件）：

```html
<html class="dark">...</html>
```

---

## 二、核心 UI 组件

### Button

```tsx
import { Button, IconButton, MenuButton, ToggleButton } from 'air-design'

<Button type="primary" onClick={fn}>主要按钮</Button>
<Button type="default">默认</Button>
<Button type="danger">危险</Button>
<Button type="text">文本</Button>
<Button type="link">链接</Button>
<Button danger icon="delete">删除</Button>     {/* danger 优先级最高 */}
<Button type="primary" loading block>加载中</Button>
<Button type="primary" icon="add">带图标</Button>   {/* icon 为图标名时经 Icon 渲染 */}
```

| Prop | 类型 | 说明 |
|------|------|------|
| `type` | `'default' \| 'primary' \| 'danger' \| 'text' \| 'link'` | 默认 `default` |
| `danger` | `boolean` | 为 true 时渲染为 danger |
| `icon` | `string \| ReactNode` | 图标名或自定义节点 |
| `loading` / `block` | `boolean` | 加载态 / 撑满宽度 |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | — |

**IconButton**：图标按钮，支持 tooltip、下拉菜单、圆形/方形。
**MenuButton**：点击展开下拉菜单（默认 more/menu 图标）。
**ToggleButton**：带选中态的图标按钮。

### Icon

```tsx
import { Icon } from 'air-design'

<Icon name="add" size={20} />
<Icon name="folder" size={16} color="var(--color-primary)" thickness={1.5} />
```

`name` 为 `components/Icon/svg/` 下 SVG 文件名（不含扩展名）。支持 `size` / `color` / `thickness`。

### Dialog

```tsx
import { Dialog, UploadDialog } from 'air-design'

// 命令式
Dialog({ title: '确认', message: '确定删除？', onConfirm: ref => ref?.doCancel() })

// 组件式（ModalDialog，受控 visible、可拖拽、loading 遮罩）
// UploadDialog 命令式上传：UploadDialog({ url, onFileSaved })
```

### SlidePanel

```tsx
import { SlidePanel } from 'air-design'

<SlidePanel
  open={open} type="large" title="编辑" placement="right"
  hasCloseButton hasButtonBar
  confirmButtonText="保存" closeButtonText="取消"
  onConfirm={save} onClose={close}
  bodyPadding={16}
>...</SlidePanel>
```

`type`：`small`(290) / `default`(378) / `large`(850) / `huge`(1280) / `full` / `custom`(用 width)。Header 高度 40px，Footer 高度 50px，打开时自侧边滑入。支持内嵌抽屉（`innerDrawer`/`showInnerDrawer`/`onInnerClose`）。

### Table

```tsx
import { Table } from 'air-design'

const columns = [
  { dataIndex: 'name', title: '名称', render: (v, r) => <strong>{v}</strong> },
  { dataIndex: 'age', title: '年龄', width: 80 },
]
<Table data={rows} columns={columns} height={400}
  showHeader headerHeight={40} rowHeight={40}
  onItemClick={(record, e) => select(record)}
  pagination={{ total: 100, pageSize: 10, currentPage: 1, onChange: setPage }}
  showEmpty emptyText="暂无数据"
/>
```

列定义沿用 Semi/AntD 习惯（`dataIndex` / `title` / `render` / `width`），底层为 TanStack Table。`TableRowMenu` 提供行内「更多」操作菜单。

### Tree

```tsx
import { Tree } from 'air-design'

const data = [{ key: '1', label: '分组', type: 'group', children: [...] }]
<Tree data={data} height={300} showFilter folderIcon="folder" itemIcon="document"
  groupMenu={[{label:'重命名', onClick:(item,node)=>{}}]}
  onSelect={node => {}} defaultExpandedKeys={['1']}
/>
```

基于 react-arborist，完整迁移 JettoAuthor Semi Tree 能力：搜索过滤（内置 searchTerm）、节点菜单（groupMenu/itemMenu）、受控展开/选中（expandedKeys/value）、autoExpandParent、disabled 节点、checkable 多选、拖拽（draggable/onDrop/onChange）、clickToCollapse 与 stopMenuEventPropagation。

### TabPanel

```tsx
<TabPanel height={500} width={800}
  items={[{ key:'t1', label:'标签一', closable:true, children:<Content/> }]}
  currentTab={current}
  onChangeTab={t => setCurrent(t)}
  onRemoveTab={t => remove(t)}
/>
```

### Message / Notice（命令式）

```tsx
import { Message, Notice } from 'air-design'

Message.success('保存成功')
Message.error('操作失败', 3)
Notice.info('提示', '详情内容', 4, 'topRight')
Notice.error('错误标题', '请检查网络')
```

### Spin / LoadingPanel

```tsx
<Spin loading><Content/></Spin>          {/* 叠加遮罩 */}
<Spin loading fullscreen />              {/* 全屏遮罩 */}
<LoadingPanel loading message="加载中"/> {/* 全屏加载 */}
```

### ColorPicker

```tsx
import { ColorPicker } from 'air-design'

<ColorPicker value="#1677ff" onChangeComplete={c => setColor(c.toHexString())}>
  <button>选色</button>
</ColorPicker>
```

基于 react-colorful + Popover，取色面板在上、可编辑 hex 输入（Enter 确认 / Esc 取消）、预设色 6×2 网格在下，含「无背景色」。

### Form 表单体系（antd 兼容）

单行控件（Input / Select / NumberInput 等）默认高度 **38px**（`--control-height`）。

```tsx
import {
  Form, Input, PasswordInput, TextArea, NumberInput,
  Select, Checkbox, Radio, Switch,
} from 'air-design'

const [form] = Form.useForm()

<Form form={form} layout="vertical" initialValues={{ notify: true }}
  onFinish={values => console.log(values)}>
  <Form.Item name="email" label="邮箱" rules={[{ required: true }, { type: 'email' }]}>
    <Input placeholder="name@example.com" allowClear />
  </Form.Item>
  <Form.Item name="password" label="密码" rules={[{ required: true }, { min: 8 }]}>
    <PasswordInput />
  </Form.Item>
  <Form.Item name="age" label="年龄">
    <NumberInput min={1} max={120} />
  </Form.Item>
  <Form.Item name="lang" label="语言">
    <Select options={[{ value: 'ts', label: 'TypeScript' }]} allowClear />
  </Form.Item>
  <Form.Item name="role" label="角色">
    <Radio.Group optionType="button" options={[{ value: 'dev', label: '开发' }]} />
  </Form.Item>
  <Form.Item name="interests" label="兴趣">
    <Checkbox.Group options={[{ value: 'code', label: '前端' }]} />
  </Form.Item>
  <Form.Item name="notify" label="通知" valuePropName="checked">
    <Switch />
  </Form.Item>
  <Form.Item name="agree" valuePropName="checked" rules={[{ required: true }]}>
    <Checkbox>同意协议</Checkbox>
  </Form.Item>
  <Button type="primary" onClick={() => form.submit()}>提交</Button>
</Form>
```

**Form.List 动态列表**：配合 `FormListField` 为行内 `Form.Item` 注入路径前缀。

```tsx
import { Form, FormListField, Input } from 'air-design'

<Form.List name="contacts">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field) => (
        <FormListField key={field.key} fieldName={field.name} listName={['contacts']}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </FormListField>
      ))}
      <Button onClick={() => add({ name: '', phone: '' })}>添加</Button>
    </>
  )}
</Form.List>
```

**布局**：`layout="vertical" | "horizontal" | "inline"`；horizontal 可配 `labelCol` / `wrapperCol`（24 栅格）。

**FormInstance 常用方法**：`getFieldsValue` / `setFieldsValue` / `resetFields` / `validateFields` / `submit`。

**Form.Item 要点**：Checkbox / Switch 需 `valuePropName="checked"`；`rules` 支持 `required` / `min` / `max` / `pattern` / `type` / 自定义 `validator`。

**字段组件**：`Input`（含 `PasswordInput`）、`TextArea`、`NumberInput`、`Select`（支持 `mode="multiple"`）、`Checkbox` / `Checkbox.Group`、`Radio` / `Radio.Group`。

### Avatar 头像（antd 兼容）

```tsx
import { Avatar } from 'air-design'

<Avatar src="/avatar.png" alt="用户" onClick={() => { /* ... */ }} />
<Avatar size="large">张</Avatar>
<Avatar icon="user" shape="square" />
<Avatar.Group max={{ count: 3 }}>
  <Avatar>甲</Avatar>
  <Avatar>乙</Avatar>
  <Avatar>丙</Avatar>
  <Avatar>丁</Avatar>
</Avatar.Group>
```

**尺寸**：`default` 32px / `small` 24px / `large` 40px，或传入数字像素。字符头像背景色由内容哈希生成（对齐 antd 色板）。深度定制可使用 `RadixAvatar` / `RadixAvatarImage` / `RadixAvatarFallback` 原语。

### 其他基础组件

```tsx
import { Splitter, GroupSplitter, EditableLabel, Help, List, MenuBar, PropertiesNaviBar } from 'air-design'

<Splitter split="vertical" defaultSize={200} minSize={50}
  onChange={n => {}}>{<PaneA/>}{<PaneB/>}</Splitter>

<EditableLabel text="标题" onSave={v => setTitle(v)} />
<Help text="这是一段帮助说明" />
<GroupSplitter title="基础信息" />
```

---

## 三、复合业务组件

### CodeEditor（Monaco）

```tsx
import { CodeEditor } from 'air-design'
const ref = useRef<CodeEditorRef>(null)

<CodeEditor ref={ref} language="typescript" content={code}
  height={400} onChange={v => setCode(v)} />
// ref.current.getContent()
```

宿主需安装 `@monaco-editor/react`（Monaco 从 CDN 自动加载）。

### RichEditor（Tiptap）

```tsx
import { RichEditor } from 'air-design'
const ref = useRef<RichEditorRef>(null)

<RichEditor ref={ref} content={docJson} docId={id}
  title height={600} showUndo simpleMode={false} />
// ref.current.getMarkdown() / setMarkdown(md) / getHtmlContent()
```

工具栏：撤销/重做、标题样式、加粗/斜体/下划线/删除线、字体色/背景色、对齐、列表、缩进、任务列表、链接、图片、表格、代码块、公式。宿主需安装 Tiptap 全家桶。

### Markdown

```tsx
import { Markdown } from 'air-design'

<Markdown content={md} darkMode={false} streaming={isStreaming} onCopyCode={copy} />
```

支持 GFM、数学公式（KaTeX）、Mermaid 图表、代码高亮、`<think>` 思考块折叠、流式输出（未闭合围栏临时闭合）。

### Kanban

```tsx
import { Kanban } from 'air-design'

<Kanban data={statusList} columnWidth={255} width={900} height={500}
  selectedTaskId={selId}
  onAddTask={colId => {}} onTaskClick={(colId, taskId) => {}}
  onTaskReorder={p => {}} onTaskMove={p => {}} onStatusChange={list => {}} />
```

基于 dnd-kit，支持列拖拽、跨列任务拖拽、同列排序。宿主需安装 dnd-kit。

### MindPanel

```tsx
import { MindPanel } from 'air-design'

<MindPanel height={600} width={900} documentId={id} data={mindData} onSave={nodes => {}} />
```

基于 @xyflow/react，自定义树布局算法、拖拽重父、折叠。宿主需安装 `@xyflow/react`。

---

## 四、业务脚手架 air-kit

> air-kit 仅服务于自有应用。已**去 Umi/DVA**，状态管理基于 Zustand，纯 React 与 Umi 应用均可使用。

### 1. 配置

```tsx
// src/app.tsx
import { defineSdkConfig } from 'air-kit'

defineSdkConfig({
  storagePrefix: 'air-test-platform',   // sessionStorage 前缀，多应用隔离
  appName: '接口测试平台',
  appTagline: 'API Testing Platform',
  theme: 'teal',                        // 登录页主题：blue | teal | amber
})
```

### 2. 用户状态（Zustand）

air-kit 内置 `useUserStore`，无需注册 DVA Model。直接使用：

```tsx
import { useUserStore } from 'air-kit'

const { currentUser, isAuthenticated, login, logout } = useUserStore()
// 精确订阅（推荐，避免多余渲染）：
const currentUser = useUserStore((s) => s.currentUser)
await useUserStore.getState().login({ id, password })
```

actions：`login` / `logout` / `validateToken` / `changePassword` / `updateUserInfo` / `fetchUserSettings` / `updateUserSettings` / `setUser` / `clearUser`。

### 3. 布局

```tsx
// src/layouts/index.tsx
import { SecurityLayout } from 'air-kit'
import 'air-design/style.css'
import 'air-kit/style.css'
import LoginPage from '@/pages/Login'   // 各业务服务自行实现的登录页

export default function Layout({ children }) {
  // 未登录时渲染消费方提供的登录页（login prop）
  return <SecurityLayout login={<LoginPage/>}>{children}</SecurityLayout>
}
```

`SecurityLayout` 行为：无 Token → 渲染 `login` prop（各服务自实现的登录页）；URL 含 `transferToken` → 自动兑换 SSO；校验中 → 全屏 Spin。登录页由各业务服务自行实现，air-kit 不内置。

### 4. 业务组件

```tsx
import { AppSwitcher, UserSettings } from 'air-kit'

function Header() {
  const [open, setOpen] = useState(false)
  return <>
    <AppSwitcher />
    <button onClick={() => setOpen(true)}>设置</button>
    <UserSettings visible={open} onClose={() => setOpen(false)} />
  </>
}
```

### 5. 请求封装

```tsx
import { POST, GET, SSE_POST } from 'air-kit'

const resp = await POST('/api/v1/endpoint', { key: 'value' })
await SSE_POST('/api/v1/stream', { prompt: '...' }, chunk => console.log(chunk))
```

自动注入 `Authorization: Bearer {token}` / `X-User-Id` / `X-User-Login-Id`；401 自动清理 session 并触发 `auth-state-changed`。

### 导出清单

| 分类 | 导出 |
|------|------|
| 配置 | `defineSdkConfig` / `getSdkConfig` / `storageKey` |
| Store | `useUserStore`（`UserModel` 别名兼容）/ `UserState` |
| 布局 | `SecurityLayout` |
| 页面 | `Login` |
| 组件 | `AppSwitcher` / `UserSettings` |
| 工具 | `POST` / `GET` / `SSE_POST` / `SHA` / `getAvatarUrl` / `UUID` / `formatFileSize` 等 |
| 类型 | `SdkConfig` / `UserResponse` / `DisplaySettings` 等 |

### 子路径导出

`air-kit` · `air-kit/config` · `air-kit/models/user` · `air-kit/layouts/SecurityLayout` · `air-kit/utils/HttpRequest` · `air-kit/utils/CryptoUtils` · `air-kit/style.css`

---

## 五、对等依赖速查

核心组件（Button/Table/Tree/Dialog 等）基于 Radix，**随 air-design 自动安装**，宿主无需额外操作。

使用以下复合组件时，宿主需在 `dependencies` 中安装对应内核：

| 组件 | 需安装 |
|------|--------|
| CodeEditor | `@monaco-editor/react` |
| RichEditor | `@tiptap/react`、`@tiptap/starter-kit`、`@tiptap/pm` 等 TipTap 扩展 |
| Markdown | `react-markdown`、`react-syntax-highlighter`、`remark-gfm`、`rehype-katex` |
| Kanban | `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities` |
| MindPanel | `@xyflow/react` |

---

## 六、Demo 项目

`example/` 目录提供组件效果展示 Demo，基于 Vite + React，直接引用 workspace 中的 air-design。

### 运行

```bash
# 1. 先构建组件库
cd /opt/AirDesign && npm run build:design

# 2. 启动 Demo
npm run dev -w air-design-example
# 或：cd example && npm run dev
```

浏览器打开终端提示的地址（默认 http://localhost:5174）。

### 内容

Demo 按组件分类展示：Button 系列、Icon、Dialog、SlidePanel、Table、Tree、TabPanel、Message/Notice、Spin/LoadingPanel、ColorPicker、Splitter、EditableLabel、Help、Markdown、CodeEditor 等，每个组件配可交互示例与代码片段，便于选型与回归。

> Demo 中大量使用 antd 的组件已切换为 air-design 自有实现；如需对比，可在 `example/src/pages/` 下查看各页源码。

---

## 七、常见问题

### 样式未生效

必须引入 `import 'air-design/style.css'`（air-design）和 `import 'air-kit/style.css'`（使用 SDK 时）。

### npm link 联调 React 双实例报错

业务项目 vite/webpack 中将 react 指向自身 node_modules：

```js
resolve: { alias: { react: path.resolve('./node_modules/react'), 'react-dom': path.resolve('./node_modules/react-dom') } }
```

### file: 安装后未更新

`file:` 协议会复制 `dist/`，改源码后需 `npm run build` + `npm install air-design`。

### 2.0 升级注意

2.0 为完全重构，**不向后兼容**。`import { Tag, Form, Input } from 'air-design/antd'` 这类 antd 转发已删除；antd Form 表单请改用原生受控组件或 air-design 组件。
