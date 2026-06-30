# Separator 优化与 GroupSplitter 废弃 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化 Separator title 模式上下间距（my-4），废弃并删除 GroupSplitter，example 全部迁移到 Separator。

**Architecture:** Separator 的 title 分支外层加 `my-4`；example 6 个页面把 `GroupSplitter` 词级替换为 `Separator`（覆盖 import 与 JSX）；最后删除 GroupSplitter 目录与导出。迁移先于删除，保证构建不中断。

**Tech Stack:** React 18 + TypeScript、Tailwind（含设计 Token）、Vite 库模式。

**验证策略（遵循 CLAUDE.md 规则6，不保留测试代码）：** 无测试框架。以 `npm run build:design` 与 example build（含 tsc 类型检查）作编译验证；以浏览器作视觉确认。

**对应 spec：** `docs/superpowers/specs/2026-06-30-separator-optimize-groupsplitter-deprecate.md`。

---

## 文件结构

| 文件 | 改动 |
|---|---|
| `packages/air-design/src/primitives/separator.tsx` | title 分支 className 加 `my-4` |
| `packages/air-design/src/components/GroupSplitter/` | 删除整个目录 |
| `packages/air-design/src/index.ts` | 移除 GroupSplitter 导出行 |
| `example/src/pages/{NavMenuPage,PropertiesNaviBarPage,HelpPage,AvatarPage,GridPage,TreePage}.tsx` | `GroupSplitter` → `Separator` |

---

## Task 1: Separator title 模式加 my-4

**Files:**
- Modify: `packages/air-design/src/primitives/separator.tsx`

- [ ] **Step 1: title 分支外层 className 加 my-4**

将 title 分支的外层 div 的 className 由 `'flex items-center gap-2'` 改为 `'flex items-center gap-2 my-4'`：

old:
```tsx
          className={cn('flex items-center gap-2', className)}
```
new:
```tsx
          className={cn('flex items-center gap-2 my-4', className)}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build:design`
Expected: 构建成功。

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/primitives/separator.tsx
git commit -m "style(air-design): Separator title 模式增加上下间距 my-4"
```

---

## Task 2: 迁移 example 6 个页面（GroupSplitter → Separator）

**Files:**
- Modify: `example/src/pages/NavMenuPage.tsx`
- Modify: `example/src/pages/PropertiesNaviBarPage.tsx`
- Modify: `example/src/pages/HelpPage.tsx`
- Modify: `example/src/pages/AvatarPage.tsx`
- Modify: `example/src/pages/GridPage.tsx`
- Modify: `example/src/pages/TreePage.tsx`

每个页面执行一次 **词级 replace_all**：把 `GroupSplitter` 替换为 `Separator`。这会同时覆盖 import 语句（`GroupSplitter` → `Separator`）与所有 JSX（`<GroupSplitter title="X"/>` → `<Separator title="X"/>`），周围字符（`<`、空格、`,`）保持不变，无空格问题。

- [ ] **Step 1: NavMenuPage 替换**

对 `example/src/pages/NavMenuPage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（共 2 处 JSX + 1 处 import）。

- [ ] **Step 2: PropertiesNaviBarPage 替换**

对 `example/src/pages/PropertiesNaviBarPage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（1 处 JSX + 1 处 import）。

- [ ] **Step 3: HelpPage 替换**

对 `example/src/pages/HelpPage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（3 处 JSX + 1 处 import）。

- [ ] **Step 4: AvatarPage 替换**

对 `example/src/pages/AvatarPage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（6 处 JSX + 1 处 import）。

- [ ] **Step 5: GridPage 替换**

对 `example/src/pages/GridPage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（8 处 JSX + 1 处 import）。

- [ ] **Step 6: TreePage 替换**

对 `example/src/pages/TreePage.tsx` 执行 Edit：old=`GroupSplitter`、new=`Separator`、replace_all=true（6 处 JSX + 1 处 import）。

- [ ] **Step 7: example 构建验证（类型 + 残留检查）**

Run: `npm run build -w air-design-example 2>&1 | tail -3`
Expected: 构建成功（`✓ built`）。

Run: `grep -rc "GroupSplitter" example/src | grep -v ":0"`
Expected: 无输出（example 已无 GroupSplitter 残留）。

- [ ] **Step 8: 提交**

```bash
git add example/src/pages/NavMenuPage.tsx example/src/pages/PropertiesNaviBarPage.tsx example/src/pages/HelpPage.tsx example/src/pages/AvatarPage.tsx example/src/pages/GridPage.tsx example/src/pages/TreePage.tsx
git commit -m "refactor(example): 6 个演示页 GroupSplitter 迁移到 Separator"
```

---

## Task 3: 删除 GroupSplitter 组件与导出

**Files:**
- Delete: `packages/air-design/src/components/GroupSplitter/`（整个目录）
- Modify: `packages/air-design/src/index.ts`

- [ ] **Step 1: 删除 GroupSplitter 目录**

Run: `git rm -r packages/air-design/src/components/GroupSplitter`
Expected: 删除 `index.tsx`（与可能的 CSS）。

- [ ] **Step 2: 移除 index.ts 的 GroupSplitter 导出**

删除 `packages/air-design/src/index.ts` 中这一行：

```ts
export {default as GroupSplitter} from './components/GroupSplitter'
```

- [ ] **Step 3: 构建验证**

Run: `npm run build:design 2>&1 | tail -3`
Expected: 构建成功（确认无残留引用）。

- [ ] **Step 4: 提交**

```bash
git add -A packages/air-design/src
git commit -m "feat(air-design): 废弃并删除 GroupSplitter 组件

功能已由 Separator（支持 title）完全覆盖，统一为单一分割线组件"
```

---

## Task 4: 最终视觉验证

**Files:** 无（仅验证）

- [ ] **Step 1: 全量构建**

Run: `npm run build:design && npm run build -w air-design-example 2>&1 | tail -3`
Expected: 均构建成功。

- [ ] **Step 2: 浏览器视觉确认**

Run: `npm run dev:example`（后台）
访问 `/form` 与 `/avatar`（或任一迁移页面），核验：
- 说明条（Separator title）上下有约 16px 间距，不再紧贴内容。
- 标题、线条样式正常。
- 各页面 GroupSplitter 位置均渲染为 Separator 说明条。

Expected: 视觉改善，无报错。核验后停止 dev server。

---

## Self-Review 结果

- **Spec 覆盖**：spec §3.1（Separator my-4）→ Task 1；§3.3（6 页面迁移）→ Task 2；§3.2（删除 GroupSplitter）→ Task 3；§5（验收）→ Task 4。全覆盖。
- **占位符扫描**：无 TBD/TODO，每步含精确命令或代码。
- **类型一致性**：`Separator` 名称贯穿；迁移先于删除（Task 2 在 Task 3 前），保证构建不中断。
- **顺序正确性**：Task 2（迁移 example）必须在 Task 3（删除 GroupSplitter）前完成，否则 example 引用悬空导致构建失败。计划已按此顺序。
