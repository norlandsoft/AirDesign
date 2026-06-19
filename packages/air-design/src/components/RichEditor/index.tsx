/**
 * RichEditor 富文本编辑器组件
 *
 * 基于 TipTap 封装，支持固定高度与自动增高两种布局模式：
 * - fixedHeight 或显式传入 height：整体高度固定，内容区内部滚动
 * - 未设置 height 且非 fixedHeight：编辑区随内容自动增高；若同时传入 maxHeight 且处于编辑态，增高上限为 maxHeight 并显示垂直滚动条
 *
 * @author ChaiMingXu
 * @date 2026/06/09
 */

import React, {forwardRef, useEffect, useImperativeHandle} from 'react';

import {Editor, EditorProvider} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {TextStyle} from '@tiptap/extension-text-style';
import {TextAlign} from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline'
import {Markdown} from '@tiptap/markdown'
import {Indent} from './extensions/extension-ident';
import {Image} from './extensions/extension-image';
import {TableExtensions} from './extensions/extension-table';

import {createLowlight, common} from 'lowlight'

import EditorMenu from './EditorMenu';
import TableBubbleMenu from './components/TableBubbleMenu';
import CodeBlockBubbleMenu from './components/CodeBlockBubbleMenu';

import './index.css';
import './extensions/extension-table/table.css';

import ImagePopBarComponent from './extensions/extension-image/ImagePopBarComponent';

// 定义组件对外暴露的方法接口
export interface RichEditorRef {
  setContent: (content: any) => void;
  getContent: () => any;
  getHtmlContent: () => string;
  getTextContent: () => string;
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  setEditable: (editable: boolean) => void;
  isEditable: () => boolean;
}

interface RichEditorProps {
  title?: string;
  content?: any;
  docId?: string;
  width?: number;
  height?: number;
  /** 编辑区最大高度（px）；仅在未设置 height、非 fixedHeight 且处于编辑态时生效，超出后显示垂直滚动条 */
  maxHeight?: number;
  minHeight?: number;
  padding?: number;
  contentPadding?: number;
  bordered?: boolean;
  hasTitle?: boolean;
  infoPanel?: React.ReactNode;
  footPanel?: React.ReactNode;
  showUndo?: boolean;
  simpleMode?: boolean;
  fixedHeight?: boolean;
  id?: string;
}

