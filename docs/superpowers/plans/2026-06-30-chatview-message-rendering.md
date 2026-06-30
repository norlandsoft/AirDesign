# ChatView 消息渲染重构 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 ChatView 消息渲染——thinking 抽为独立折叠片段（修复 `<antThinking>` 不识别）、工具调用输入与输出相邻配对合并为同一折叠块、统一渲染管线不区分消息来源。

**Architecture:** 分段器 `segmentClaudeContent` 新增 thinking 标签识别产出原子片段；新增纯函数 `pairToolCalls` 将相邻 `tool-use`+`tool-result` 合并为 `tool-call` 渲染片段；`TagBlock` 新增 `ThinkingBlock`/`ToolCallBlock`；`index.tsx` 接入新管线。`ChatMessage` 无字段变更，API 兼容。

**Tech Stack:** React 18 + TypeScript、Vite 库模式（air-design）、普通 CSS + 设计 Token。

**验证策略（遵循 CLAUDE.md 规则6，不保留测试代码）：** 项目无测试框架。每个 TS 任务以 `npm run build:design`（vite build，含 tsc 类型检查）作为编译验证；最终以 `npm run dev:example` 启动演示页人工核验渲染效果。纯函数（thinking 切分、工具配对）的正确性通过演示页样本覆盖各场景验证。

**对应 spec：** `docs/superpowers/specs/2026-06-29-chat-components-design.md` 第 10 章。

---

## 文件结构

| 文件 | 职责 | 本次改动 |
|---|---|---|
| `packages/air-design/src/components/ChatView/claudeSegments.ts` | 纯函数分段器 + 工具配对 | 新增 thinking 片段识别、`RenderSegment` 类型、`pairToolCalls` 函数 |
| `packages/air-design/src/components/ChatView/TagBlock.tsx` | 标签折叠块渲染器 | 新增 `ThinkingBlock`、`ToolCallBlock`；旧 `ToolUseBlock`/`ToolResultBlock` 标记 `@deprecated` |
| `packages/air-design/src/components/ChatView/index.tsx` | ChatView 主体 | `renderContent` 接入配对；`renderSegment` 新增分支 |
| `packages/air-design/src/components/ChatView/index.css` | 样式 | 新增 thinking 色调、工具小节、运行中徽标样式 |
| `example/src/pages/ChatPage.tsx` | 演示页 | 补充覆盖 antThinking + 工具合并的样本 |

---

## Task 1: 分段器新增 thinking 片段识别

**Files:**
- Modify: `packages/air-design/src/components/ChatView/claudeSegments.ts`

- [ ] **Step 1: 更新文件头注释中关于 think 的描述**

把第 9 行注释由"其余文本 -> markdown（其中 `<think>`/`<antThinking>` 仍由 Markdown 组件处理）"改为说明 thinking 现已由分段器切为独立片段：

```
 * - <think>...</think> / <antThinking> / <thinking> / <redacted_reasoning>
 *   -> thinking（独立思考片段，交专用 ThinkingBlock 渲染）
 * 其余文本 -> markdown
```

- [ ] **Step 2: 在 ClaudeSegment 类型新增 thinking**

将类型定义（约第 20-25 行）改为：

```ts
/** 内容片段类型 */
export type ClaudeSegment =
  | { type: 'markdown'; content: string }
  | { type: 'thinking'; content: string }
  | { type: 'system-reminder'; content: string }
  | { type: 'task-notification'; content: string; attrs: Record<string, string> }
  | { type: 'tool-use'; name?: string; raw: string }
  | { type: 'tool-result'; raw: string }
```

- [ ] **Step 3: 在 TAG_SPECS 加入 thinking 标签（长前缀优先）**

将 TAG_SPECS（约第 28-33 行）改为：

```ts
/**
 * 需要提取的结构化标签配置：open 为开始标签前缀，close 为结束标签
 * thinking 标签按长前缀优先排列，避免 <think 与 <thinking/<antThinking 冲突
 * （短前缀即便先命中，也会因 close 找不到而 continue 兜底，但长前缀优先更清晰）
 */
const TAG_SPECS = [
  { segType: 'thinking', open: '<antThinking', close: '</antThinking>' },
  { segType: 'thinking', open: '<thinking', close: '</thinking>' },
  { segType: 'thinking', open: '<think', close: '</think>' },
  { segType: 'thinking', open: '<redacted_reasoning', close: '</redacted_reasoning>' },
  { segType: 'system-reminder', open: '<system-reminder>', close: '</system-reminder>' },
  { segType: 'task-notification', open: '<task-notification', close: '</task-notification>' },
  { segType: 'tool-use', open: '<tool_use', close: '</tool_use>' },
  { segType: 'tool-result', open: '<tool_result>', close: '</tool_result>' },
] as const
```

