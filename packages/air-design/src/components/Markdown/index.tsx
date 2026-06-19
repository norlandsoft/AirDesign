import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
// - oneLight / oneDark: GitHub 风格（简洁现代）
import {oneDark, oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import './index.css';

import CopyCodeIcon from './Icon_CopyCode';

/**
 * Markdown 显示组件属性接口
 */
interface MarkdownProps {
  /** Markdown 文本内容 */
  content: string;
  /** 是否使用暗色主题（默认 false） */
  darkMode?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 代码复制回调函数，传入代码内容 */
  onCopyCode?: (code: string) => void;
  /** 流式输出中：对未闭合代码围栏做临时闭合，减少解析抖动 */
  streaming?: boolean;
}

/**
 * Markdown 显示组件
 *
 * 功能说明：
 * - 基于 react-markdown 实现的只读 Markdown 文本显示组件
 * - 用于在 AI 对话中显示模型返回的消息
 * - 支持数学公式渲染（LaTeX/MathJax）
 * - 支持代码语法高亮
 * - 支持 Mermaid 图表渲染（使用 rehype-mermaidjs 插件）
 * - 支持 GitHub Flavored Markdown (GFM) 扩展语法
 * - 支持 HTML 语法渲染（使用 rehype-raw 插件）
 *
 * 使用示例：
 * ```tsx
 * <Markdown content="# Hello World\n\n这是一段 **Markdown** 文本" />
 * ```
 *
 * @author ChaiMingXu
 */
/**
 * Mermaid 图表组件
 * 用于客户端渲染 Mermaid 图表
 */
/**
 * 检查 Mermaid 代码是否看起来完整（放宽规则，减少误判为“不完整”）
 * 用于判断流式输出是否已完成；宁可多尝试渲染，也不要因格式过严而拒绝渲染
 */
const isMermaidCodeComplete = (code: string): boolean => {
  const trimmed = code?.trim() || '';
  if (!trimmed || trimmed.length < 6) {
    return false;
  }
  // 任意行含图表类型关键字即认为可能是 mermaid（不要求首行）
  const hasDiagramType = /\b(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph|journey|requirement|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|timeline|sankey-beta|quadrantChart|xyChart|block-beta)\b/i.test(trimmed);
  if (!hasDiagramType) {
    // 无类型声明时：有箭头/括号/较长内容也尝试渲染（AI 可能省略或写错类型）
    const hasContent = trimmed.includes('-->') || trimmed.includes('---') || trimmed.includes('->') || trimmed.includes('[') || trimmed.includes('(') || trimmed.includes('{') || trimmed.length > 40;
    if (!hasContent) return false;
  }
  return true;
};

/**
 * 渲染前规范化 Mermaid 代码，修复常见导致解析失败的问题
 * - 统一换行、去除首尾与行尾空白
 * - 将 AI/编辑器常出的智能引号替换为 ASCII 双引号（subgraph/节点标签用）
 * - 去掉箭头标签后的多余空格，避免节点 id 带前导空格
 */
const normalizeMermaidCode = (code: string): string => {
  let s = code.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.split('\n').map(line => line.trimEnd()).join('\n');
  s = s.replace(/^\n+|\n+$/g, '');
  // 智能引号/弯引号 -> 直引号（Mermaid 只认 ASCII "）
  s = s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"').replace(/[\u2018\u2019\u2032]/g, "'");
  // 箭头标签后的空格会使目标节点 id 带前导空格导致解析异常，去掉：|label| 目标 -> |label|目标
  s = s.replace(/(\|[^|]*\|)\s+/g, '$1');
  return s;
};

const MermaidDiagram: React.FC<{ code: string; darkMode: boolean }> = ({code, darkMode}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string>('');
  const [isRendering, setIsRendering] = useState(true);
  const mermaidInstanceRef = useRef<any>(null);
  const lastRenderedCodeRef = useRef<string>('');
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderMermaid = async () => {
      if (!containerRef.current) return;

      // 验证 code 是否有效
      const trimmedCode = code?.trim() || '';

      // 如果 code 为空或未定义，保持加载状态，不进行渲染
      if (!trimmedCode || trimmedCode.length === 0) {
        setIsRendering(true);
        setError(null);
        setErrorCode('');
        return;
      }

      // 检查代码是否看起来完整（用于流式输出场景）
      const isComplete = isMermaidCodeComplete(trimmedCode);

      // 如果代码不完整，保持加载状态，不进行渲染
      if (!isComplete) {
        setIsRendering(true);
        setError(null);
        setErrorCode('');
        return;
      }

      // 如果代码没有变化，不重复渲染
      if (trimmedCode === lastRenderedCodeRef.current) {
        setIsRendering(false);
        return;
      }

      try {
        setIsRendering(true);
        setError(null);
        setErrorCode('');

        // 清空容器
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // 动态导入 mermaid 库（只在第一次导入）
        if (!mermaidInstanceRef.current) {
          const mermaid = await import('mermaid');
          mermaidInstanceRef.current = mermaid.default || mermaid;
        }

        const mermaidInstance = mermaidInstanceRef.current;

        // 初始化 mermaid：放宽解析，减少因格式过严导致的“图表渲染失败”
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: darkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'var(--font-family-code, monospace)',
          suppressErrorRendering: true,
        });

        const normalizedCode = normalizeMermaidCode(trimmedCode);
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 渲染图表（使用规范化后的代码）
        const {svg, bindFunctions} = await mermaidInstance.render(id, normalizedCode);

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;

          // 绑定交互函数
          if (bindFunctions) {
            bindFunctions(containerRef.current);
          }

          // 记录已渲染的代码
          lastRenderedCodeRef.current = trimmedCode;
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          if (isComplete && trimmedCode.length > 0) {
            console.warn('Mermaid render error (will show code fallback):', err);
            const errorMessage = err?.message || err?.toString() || 'Mermaid 图表渲染失败';
            setError(errorMessage);
            setErrorCode(trimmedCode);
            setIsRendering(false);
          } else {
            setIsRendering(true);
            setError(null);
            setErrorCode('');
          }
        }
      }
    };

    // 清除之前的定时器
    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
    }

    // 使用防抖机制，在代码停止变化一段时间后再进行渲染
    // 这样可以避免在流式输出过程中频繁尝试渲染
    renderTimerRef.current = setTimeout(() => {
      renderMermaid();
    }, 300); // 300ms 防抖，等待代码稳定

    return () => {
      isMounted = false;
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
        renderTimerRef.current = null;
      }
    };
  }, [code, darkMode]);

  if (error) {
    return (
        <div className="markdown-mermaid-error">
          <div className="markdown-mermaid-error-title">⚠️ 图表渲染失败</div>
          <div className="markdown-mermaid-error-message">{error}</div>
          {errorCode && (
              <details className="markdown-mermaid-error-code">
                <summary>显示 Mermaid 代码（可复制到编辑器调试）</summary>
                <pre><code>{errorCode}</code></pre>
              </details>
          )}
        </div>
    );
  }

  return (
      <div className="markdown-mermaid-wrapper">
        {isRendering && (
            <div className="markdown-mermaid-loading">
              <div>正在渲染图表...</div>
            </div>
        )}
        <div
            ref={containerRef}
            className="markdown-mermaid-container"
            style={{display: isRendering ? 'none' : 'block'}}
        />
      </div>
  );
};

