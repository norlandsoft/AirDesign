# Separator 原语重新设计 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 改造 `primitives/separator.tsx`，新增可选 `title`/`titleAlign` 能力，使其既能作纯线条、也能作表单分组分割线，API 向后兼容。

**Architecture:** 保持 primitives 层 shadcn 风格（Radix Separator + Tailwind，颜色已接入设计 Token）。无 title 时渲染与现状完全一致；有 title（水平）时渲染"标题 + flex-1 线条"组合；vertical + title 忽略 title。

**Tech Stack:** React 18 + TypeScript、Radix Separator、Tailwind（含设计 Token）。

**验证策略（遵循 CLAUDE.md 规则6，不保留测试代码）：** 项目无测试框架。以 `npm run build:design`（vite build，含 tsc 类型检查）作编译验证；以 example 临时用例作浏览器视觉验证，验证后删除临时代码。

**对应 spec：** `docs/superpowers/specs/2026-06-30-separator-redesign-design.md`。

---

## 文件结构

| 文件 | 职责 | 本次改动 |
|---|---|---|
| `packages/air-design/src/primitives/separator.tsx` | Separator 原语 | 重写：新增 title/titleAlign 渲染分支 |
| `example/src/pages/FormPage.tsx` | 表单演示页（临时验证用） | 临时加 Separator 用例，验证后删除 |

---

## Task 1: 改造 Separator 支持 title

**Files:**
- Modify: `packages/air-design/src/primitives/separator.tsx`

- [ ] **Step 1: 用以下内容整体替换 `packages/air-design/src/primitives/separator.tsx`**

```tsx
/**
 * Separator 原语：基于 Radix Separator 的分隔线
 *
 * 支持水平/垂直方向，无障碍语义（role="separator"）。
 * 传入 title 时渲染为"标题 + 线条"的分组分割线（仅水平方向生效），
 * 可用作表单分组分割线；无 title 时为纯线条（向后兼容）。
 *
 * 设计思路：无 title 复用 Radix Separator Root（线条 + 无障碍语义）；
 * 有 title 时外层 flex 容器承载标题与一条 flex-1 线条，titleAlign 控制
 * 标题位置（left=标题在左+右侧长线；center=两侧等长线）。
 *
 * @author ChaiMingXu, 2026/06/30
 */
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import {cn} from '../lib/cn'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    /** 可选标题：传入后渲染为"标题 + 线条"的分组分割线（仅水平方向生效） */
    title?: React.ReactNode
    /** 标题位置，默认 left（标题在左 + 右侧长线）；center 为两侧等长线 */
    titleAlign?: 'left' | 'center'
  }
>(
  (
    {className, orientation = 'horizontal', decorative = true, title, titleAlign = 'left', ...props},
    ref,
  ) => {
    // 有标题且水平：渲染"标题 + 线条"组合（表单分组分割线）
    if (title && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          role={decorative ? undefined : 'separator'}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          {titleAlign === 'center' && (
            <SeparatorPrimitive.Root
              decorative
              orientation="horizontal"
              className="shrink-0 h-px flex-1 bg-border"
            />
          )}
          <span className="whitespace-nowrap text-sm font-medium text-foreground">{title}</span>
          <SeparatorPrimitive.Root
            decorative
            orientation="horizontal"
            className="shrink-0 h-px flex-1 bg-border"
          />
        </div>
      )
    }
    // 无标题（或垂直方向忽略 title）：纯线条，行为与改造前一致
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    )
  },
)
Separator.displayName = 'Separator'

export {Separator}
```

- [ ] **Step 2: 构建验证（类型检查）**

Run: `npm run build:design`
Expected: 构建成功，无 TS 报错。若 `{...props}` 透传到 div 出现类型冲突，将 title 分支的 `{...props}` 改为 `{...(props as React.HTMLAttributes<HTMLDivElement>)}`。

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/primitives/separator.tsx
git commit -m "feat(air-design): Separator 原语支持可选标题（表单分组分割线）"
```

---

## Task 2: 浏览器视觉验证（临时用例，验证后删除）

**Files:**
- Modify: `example/src/pages/FormPage.tsx`（临时，验证后还原）

- [ ] **Step 1: 在 FormPage 顶部 import 与临时用例**

在 `example/src/pages/FormPage.tsx` 顶部追加 import（紧随现有 air-design import）：

```tsx
import {Separator} from 'air-design'
```

在 FormPage 返回的 JSX 中（PageContainer 内、现有表单内容之前）临时插入验证用例：

```tsx
<div className="space-y-3 mb-6">
  <Separator />
  <Separator title="基本信息" />
  <Separator title="居中标题" titleAlign="center" />
  <div className="h-12 flex gap-4">
    <span>左</span>
    <Separator orientation="vertical" />
    <span>右</span>
  </div>
</div>
```

- [ ] **Step 2: 启动 example 并核验**

Run: `npm run dev:example`（后台）
打开 `/form` 页，核验：
- 无 title：1px 水平线（`bg-border`）。
- `title="基本信息"`：标题在左、右侧 flex-1 长线（`基本信息 ──────`）。
- `title="居中标题" titleAlign="center"`：标题居中、两侧等长线。
- `orientation="vertical"`：垂直 1px 线。
- 颜色为设计 Token 边框色；标题 `text-sm font-medium`。

Expected: 上述形态均符合预期。

- [ ] **Step 3: 删除临时验证用例（遵循 CLAUDE.md 规则6）**

还原 `example/src/pages/FormPage.tsx`：移除 Step 1 加入的 import 与 JSX 用例。

Run: `git diff example/src/pages/FormPage.tsx` 确认无残留改动（输出应为空）。

- [ ] **Step 4: 停止 dev server**

停止 Task 2 Step 2 启动的后台 dev server。

---

## Task 3: 最终全量构建验证

**Files:** 无（仅验证）

- [ ] **Step 1: 全量构建**

Run: `npm run build:design`
Expected: 构建成功，产物输出到 `packages/air-design/dist`。

- [ ] **Step 2: 确认 dist 类型声明更新**

Run: `grep -l "title" packages/air-design/dist/primitives/separator.d.ts 2>/dev/null`
Expected: 命中（确认 title/titleAlign 已对外暴露在类型声明中）。

---

## Self-Review 结果

- **Spec 覆盖**：spec §3 API（orientation/decorative/title/titleAlign）→ Task 1 实现；§4 渲染（无 title/left/center/vertical）→ Task 1 代码 + Task 2 验证；§5 视觉规格（1px/bg-border/text-sm/gap-2）→ Task 1 代码；§6 兼容性 → Task 1 无 title 分支保持原行为。全覆盖。
- **占位符扫描**：无 TBD/TODO，每步含完整代码或精确命令。
- **类型一致性**：`title`/`titleAlign` 在 forwardRef 泛型、解构、渲染中一致；`Separator` 导出名不变。
