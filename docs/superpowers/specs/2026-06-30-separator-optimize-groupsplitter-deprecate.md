# Separator 视觉优化与 GroupSplitter 废弃

- 作者：ChaiMingXu
- 创建时间：2026/06/30
- 适用：`packages/air-design/src/primitives/separator.tsx`、`components/GroupSplitter/`、`example/src/pages/*`

## 1. 背景与问题

Separator 重新设计后已支持 `title`，功能覆盖 GroupSplitter 的"说明条"场景。但存在两个问题：

1. **Separator title 模式上下间距不足**：title 模式无垂直外边距，说明条与上下内容紧贴（上方约 10-15px、下方 15-20px），视觉拥挤；而 GroupSplitter 因 `height=32` 自带垂直空间显得舒展。
2. **说明条组件混用**：FormPage 已改用 Separator，但 example 其余 6 个页面仍用 GroupSplitter，风格不统一。

## 2. 决策

1. **Separator title 模式加垂直间距**：外层 flex 容器 className 增加 `my-4`（上下各 16px）。纯线条模式（无 title / vertical）不变，保持紧凑分隔。标题样式不变（`text-sm font-medium text-foreground`）。
2. **直接删除 GroupSplitter**：删除组件目录与 `index.ts` 导出。主应用（AirMachine）若使用需自行迁移到 Separator。
3. **example 6 个页面迁移**：`<GroupSplitter title="X"/>` → `<Separator title="X"/>`，调整 import。

## 3. 改动清单

### 3.1 Separator 优化（`primitives/separator.tsx`）

title 分支（有 title 且水平）的外层 div className：`'flex items-center gap-2'` → `'flex items-center gap-2 my-4'`。其余分支不变。

### 3.2 删除 GroupSplitter

- 删除 `packages/air-design/src/components/GroupSplitter/` 目录。
- 移除 `packages/air-design/src/index.ts` 中 `export {default as GroupSplitter} from './components/GroupSplitter'`。

### 3.3 example 迁移（6 页面，约 26 处）

| 页面 | 处数 |
|---|---|
| NavMenuPage | 2 |
| PropertiesNaviBarPage | 1 |
| HelpPage | 3 |
| AvatarPage | 6 |
| GridPage | 8 |
| TreePage | 6 |

每处 `<GroupSplitter title="X"/>` → `<Separator title="X"/>`；import 移除 `GroupSplitter`、新增 `Separator`。

## 4. 不在范围

- 不改 Separator 其他能力（方向 / titleAlign / 标题样式）。
- 不迁移外部主应用。

## 5. 验收标准

- `npm run build:design` 构建通过。
- example 构建（`npm run build -w air-design-example`）通过，无 GroupSplitter 残留引用。
- 浏览器视觉：Separator 说明条上下间距改善（上下各约 16px），各页面渲染正常。
- GroupSplitter 目录与导出已删除。
