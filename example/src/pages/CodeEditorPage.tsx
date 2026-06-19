/**
 * CodeEditor 代码编辑器 Demo（Monaco）
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React, {useRef, useState} from 'react'
import {CodeEditor, Button} from 'air-design'
import type {CodeEditorRef} from 'air-design'
import PageContainer from '../components/PageContainer'

const SAMPLES: Record<string, string> = {
  typescript: `// TypeScript 示例
interface User {
  id: number
  name: string
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`
}

const u: User = {id: 1, name: 'AirDesign'}
console.log(greet(u))`,
  json: `{
  "name": "air-design",
  "version": "2.0.0",
  "description": "企业级 React 组件库",
  "dependencies": {
    "react": "^18.3.1",
    "zustand": "^5.0.0"
  }
}`,
  python: `# Python 示例
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))`,
  sql: `-- SQL 示例
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;`,
}

const LANGS = ['typescript', 'json', 'python', 'sql']

const CodeEditorPage: React.FC = () => {
  const [lang, setLang] = useState('typescript')
  const [readOnly, setReadOnly] = useState(false)
  const [content, setContent] = useState(SAMPLES.typescript)
  const editorRef = useRef<CodeEditorRef>(null)

  const switchLang = (l: string) => {
    setLang(l)
    setContent(SAMPLES[l])
  }

  return (
    <PageContainer title="CodeEditor 代码编辑器" description="基于 Monaco Editor，支持多语言语法高亮、只读、行号、自动换行。">
      <div className="demo-block">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">语言</span>
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`rounded px-3 py-1 text-sm ${lang === l ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReadOnly((r) => !r)}
              className={`rounded px-3 py-1 text-sm ${readOnly ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'}`}
            >
              只读：{readOnly ? '开' : '关'}
            </button>
          </div>
          <Button size="sm" onClick={() => alert(editorRef.current?.getContent())}>获取内容</Button>
        </div>
      </div>

      <div className="demo-block">
        <CodeEditor
          ref={editorRef}
          width="100%"
          height={460}
          language={lang}
          content={content}
          readOnly={readOnly}
          onChange={(v: string) => setContent(v ?? '')}
        />
      </div>
    </PageContainer>
  )
}

export default CodeEditorPage