/**
 * Think 块组件
 * 用于渲染思考过程内容，支持折叠/展开功能
 *
 * @author ChaiMingXu
 */
interface ThinkBlockProps {
  /** 子元素 */
  children?: React.ReactNode;
}

const ThinkBlock: React.FC<ThinkBlockProps> = ({children}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * 切换折叠/展开状态
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
      <div className="markdown-think-block">
        <div
            className="markdown-think-header"
            onClick={toggleCollapse}
        >
          <span className="markdown-think-label">思考过程</span>
        </div>
        {!isCollapsed && (
            <div className="markdown-think-content">
              {children}
            </div>
        )}
      </div>
  );
};

/**
 * 流式 Markdown 预处理：临时闭合未完成的代码围栏，避免 react-markdown 解析崩溃
 */
const prepareStreamingMarkdown = (content: string): string => {
  if (!content) return content;
  const fenceCount = (content.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    return `${content}\n\`\`\``;
  }
  return content;
};

const Markdown: React.FC<MarkdownProps> = (props) => {
  const {content, darkMode = false, className, onCopyCode, streaming = false} = props;

  /**
   * 预处理内容，将 <think> 和 </think> 标签替换为单独一行的 ::think 标记
   * 这样可以在后续处理中识别和渲染思考块
   */
  const processedContent = useMemo(() => {
    if (!content) return content;
    const source = streaming ? prepareStreamingMarkdown(content) : content;

    let processed = source;
    let hasReplacement = false;

    // 将开始标签 <think> 或 <think> 替换为单独一行的 ::think
    // 使用更宽松的正则表达式匹配，支持各种格式
    // 匹配模式：<think>、<think />、<think type="...">、<think> 等
    const startTagRegex = /<(?:(?:think|redacted_reasoning)[^>]*?)>/gi;
    processed = processed.replace(startTagRegex, () => {
      hasReplacement = true;
      return '\n::think\n';
    });

    // 将结束标签 </think> 或 </think> 替换为单独一行的 ::think
    // 使用更宽松的正则表达式匹配
    const endTagRegex = /<\/(?:(?:think|redacted_reasoning)[^>]*?)>/gi;
    processed = processed.replace(endTagRegex, () => {
      hasReplacement = true;
      return '\n::think\n';
    });

    // 如果进行了替换，清理多余的连续换行符（最多保留两个）
    if (hasReplacement) {
      // 先清理连续的 ::think 标记之间的多余换行
      processed = processed.replace(/\n::think\n\n::think\n/g, '\n::think\n::think\n');
      // 然后清理其他多余的连续换行符（最多保留两个）
      processed = processed.replace(/\n{3,}/g, '\n\n');
    }

    return processed;
  }, [content, streaming]);

  /**
   * 将内容分割为普通内容和思考块
   * 识别 ::think 标记之间的内容作为思考块
   */
  const contentParts = useMemo(() => {
    if (!processedContent) return [{type: 'text', content: ''}];

    const parts: Array<{ type: 'text' | 'think'; content: string }> = [];
    const lines = processedContent.split('\n');
    let currentPart: { type: 'text' | 'think'; content: string } | null = null;
    let inThinkBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // 检查是否是 ::think 标记
      if (trimmedLine === '::think') {
        // 如果当前在思考块中，结束当前思考块
        if (inThinkBlock && currentPart && currentPart.type === 'think') {
          parts.push(currentPart);
          currentPart = null;
          inThinkBlock = false;
        } else {
          // 如果当前有普通文本块，先保存
          if (currentPart && currentPart.type === 'text') {
            parts.push(currentPart);
            currentPart = null;
          }
          // 开始新的思考块
          inThinkBlock = true;
          currentPart = {type: 'think', content: ''};
        }
      } else {
        // 普通内容
        if (!currentPart) {
          currentPart = {type: 'text', content: ''};
        }

        // 添加内容（保留原始换行）
        if (currentPart.content) {
          currentPart.content += '\n' + line;
        } else {
          currentPart.content = line;
        }
      }
    }

    // 添加最后一个块
    if (currentPart) {
      parts.push(currentPart);
    }

    return parts.length > 0 ? parts : [{type: 'text', content: processedContent}];
  }, [processedContent]);

  /**
   * 代码块组件
   * 用于渲染代码块，支持语法高亮
   */
  const CodeBlock = useMemo(() => {
    return ({node, inline, className: codeClassName, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      // 判断是否是行内代码
      // react-markdown 中：
      // - 行内代码：单个反引号包裹，inline 参数为 true，或者父元素不是 'pre'
      // - 代码块：三个反引号包裹，inline 参数为 false 或 undefined，父元素是 'pre'，或者有语言标识
      const parentTagName = node?.parent?.tagName || '';
      const isInlineCode = inline === true ||
          (inline !== false && parentTagName !== 'pre' && !codeClassName);

      // 如果是内联代码
      if (isInlineCode) {
        return (
            <code className="markdown-inline-code" {...props}>
              {children}
            </code>
        );
      }

      // 如果是 mermaid 图表，使用 MermaidDiagram 组件渲染
      if (language === 'mermaid') {
        return <MermaidDiagram code={codeString} darkMode={darkMode}/>;
      }

      // 普通代码块，使用语法高亮
      const hasHeader = language || onCopyCode;
      return (
          <div className={`markdown-code-block ${hasHeader ? 'has-header' : ''}`}>
            {hasHeader && (
                <div className="markdown-code-header">
                  {language && <span className="markdown-code-language">{language}</span>}
                  {onCopyCode && (
                      <div
                          className="markdown-code-copy-button"
                          onClick={() => onCopyCode(codeString)}
                      >
                        <CopyCodeIcon/>
                      </div>
                  )}
                </div>
            )}
            <SyntaxHighlighter
                style={darkMode ? oneDark : oneLight}
                language={language || 'text'}
                PreTag="div"
                customStyle={{
                  backgroundColor: 'transparent',
                  margin: 0,
                }}
                {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
      );
    };
  }, [darkMode, onCopyCode]);

  /**
   * 自定义组件映射
   * 用于自定义 Markdown 元素的渲染方式
   */
  const components = useMemo(() => ({
    code: CodeBlock,
    // 自定义段落样式
    p: ({node, ...props}: any) => <p className="markdown-paragraph" {...props} />,
    // 自定义标题样式
    h1: ({node, ...props}: any) => <h1 className="markdown-heading markdown-h1" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="markdown-heading markdown-h2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="markdown-heading markdown-h3" {...props} />,
    h4: ({node, ...props}: any) => <h4 className="markdown-heading markdown-h4" {...props} />,
    h5: ({node, ...props}: any) => <h5 className="markdown-heading markdown-h5" {...props} />,
    h6: ({node, ...props}: any) => <h6 className="markdown-heading markdown-h6" {...props} />,
    // 自定义列表样式
    ul: ({node, ...props}: any) => <ul className="markdown-list markdown-ul" {...props} />,
    ol: ({node, ...props}: any) => <ol className="markdown-list markdown-ol" {...props} />,
    li: ({node, ...props}: any) => <li className="markdown-list-item" {...props} />,
    // 自定义引用样式
    blockquote: ({node, ...props}: any) => <blockquote className="markdown-blockquote" {...props} />,
    // 自定义表格样式
    table: ({node, ...props}: any) => <table className="markdown-table" {...props} />,
    thead: ({node, ...props}: any) => <thead className="markdown-thead" {...props} />,
    tbody: ({node, ...props}: any) => <tbody className="markdown-tbody" {...props} />,
    tr: ({node, ...props}: any) => <tr className="markdown-tr" {...props} />,
    th: ({node, ...props}: any) => <th className="markdown-th" {...props} />,
    td: ({node, ...props}: any) => <td className="markdown-td" {...props} />,
    // 自定义链接样式
    a: ({node, ...props}: any) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
    // 自定义图片样式
    img: ({node, ...props}: any) => <img className="markdown-image" {...props} />,
    // 自定义水平线样式
    hr: ({node, ...props}: any) => <hr className="markdown-hr" {...props} />,
  }), [CodeBlock]);

  return (
      <div className={`markdown-container ${streaming ? 'markdown-streaming' : ''} ${className || ''}`}>
        {contentParts.map((part, index) => {
          if (part.type === 'think') {
            // 对于思考块，单独渲染并用特殊样式包裹
            return (
                <ThinkBlock key={`think-${index}`}>
                  <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      components={components}
                  >
                    {part.content}
                  </ReactMarkdown>
                </ThinkBlock>
            );
          } else {
            // 普通内容正常渲染
            if (!part.content.trim()) {
              return null;
            }
            return (
                <ReactMarkdown
                    key={`text-${index}`}
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={components}
                >
                  {part.content}
                </ReactMarkdown>
            );
          }
        })}
      </div>
  );
};

export default Markdown;

