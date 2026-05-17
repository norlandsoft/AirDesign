/**
 * CodeEditor 组件：基于 @monaco-editor/react 的代码编辑器
 *
 * 使用官方 Monaco Editor React 包装器，内置 CDN 加载，
 * 语法高亮开箱即用，消费端无需配置 webpack/vite 插件。
 * 默认从 jsDelivr CDN 加载 Monaco Editor 及语言 Worker。
 *
 * @author ChaiMingXu, on 2026/05/17
 */
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import MonacoEditor from '@monaco-editor/react';
import './index.less';

export interface CodeEditorRef {
  getContent: () => string;
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
  } = props;

  const editorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getValue() ?? content,
  }));

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message.toString().includes('ResizeObserver')) {
        return true;
      }
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };
    return () => {
      window.onerror = originalError;
    };
  }, []);

  return (
      <div
          className={'air-code-editor'}
          style={{
            border: border ? '1px solid var(--color-300)' : 'none',
            borderRadius: border ? 3 : 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
      >
        {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)', zIndex: 10,
            }}>
              <div className="air-loading-panel-content">加载中...</div>
            </div>
        )}
        <MonacoEditor
            width={width}
            height={height}
            language={language}
            theme="light"
            value={content}
            onMount={handleEditorMount}
            loading={<div className="air-loading-panel-content">加载编辑器...</div>}
            options={{
              readOnly: readOnly,
              wordWrap: wordWrap,
              automaticLayout: true,
              selectOnLineNumbers: false,
              renderLineHighlight: 'all',
              minimap: {enabled: false},
              unicodeHighlight: {ambiguousCharacters: false},
              colorDecorators: false,
              fontSize: 14,
              fontWeight: 'normal',
              fontFamily: 'var(--font-family-code)',
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
            onChange={onChange ? onChange : undefined}
        />
      </div>
  );
});

export default CodeEditor;
