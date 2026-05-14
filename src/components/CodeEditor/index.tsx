/**
 * CodeEditor 组件：基于 react-monaco-editor 的代码编辑器
 * 依赖 Monaco Editor，需由前端 webpack 的 monaco-editor-webpack-plugin 配置，故保留在前端
 * Created by ChaiMingXu
 */
import React, {forwardRef, useEffect, useImperativeHandle} from 'react';
import {Spin} from 'antd';
import MonacoEditor from 'react-monaco-editor';
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

  useImperativeHandle(ref, () => ({
    getContent: () => content,
  }));

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
    });
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
      resizeObserver.disconnect();
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
        <Spin spinning={loading}>
          <MonacoEditor
              width={width}
              height={height}
              language={language}
              theme="vs"
              value={content}
              options={{
                language: language,
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
        </Spin>
      </div>
  );
});

export default CodeEditor;