- [ ] **Step 4: 在 switch 中处理 thinking**

在 segmentClaudeContent 的 switch（约第 103-116 行）的 `case 'system-reminder'` 之前插入：

```ts
          case 'thinking':
            segments.push({type: 'thinking', content: inner})
            break
```

- [ ] **Step 5: 构建验证（类型检查）**

Run: `npm run build:design`
Expected: 构建成功，无 TS 报错。

- [ ] **Step 6: 提交**

```bash
git add packages/air-design/src/components/ChatView/claudeSegments.ts
git commit -m "feat(air-design): 分段器识别 thinking 标签为独立片段"
```

---

## Task 2: 分段器新增 pairToolCalls 配对函数

**Files:**
- Modify: `packages/air-design/src/components/ChatView/claudeSegments.ts`

- [ ] **Step 1: 在文件末尾追加 RenderSegment 类型与 pairToolCalls 函数**

```ts
/**
 * 配对后的渲染片段
 * 设计思路：tool-use 与 tool-result 合并为同一 tool-call 片段（input/output 集中展示）；
 * 其余原子片段原样保留，由调用方按类型分发渲染。
 */
export type RenderSegment =
  | { type: 'markdown'; content: string }
  | { type: 'thinking'; content: string }
  | { type: 'system-reminder'; content: string }
  | { type: 'task-notification'; content: string; attrs: Record<string, string> }
  | { type: 'tool-call'; name?: string; input?: string; output?: string }

/**
 * 将原子片段中的 tool-use 与紧随其后的 tool-result 合并为同一 tool-call 片段
 * 配对规则（相邻配对，因 tool_result 不带 id，只能按出现顺序）：
 * - tool-use 后紧跟 tool-result：合并 {input, output}，跳过下一段
 * - tool-use 后非 tool-result：tool-call {input}（流式中尚未出结果）
 * - 落单 tool-result（前面无 use）：tool-call {output}
 * - 其余片段原样保留，中间穿插的 markdown 原位渲染
 * @param segs segmentClaudeContent 产出的原子片段
 */
export function pairToolCalls(segs: ClaudeSegment[]): RenderSegment[] {
  const out: RenderSegment[] = []
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    if (s.type === 'tool-use') {
      const next = segs[i + 1]
      if (next && next.type === 'tool-result') {
        out.push({type: 'tool-call', name: s.name, input: s.raw, output: next.raw})
        i++
      } else {
        out.push({type: 'tool-call', name: s.name, input: s.raw})
      }
    } else if (s.type === 'tool-result') {
      out.push({type: 'tool-call', output: s.raw})
    } else if (s.type === 'markdown') {
      out.push({type: 'markdown', content: s.content})
    } else if (s.type === 'thinking') {
      out.push({type: 'thinking', content: s.content})
    } else if (s.type === 'system-reminder') {
      out.push({type: 'system-reminder', content: s.content})
    } else if (s.type === 'task-notification') {
      out.push({type: 'task-notification', content: s.content, attrs: s.attrs})
    }
  }
  return out
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build:design`
Expected: 构建成功（此时 pairToolCalls 尚未被引用，但导出存在，不报错）。

- [ ] **Step 3: 提交**

```bash
git add packages/air-design/src/components/ChatView/claudeSegments.ts
git commit -m "feat(air-design): 新增工具调用与结果相邻配对函数 pairToolCalls"
```

---

## Task 3: TagBlock 新增 ThinkingBlock 与 ToolCallBlock

**Files:**
- Modify: `packages/air-design/src/components/ChatView/TagBlock.tsx`

- [ ] **Step 1: 顶部新增 Markdown 导入**

在第 18 行 `import {cn} from '@/lib/cn'` 之后新增：

```ts
import Markdown from '@/components/Markdown'
```

- [ ] **Step 2: Tone 类型新增 thinking**

将 `type Tone = 'info' | 'tool' | 'success'`（约第 44 行）改为：

```ts
/** 色调：info=系统提醒/任务通知，tool=工具调用，success=工具结果，thinking=思考过程 */
type Tone = 'info' | 'tool' | 'success' | 'thinking'
```

