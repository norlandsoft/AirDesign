/**
 * Claude Code 内容分段器（纯函数）
 *
 * 将 assistant 消息正文按 Claude Code 标签切分为有序片段，供 ChatView 分别渲染：
 * - <system-reminder>...</system-reminder>           -> system-reminder
 * - <task-notification ...>...</task-notification>   -> task-notification（可带属性）
 * - <tool_use name="X">{json}</tool_use>             -> tool-use
 * - <tool_result>...</tool_result>                   -> tool-result
 * 其余文本 -> markdown（其中 <think>/<antThinking> 仍由 Markdown 组件处理）
 *
 * 流式（streaming=true）时，未闭合的开始标签视为普通文本，待闭合后再分段，
 * 避免解析抖动（与 Markdown 围栏修复同思路）。标签不做嵌套假设，采用非贪婪匹配。
 *
 * 设计思路：纯函数、零副作用、可独立验证；仅扫描 '<' 处尝试匹配，其余字符直接累加。
 *
 * @author ChaiMingXu, 2026/06/29
 */

/** 内容片段类型 */
export type ClaudeSegment =
  | { type: 'markdown'; content: string }
  | { type: 'system-reminder'; content: string }
  | { type: 'task-notification'; content: string; attrs: Record<string, string> }
  | { type: 'tool-use'; name?: string; raw: string }
  | { type: 'tool-result'; raw: string }

/** 需要提取的结构化标签配置：open 为开始标签前缀，close 为结束标签 */
const TAG_SPECS = [
  { segType: 'system-reminder', open: '<system-reminder>', close: '</system-reminder>' },
  { segType: 'task-notification', open: '<task-notification', close: '</task-notification>' },
  { segType: 'tool-use', open: '<tool_use', close: '</tool_use>' },
  { segType: 'tool-result', open: '<tool_result>', close: '</tool_result>' },
] as const

/** 解析属性字符串中的 k="v" 对 */
function parseAttrs(text: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z_][\w-]*)\s*=\s*"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

/**
 * 在 pos 处尝试匹配开始标签
 * - open 以 '>' 结尾：要求精确前缀匹配，无属性
 * - open 不以 '>' 结尾（带属性）：找到下一个 '>'，解析其间的属性
 * 返回 null 表示此处不是该标签的有效开始（含流式中未写完 '>' 的情况）
 */
function matchOpenTag(
  text: string,
  pos: number,
  open: string,
): { attrs: Record<string, string>; contentStart: number } | null {
  if (!text.startsWith(open, pos)) return null
  if (open.endsWith('>')) {
    return { attrs: {}, contentStart: pos + open.length }
  }
  // 带属性：找到 '>' 结束
  const gt = text.indexOf('>', pos + open.length)
  if (gt === -1) return null
  const attrText = text.slice(pos + open.length, gt)
  return { attrs: parseAttrs(attrText), contentStart: gt + 1 }
}

/**
 * 将内容切分为有序片段
 * @param content 原始正文
 * @param opts.streaming 是否流式（影响未闭合标签处理；当前实现已统一按普通文本处理）
 */
export function segmentClaudeContent(
  content: string,
  opts: { streaming?: boolean } = {},
): ClaudeSegment[] {
  const { streaming = false } = opts
  if (!content) return [{ type: 'markdown', content: '' }]

  const segments: ClaudeSegment[] = []
  const n = content.length
  let i = 0
  let textBuf = ''

  /** 把暂存的普通文本冲刷为一个 markdown 片段 */
  const flushText = () => {
    if (textBuf) {
      segments.push({ type: 'markdown', content: textBuf })
      textBuf = ''
    }
  }

  while (i < n) {
    if (content[i] === '<') {
      let matched = false
      for (const spec of TAG_SPECS) {
        const openInfo = matchOpenTag(content, i, spec.open)
        if (!openInfo) continue
        const closeIdx = content.indexOf(spec.close, openInfo.contentStart)
        if (closeIdx === -1) continue // 未闭合（流式中）：交给后续作为普通文本
        flushText()
        const inner = content.slice(openInfo.contentStart, closeIdx)
        switch (spec.segType) {
          case 'system-reminder':
            segments.push({ type: 'system-reminder', content: inner })
            break
          case 'task-notification':
            segments.push({ type: 'task-notification', content: inner, attrs: openInfo.attrs })
            break
          case 'tool-use':
            segments.push({ type: 'tool-use', name: openInfo.attrs.name, raw: inner })
            break
          case 'tool-result':
            segments.push({ type: 'tool-result', raw: inner })
            break
        }
        i = closeIdx + spec.close.length
        matched = true
        break
      }
      if (matched) continue
    }
    textBuf += content[i]
    i++
  }
  flushText()

  // streaming 当前仅作文档约定：未闭合标签已被当作普通文本处理
  void streaming

  return segments.length > 0 ? segments : [{ type: 'markdown', content: '' }]
}