const RichEditor = forwardRef<RichEditorRef, RichEditorProps>((props, ref) => {

  const {
    title,
    content,
    docId,
    height,
    maxHeight,
    width,
    minHeight = 200,
    padding = 0,
    contentPadding = 0,
    hasTitle = true,
    infoPanel,
    footPanel,
    showUndo = true,
    bordered = true,
    simpleMode = false,
    fixedHeight = false,
    id
  } = props;

  const extensions = [
    StarterKit.configure({
      // 禁用内置的 codeBlock 以便使用 CodeBlockLowlight 替代
      codeBlock: false,
      // 禁用内置的 underline 扩展，使用自定义的 Underline 扩展
      underline: false,
    }),
    CodeBlockLowlight.configure({
      lowlight: createLowlight(common),
      defaultLanguage: 'javascript',
    }),
    Color,
    Highlight.configure({multicolor: true}),
    Image,
    Indent,
    TaskList,
    TaskItem,
    TextStyle,
    // 配置 TextAlign 扩展，指定支持文本对齐的节点类型和对齐方式
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: 'left',
    }),
    Underline,
    // 添加 Markdown 扩展，支持 markdown 格式的读取和导出
    Markdown.configure({
      markedOptions: {
        gfm: true,        // 启用 GitHub 风格 Markdown (表格、任务列表等)
        breaks: false,    // 是否将换行符解析为 <br> (默认为 false)
        pedantic: false,  // 是否严格遵循原始 Markdown 规范
      },
    }),
    // 添加自定义表格扩展（包含所有表格相关功能）
    // TableExtensions 是一个数组，包含 TableKit 配置和自定义 TableCell
    ...TableExtensions,
  ];

  // 保存 title
  const [docTitle, setDocTitle] = React.useState<string>(title || '');
  // 保存 editor 实例的引用
  const [editor, setEditor] = React.useState<Editor | null>(null);
  // 保存 editable 状态
  const [editable, setEditable] = React.useState<boolean>(true);

  // fixedHeight 未传 height 时沿用 400 默认值，保证固定高度模式向后兼容
  const resolvedHeight = height ?? (fixedHeight ? 400 : undefined);
  // 未设置 height 且非固定高度：编辑区随内容自动增高
  const isAutoHeightMode = !fixedHeight && resolvedHeight === undefined;
  // 自动增高模式下，编辑态且设置了 maxHeight 时限制编辑区高度并启用滚动
  const shouldApplyMaxHeight = isAutoHeightMode && editable && maxHeight != null;

  const editorHeight = resolvedHeight != null ? resolvedHeight - padding * 2 : undefined;
  // 整体高度 - 工具栏高度 - 标题高度
  const contentHeight = editorHeight != null
      ? editorHeight - (editable ? 40 : 0) - (simpleMode || !hasTitle ? 0 : 70) - 2
      : undefined;

  // 格式化 content
  const formatContent = (content: any) => {
    if (typeof content === 'string') {
      // 转换为 JSON 对象
      try {
        return JSON.parse(content);
      } catch (error) {
        return content;
      }
    }
    return content;
  }

  const formattedContent = formatContent(content);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    setContent: (content: any) => {
      if (editor) {
        const contentObj = formatContent(content);
        editor.commands.setContent(contentObj);
        // 如果 content 中包含 title，则更新标题
        if (typeof contentObj === 'object' && contentObj.title) {
          setDocTitle(contentObj.title);
        }
      }
    },
    getContent: () => {
      const docData = {
        ...editor?.getJSON() ?? {},
        title: docTitle,
        format: 'doc'
      }
      return docData;
    },
    getHtmlContent: () => {
      return editor?.getHTML() || '';
    },
    getTextContent: () => {
      return editor?.getText() || '';
    },
    getMarkdown: () => {
      // 将编辑器内容序列化为 Markdown 格式字符串
      // 参考：editor.getMarkdown() 或 editor.markdown.serialize(json) 返回 Markdown 字符串
      if (editor) {
        try {
          // 优先使用 editor.getMarkdown() 方法（TipTap Markdown 扩展提供的便捷方法）
          if (typeof (editor as any).getMarkdown === 'function') {
            return (editor as any).getMarkdown();
          }
          // 降级方案：使用 editor.markdown.serialize() 方法，需要传入当前编辑器的 JSON 内容
          if ((editor as any).markdown && typeof (editor as any).markdown.serialize === 'function') {
            const jsonContent = editor.getJSON();
            return (editor as any).markdown.serialize(jsonContent);
          }
          // 降级方案：通过 storage 获取 markdown 格式内容
          if (editor.storage.markdown) {
            const markdownStorage = editor.storage.markdown as any;
            if (typeof markdownStorage.getMarkdown === 'function') {
              return markdownStorage.getMarkdown();
            }
            if (typeof markdownStorage.serialize === 'function') {
              // 如果 storage 中有 serialize 方法，使用它并传入当前编辑器的 JSON 内容
              const jsonContent = editor.getJSON();
              return markdownStorage.serialize(jsonContent);
            }
          }
        } catch (error) {
          console.error('获取 Markdown 内容失败:', error);
        }
      }
      return '';
    },
    setMarkdown: (markdown: string) => {
      // 将 markdown 字符串解析为 TipTap JSON 格式，然后设置到编辑器
      // 参考：editor.markdown.parse(markdownString) 返回 TipTap JSON 格式
      if (editor && markdown) {
        try {
          // 使用 Markdown 扩展的 parse 方法将 markdown 字符串解析为 JSON
          // TipTap Markdown 扩展提供了 editor.markdown.parse() 方法
          if ((editor as any).markdown && typeof (editor as any).markdown.parse === 'function') {
            const jsonContent = (editor as any).markdown.parse(markdown);
            editor.commands.setContent(jsonContent);
          } else {
            // 降级方案：如果 markdown 扩展未正确初始化，尝试使用 setContent 并指定 contentType
            editor.commands.setContent(markdown, {contentType: 'markdown'});
          }
        } catch (error) {
          console.error('设置 Markdown 内容失败:', error);
          // 降级方案：直接使用 setContent，让编辑器自动解析
          try {
            editor.commands.setContent(markdown, {contentType: 'markdown'});
          } catch (fallbackError) {
            console.error('降级方案也失败:', fallbackError);
          }
        }
      }
    },
    setEditable: (editable: boolean) => {
      setEditable(editable);
      editor?.setEditable(editable);
    },
    isEditable: () => {
      return editable;
    }
  }));

  // 组件卸载时清理编辑器
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        // 确保编辑器被正确销毁
        editor.destroy();
      }
    };
  }, [editor]);

  return (
      <div className="air-rich-editor-wrapper" id={id} style={{padding: `${padding}px`}}>
        <div
            className={`air-rich-editor${isAutoHeightMode ? ' air-rich-editor-auto-grow' : ''}`}
            style={{
              height: fixedHeight && editorHeight != null ? `${editorHeight}px` : 'auto',
              boxSizing: 'border-box',
              border: bordered ? '1px solid var(--color-border)' : 'none'
            }}>
          <EditorProvider
              editorContainerProps={{
                className: shouldApplyMaxHeight ? 'air-rich-editor-content-scroll' : undefined,
                style: {
                  boxSizing: 'border-box',
                  height: fixedHeight && contentHeight != null ? `${contentHeight}px` : 'unset',
                  minHeight: `${minHeight}px`,
                  ...(shouldApplyMaxHeight ? {
                    maxHeight: `${maxHeight}px`,
                    overflowY: 'auto',
                  } : {}),
                  width: width ? `${editable ? width + 15 : width}px` : 'auto'
                }
              }}
              onCreate={({editor}) => {
                setEditor(editor);
              }}
              extensions={extensions}
              content={formattedContent}
              editable={editable}
              editorProps={{
                attributes: {
                  style: `padding: 0 ${contentPadding}px; min-height: ${minHeight}px;`,
                },
                handlePaste: (view, event, slice) => {
                  const items = Array.from(event.clipboardData?.items || []);
                  for (const item of items) {
                    if (item.type.indexOf("image") === 0) {
                      const file = item.getAsFile();
                      if (!file) continue;

                      const formData = new FormData();
                      formData.append('files', file);
                      formData.append('bucket', 'wiki');
                      formData.append('ownerType', 'document');
                      formData.append('ownerId', docId || '');

                      // 发送请求保存图片信息到数据库
                      fetch('/rest/platform/storage/upload', {
                        method: 'POST',
                        headers: {
                          Authorization: 'Bearer ' + sessionStorage.getItem('air-machine-token'),
                        },
                        body: formData
                      })
                          .then(response => response.json())
                          .then((resp) => {
                            if (resp.success) {
                              resp.data.forEach((item: { blobUrl?: string }) => {
                                if (item.blobUrl) {
                                  editor?.commands.setImage({src: item.blobUrl});
                                }
                              });
                            }
                          })
                          .catch(error => {
                            console.error('上传图片错误:', error);
                          });

                      return true; // 处理完成，不执行默认行为
                    }
                  }

                  return false; // 不是图片，使用默认粘贴行为
                },
              }}
              slotBefore={
                <>
                  {
                      editable && (
                          <div className="air-rich-editor-toolbar">
                            <EditorMenu showUndo={showUndo} simpleMode={simpleMode} docId={docId}
                                        width={width ? width - 16 : 'auto'}/>
                          </div>
                      )
                  }
                  {
                      hasTitle && !simpleMode && (
                          <div className="air-rich-editor-title" style={{padding: `0 ${contentPadding}px`}}>
                            <input
                                value={docTitle}
                                onChange={e => setDocTitle(e.target.value)}
                                placeholder="请输入文档标题"
                                disabled={!editable}
                            />
                          </div>
                      )
                  }
                  {
                      infoPanel && (
                          <div className="air-rich-editor-meta">
                            {infoPanel}
                          </div>
                      )
                  }
                </>
              }
              slotAfter={footPanel || <div></div>}
          />
          {editor && <ImagePopBarComponent editor={editor}/>}
          {editor && <TableBubbleMenu editor={editor}/>}
          {editor && <CodeBlockBubbleMenu editor={editor}/>}
        </div>
      </div>
  );

});

export default RichEditor;