- [ ] **Step 3: CollapsibleBlock 支持 badgeClassName**

将 CollapsibleBlockProps（约第 46-53 行）改为：

```ts
interface CollapsibleBlockProps {
  icon: string
  title: string
  badge?: string
  /** 徽标额外类名（用于运行中等特殊配色） */
  badgeClassName?: string
  defaultOpen?: boolean
  tone?: Tone
  children: React.ReactNode
}
```

将 CollapsibleBlock 的入参与徽标渲染（约第 56-78 行）改为：

```ts
const CollapsibleBlock: React.FC<CollapsibleBlockProps> = ({
  icon,
  title,
  badge,
  badgeClassName,
  defaultOpen = false,
  tone = 'info',
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('chat-tag-block', `chat-tag-${tone}`)}>
      <div className="chat-tag-header" onClick={() => setOpen((o) => !o)}>
        <span className="chat-tag-toggle">{open ? '▼' : '▶'}</span>
        <span className="chat-tag-icon">
          <Icon name={icon} size={14}/>
        </span>
        <span className="chat-tag-title">{title}</span>
        {badge && <span className={cn('chat-tag-badge', badgeClassName)}>{badge}</span>}
      </div>
      {open && <div className="chat-tag-body">{children}</div>}
    </div>
  )
}
```

- [ ] **Step 4: 新增 formatToolInput 工具函数**

在 `getToolIcon` 与 `safeJsonParse` 之后（约第 42 行后）新增：

```ts
/**
 * 格式化工具调用输入：解析 raw(json)，取 arguments/args/parameters 美化为可读文本
 * 解析失败或无参数时返回空串
 */
function formatToolInput(raw?: string): string {
  if (!raw) return ''
  const data = safeJsonParse(raw)
  const args =
    data?.arguments ?? data?.args ?? data?.parameters ?? (typeof data === 'object' ? data : null)
  if (typeof args === 'string') return args
  if (args == null) return ''
  return JSON.stringify(args, null, 2)
}
```

- [ ] **Step 5: 新增 ThinkingBlock（置于 SystemReminderBlock 之前）**

```ts
/** 思考过程块：折叠展示模型/智能体的 thinking 内容，默认收起，琥珀色调 */
export const ThinkingBlock: React.FC<{ content: string }> = ({content}) => (
  <CollapsibleBlock icon="insight" title="思考过程" tone="thinking">
    <div className="chat-tag-md">
      <Markdown content={content} />
    </div>
  </CollapsibleBlock>
)
```

- [ ] **Step 6: 新增 ToolCallBlock（置于 ToolResultBlock 之后）**

```ts
/**
 * 工具调用合并块：输入参数与输出结果集中展示于同一折叠块
 * - 有 input 无 output：流式中尚未返回结果，标题加"运行中"琥珀徽标
 * - 工具名缺失时标题回退为"工具调用"
 */
export const ToolCallBlock: React.FC<{
  name?: string
  input?: string
  output?: string
}> = ({name, input, output}) => {
  const toolName = name || '工具调用'
  const running = input !== undefined && output === undefined
  return (
    <CollapsibleBlock
      icon={getToolIcon(toolName)}
      title={toolName}
      badge={running ? '运行中' : undefined}
      badgeClassName={running ? 'chat-tool-badge-running' : undefined}
      tone="tool"
    >
      {input !== undefined && (
        <div className="chat-tool-section">
          <div className="chat-tool-section-title">输入参数</div>
          <pre className="chat-tag-code">{formatToolInput(input)}</pre>
        </div>
      )}
      {output !== undefined && (
        <div className="chat-tool-section">
          <div className="chat-tool-section-title">输出结果</div>
          <pre className="chat-tag-code">{output}</pre>
        </div>
      )}
    </CollapsibleBlock>
  )
}
```

- [ ] **Step 7: 为 ToolUseBlock / ToolResultBlock 添加 @deprecated JSDoc**

在 ToolUseBlock 的 `export const ToolUseBlock` 上方注释中追加废弃说明：

```ts
/**
 * 工具调用块：接受内联 raw(json) 或已解析 obj
 * @deprecated 已被 ToolCallBlock 取代。工具调用与结果由分段器 pairToolCalls
 * 配对后交 ToolCallBlock 合并渲染。保留以兼容潜在旧数据，后续将移除。
 */
export const ToolUseBlock: React.FC<{ name?: string; raw?: string; obj?: any }> = ({
```

