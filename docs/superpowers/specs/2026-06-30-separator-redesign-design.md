# Separator 原语重新设计（支持可选标题）

- 作者：ChaiMingXu
- 创建时间：2026/06/30
- 适用文件：`packages/air-design/src/primitives/separator.tsx`

## 1. 背景与目标

现有 `primitives/separator.tsx` 是 Radix Separator 的简陋包装：仅一条 1px 线条（水平/垂直），已对外导出但**库内无任何组件使用**。表单等场景需要"带分组标题的分割线"（如 `基本信息 ──────`），当前 Separator 不支持这一形态。

目标：在原位改造 Separator，新增可选 `title` 能力，使其既可作纯线条、也可作表单分组分割线；沿用 `Separator` 导出名，API 向后兼容。

## 2. 关键决策

1. **就地改造、沿用导出名**：在 `primitives/separator.tsx` 原位重做，保留 `Separator` 导出（用户选择"改造 Separator 原语"而非新建 FormDivider）。
2. **保持 primitives 层风格**：Radix Separator + Tailwind 类（颜色已接入设计 Token，`@theme inline` 中 `--color-border: var(--border)`）；不引入 CSS 文件，保持原语层（button 等）一致性。
3. **title 可选、默认左对齐**：无 title 时纯线条（原行为不变）；有 title 时标题嵌入线条左侧 + 右侧长线（表单分组最常见形态）。
4. **仅实线（YAGNI）**：不引入 dashed 等变体，保持简单。

## 3. API

```ts
interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** 方向，默认 horizontal */
  orientation?: 'horizontal' | 'vertical'
  /** 是否装饰性（无障碍 role=separator），默认 true */
  decorative?: boolean
  /** 可选标题：传入后渲染为"标题 + 线条"的分组分割线（仅水平方向生效） */
  title?: React.ReactNode
  /** 标题位置，默认 left（标题在左 + 右侧长线）；center 为两侧等长线 */
  titleAlign?: 'left' | 'center'
}
```

沿用 `React.forwardRef`：无 title 时 ref 指向 Radix Root（线条）；有 title 时 ref 指向外层 flex 容器。

## 4. 渲染逻辑

- **无 title**：`<RadixSeparator className="shrink-0 bg-border ..." />`，水平 `h-px w-full`、垂直 `h-full w-px`（与现状完全一致）。
- **有 title 且 orientation='horizontal'**：外层 `<div className="flex items-center gap-2">`，内含标题 `<span>` 与一条 `flex-1` 的 RadixSeparator 线条。
  - `left`（默认）：`<span 标题/> <RadixSeparator flex-1/>`
  - `center`：`<RadixSeparator flex-1/> <span 标题/> <RadixSeparator flex-1/>`
- **orientation='vertical' + title**：忽略 title，按无 title 的垂直线条渲染（垂直线无标题语义）。

## 5. 视觉规格

- 线条：1px、`bg-border`（设计 Token）。
- 标题：`text-sm font-medium text-foreground`、`whitespace-nowrap`。
- 标题与线条间距：`gap-2`（0.5rem）。

## 6. 边界与兼容

- 向后兼容：无 title 的既有用法行为、样式完全不变。
- 库内当前无组件使用 Separator，改造无连带影响。
- 有 title 时 `className` 接到外层 flex 容器；无 title 时接到 Radix Root（原行为）。

## 7. 验收标准

- 无 title：渲染为 1px 线条，水平/垂直均正常，行为与改造前一致。
- 有 title（left，默认）：标题在左、右侧 flex-1 线条。
- 有 title（center）：标题居中、两侧等长线条。
- vertical + title：忽略 title，渲染为垂直线条。
- 颜色使用设计 Token（`bg-border`）。
- 通过 `npm run build:design` 构建。
