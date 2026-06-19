/**
 * RichEditor 富文本编辑器 Demo（TipTap）
 *
 * 展示编辑模式与只读预览模式：可编辑、获取 Markdown / HTML、切换标题、只读预览。
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React, {useRef, useState} from 'react'
import {RichEditor, Button} from 'air-design'
import type {RichEditorRef} from 'air-design'
import PageContainer from '../components/PageContainer'

const INITIAL_MARKDOWN = `# 富文本编辑器示例

支持 **加粗**、*斜体*、~~删除线~~、\`行内代码\` 等格式。

## 列表
- 无序列表项一
- 无序列表项二

1. 有序列表一
2. 有序列点二

## 任务列表
- [x] 已完成任务
- [ ] 待办任务

## 引用
> 这是一段引用文字。

## 代码块
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 表格
| 组件 | 说明 |
|------|------|
| Button | 按钮 |
| Table | 表格 |
`

const RichEditorPage: React.FC = () => {
  const editorRef = useRef<RichEditorRef>(null)
  const [editable, setEditable] = useState(true)
  const [simpleMode, setSimpleMode] = useState(false)
  const [output, setOutput] = useState('')

  const toggleEditable = () => {
    const next = !editable
    setEditable(next)
    editorRef.current?.setEditable(next)
  }

  return (
    <PageContainer title="RichEditor 富文本编辑器" description="基于 TipTap，支持标题/加粗/斜体/列表/任务/引用/代码块/表格等。可切换编辑与只读预览。">
      <div className="demo-block">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" type={editable ? 'primary' : 'default'} onClick={toggleEditable}>
            {editable ? '编辑模式' : '只读模式'}
          </Button>
          <Button size="sm" type={simpleMode ? 'primary' : 'default'} onClick={() => setSimpleMode((s) => !s)}>
            {simpleMode ? '精简模式' : '完整模式'}
          </Button>
          <Button size="sm" onClick={() => setOutput(editorRef.current?.getMarkdown() ?? '')}>获取 Markdown</Button>
          <Button size="sm" onClick={() => setOutput(editorRef.current?.getHtmlContent() ?? '')}>获取 HTML</Button>
          <Button size="sm" onClick={() => editorRef.current?.setTitle('新标题 ' + Date.now().toString().slice(-4))}>设置标题</Button>
        </div>
      </div>

      <div className="demo-block">
        <RichEditor
          ref={editorRef}
          title="示例文档"
          content={INITIAL_MARKDOWN}
          height={520}
          bordered
          hasTitle
          showUndo
          simpleMode={simpleMode}
          onChange={() => {}}
        />
      </div>

      {output && (
        <div className="demo-block">
          <h3 className="demo-section-title">输出</h3>
          <pre className="demo-code" style={{maxHeight: 240}}>{output}</pre>
        </div>
      )}
    </PageContainer>
  )
}

export default RichEditorPage