在 ToolResultBlock 的 `export const ToolResultBlock` 上方注释中追加：

```ts
/**
 * 工具结果块
 * @deprecated 已被 ToolCallBlock 取代。工具结果现与对应工具调用合并展示。
 */
export const ToolResultBlock: React.FC<{ raw: string }> = ({raw}) => (
```

- [ ] **Step 8: 构建验证**

Run: `npm run build:design`
Expected: 构建成功。

- [ ] **Step 9: 提交**

```bash
git add packages/air-design/src/components/ChatView/TagBlock.tsx
git commit -m "feat(air-design): 新增 ThinkingBlock 与工具调用合并块 ToolCallBlock"
```

---

## Task 4: ChatView 主体接入新渲染管线

**Files:**
- Modify: `packages/air-design/src/components/ChatView/index.tsx`

- [ ] **Step 1: 调整 claudeSegments 导入**

将第 22 行导入改为（移除未用的 ClaudeSegment，新增 pairToolCalls 与 RenderSegment）：

```ts
import {segmentClaudeContent, pairToolCalls, type RenderSegment} from './claudeSegments'
```

- [ ] **Step 2: 调整 TagBlock 导入**

将第 23-28 行导入改为（移除 ToolUseBlock/ToolResultBlock，新增 ThinkingBlock/ToolCallBlock）：

```ts
import {
  SystemReminderBlock,
  TaskNotificationBlock,
  ThinkingBlock,
  ToolCallBlock,
} from './TagBlock'
```

- [ ] **Step 3: 重写 renderSegment，入参改为 RenderSegment**

将 renderSegment（约第 122-137 行）整体替换为：

```ts
/** 渲染单个片段（配对后的渲染片段） */
function renderSegment(seg: RenderSegment, key: number, streaming: boolean) {
  switch (seg.type) {
    case 'markdown':
      return <Markdown key={key} content={seg.content} streaming={streaming} onCopyCode={copyToClipboard} />
    case 'thinking':
      return <ThinkingBlock key={key} content={seg.content} />
    case 'system-reminder':
      return <SystemReminderBlock key={key} content={seg.content} />
    case 'task-notification':
      return <TaskNotificationBlock key={key} content={seg.content} attrs={seg.attrs} />
    case 'tool-call':
      return <ToolCallBlock key={key} name={seg.name} input={seg.input} output={seg.output} />
    default:
      return null
  }
}
```

- [ ] **Step 4: renderContent 接入配对**

将 renderContent（约第 140-150 行）整体替换为：

```ts
/** 正文先分段再配对工具调用，逐段渲染；纯空内容返回 null */
function renderContent(content: string, streaming: boolean) {
  const atomics = segmentClaudeContent(content, {streaming})
  const segments = pairToolCalls(atomics)
  if (
    segments.length === 1 &&
    segments[0].type === 'markdown' &&
    !segments[0].content.trim()
  ) {
    return null
  }
  return segments.map((seg, idx) => renderSegment(seg, idx, streaming))
}
```

- [ ] **Step 5: 构建验证**

Run: `npm run build:design`
Expected: 构建成功。若提示 ToolUseBlock/ToolResultBlock 未使用之类，确认已在 Step 2 移除其导入。

- [ ] **Step 6: 提交**

```bash
git add packages/air-design/src/components/ChatView/index.tsx
git commit -m "feat(air-design): ChatView 接入 thinking 片段与工具调用合并渲染"
```

---

## Task 5: 新增 thinking 与工具小节样式

**Files:**
- Modify: `packages/air-design/src/components/ChatView/index.css`

- [ ] **Step 1: 新增 thinking 色调**

在 `.chat-tag-block.chat-tag-success` 规则（约第 154-156 行）之后追加：

```css
.chat-tag-block.chat-tag-thinking {
  border-left: 0.1875rem solid #d5924a;
}
```

- [ ] **Step 2: 新增工具调用合并块的输入/输出小节样式**

在 `.chat-tag-code` 规则（约第 201-211 行）之后追加：

