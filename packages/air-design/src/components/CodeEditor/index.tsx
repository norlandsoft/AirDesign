/**
 * CodeEditor 组件：基于 @monaco-editor/react 的代码编辑器
 *
 * 使用官方 Monaco Editor React 包装器，内置 CDN 加载，语法高亮开箱即用。
 * 样式改为 Tailwind（外壳边框 + 加载遮罩）。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react'
import MonacoEditor from '@monaco-editor/react'

export interface CodeEditorRef {
  getContent: () => string
}

const CodeEditor = forwardRef<CodeEditorRef, any>((props, ref) => {
  const {
    loading = false,
    width = 800,
    height = 600,
    language = 'markdown',
    autoHighlight = false,
    content = '',
    onChange,
    border = true,
    lineNumbers = true,
    readOnly = false,
    wordWrap = 'on',
  } = props

  const editorRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getValue() ?? content,
  }))

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    // 自定义主题：选中行淡蓝背景无边框，行号区右侧 1px 分隔线
    monaco.editor.defineTheme('air-design-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        // 选中行：淡蓝背景，无边框
        'editor.lineHighlightBackground': '#e8f0fe',
        'editor.lineHighlightBorder': '#00000000',
        // 行号区背景与右侧 1px 分隔线
        'editorLineNumber.foreground': '#999999',
        'editorLineNumber.activeForeground': '#333333',
        'editorGutter.background': '#fafafa',
        'editorGutter.border': '#e5e7eb',
      },
    })
    monaco.editor.setTheme('air-design-light')
  }

  // 抑制 Monaco 的 ResizeObserver loop 警告
  useEffect(() => {
    const originalError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (message.toString().includes('ResizeObserver')) return true
      if (originalError) return originalError(message, source, lineno, colno, error)
      return false
    }
    return () => {
      window.onerror = originalError
    }
  }, [])

  return (
    <div
      className={`overflow-hidden ${border ? 'rounded border border-border' : ''}`}
      style={{boxSizing: 'border-box'}}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      )}
      <MonacoEditor
        width={width}
        height={height}
        language={language}
        theme="light"
        value={content}
        onMount={handleEditorMount}
        loading={<div className="text-sm text-muted-foreground">加载编辑器...</div>}
        options={{
          readOnly,
          wordWrap,
          automaticLayout: true,
          selectOnLineNumbers: false,
          renderLineHighlight: 'all',
          minimap: {enabled: false},
          unicodeHighlight: {ambiguousCharacters: false},
          colorDecorators: false,
          fontSize: 14,
          fontWeight: 'normal',
          fontFamily: 'var(--font-mono)',
          tabSize: 2,
          occurrencesHighlight: autoHighlight,
          lineNumbers: lineNumbers ? 'on' : 'off',
          lineDecorationsWidth: lineNumbers ? 18 : 2,
          lineNumbersMinChars: 6,
          folding: false,
          lineHeight: 24,
          scrollBeyondLastLine: false,
          quickSuggestions: false,
          parameterHints: {enabled: false},
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
        }}
        onChange={onChange ?? undefined}
      />
    </div>
  )
})

export default CodeEditor