```css
/* 工具调用合并块：输入/输出小节 */
.chat-tool-section {
  margin: 0;
}
.chat-tool-section + .chat-tool-section {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 0.0625rem solid var(--color-border);
}
.chat-tool-section-title {
  font-size: var(--font-size-caption);
  color: var(--color-muted-foreground);
  margin-bottom: 0.25rem;
  user-select: none;
}
/* 思考内容容器：与正文一致的行距 */
.chat-tag-md {
  line-height: 1.6;
  color: var(--color-foreground);
}
/* 运行中徽标：琥珀配色，呼应 thinking 色调 */
.chat-tool-badge-running {
  color: #b9741a;
  background: rgba(213, 146, 74, 0.12);
}
```

- [ ] **Step 3: 构建验证**

Run: `npm run build:design`
Expected: 构建成功（CSS 改动不影响类型，仅确认无构建错误）。

- [ ] **Step 4: 提交**

```bash
git add packages/air-design/src/components/ChatView/index.css
git commit -m "style(air-design): 新增 thinking 色调与工具调用合并块小节样式"
```

---

## Task 6: 演示页补充覆盖新场景的样本

**Files:**
- Modify: `example/src/pages/ChatPage.tsx`

- [ ] **Step 1: 在 SAMPLE_REPLIES 末尾追加智能体场景样本**

在 SAMPLE_REPLIES 数组（约第 15-45 行）的第二个元素之后、数组闭合 `]` 之前，追加第三个元素：

```ts
  `<antThinking>用户想看智能体的工具调用流程。我先调用 Bash 查看当前目录，再把输入和结果合并在同一个折叠块里展示。</antThinking>

我来执行一次工具调用：

<tool_use name="Bash">{"command":"pwd","description":"查看当前工作目录"}</tool_use>

<tool_result>/opt/AirDesign</tool_result>

当前工作目录是 \`/opt/AirDesign\`。可以看到工具调用的**输入参数**与**输出结果**已合并在同一个折叠块中。`,
```

- [ ] **Step 2: 构建验证**

Run: `npm run build:design`
Expected: 构建成功（example 不在 air-design 构建范围内，此步仅确认未破坏库构建）。

- [ ] **Step 3: 演示页人工核验**

Run: `npm run dev:example`
打开浏览器访问 Chat 演示页，连续发送多条消息触发样本轮播，核验：
- 样本 1 的 `<think>` → 琥珀色"思考过程"折叠块（默认收起，展开可见内容）。
- 新样本的 `<antThinking>` → 同样渲染为"思考过程"折叠块（修复点：原实现不显示）。
- 样本 0 与新样本的工具调用 → 输入参数与输出结果在同一折叠块内、分两小节；标题为工具名（Bash）。
- 工具块为蓝紫色调，thinking 为琥珀色调，二者可区分。
- 中间穿插的正文（"我来执行一次工具调用"等）原位渲染。

Expected: 上述效果均符合预期。核验后关闭 dev server。

- [ ] **Step 4: 提交**

```bash
git add example/src/pages/ChatPage.tsx
git commit -m "docs(example): Chat 演示页补充 antThinking 与工具合并渲染样本"
```

---

## Task 7: 最终全量构建验证

**Files:** 无（仅验证）

- [ ] **Step 1: 全量构建**

Run: `npm run build:design`
Expected: 构建成功，产物正常输出到 `packages/air-design/dist`。

- [ ] **Step 2: 确认 dist 类型声明同步更新（可选抽查）**

Run: `grep -l "pairToolCalls\|ThinkingBlock\|ToolCallBlock" packages/air-design/dist/*.d.ts packages/air-design/dist/**/*.d.ts 2>/dev/null`
Expected: 能在 dist 的 `.d.ts` 中找到新增导出（确认对外类型已生成）。

---

## Self-Review 结果

- **Spec 覆盖**：spec 10.4（thinking 切分）→ Task 1；10.4/10.5（pairToolCalls/RenderSegment）→ Task 2；10.6（ThinkingBlock/ToolCallBlock/废弃旧块）→ Task 3；10.7（主体接入）→ Task 4；10.8（样式）→ Task 5；演示验证 → Task 6。全覆盖。
- **占位符扫描**：无 TBD/TODO，每步均含完整代码或精确命令。
- **类型一致性**：`RenderSegment`（Task 2 定义）的 `tool-call.input/output` 与 `ToolCallBlock` 入参（Task 3）、`renderSegment` 的 `seg.input/output`（Task 4）一致；`ThinkingBlock content`、`pairToolCalls` 返回类型贯穿一致；`badgeClassName` 在 CollapsibleBlock（Task 3 Step 3）定义并被 ToolCallBlock（Task 3 Step 6）使用。
