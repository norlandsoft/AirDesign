import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'umi';
import {Spin, Tag} from 'antd';
import {Button, Icon, IconButton, Message, Splitter, Table, Tree} from 'air-design';
import {getBranches, getContents} from '../../models/asset';
import type {GiteaContentEntry, GiteaRepository} from '../../models/asset';
import CodeEditor from '@/components/CodeEditor';
import './index.less';

/** 左侧面板默认宽度 */
const LEFT_DEFAULT = 280;
const LEFT_MIN = 200;
const LEFT_MAX = 500;

/** 右侧 Table 偏移量（工具栏高度） */
const TABLE_OFFSET = 50;

/** Tree 组件所需的节点格式 */
interface TreeNodeItem {
  key: string;
  label: string;
  type: 'group' | 'item';
  /** 目录展开后存储子节点，用于避免重复请求 */
  children?: TreeNodeItem[];
  /** 附加数据：保留原始 path、type 等信息 */
  data?: { path: string; entryType: string };
}

/**
 * 智能任务 - 仓库详情页面
 *
 * 布局与智能工作室技能页面完全一致：使用 Splitter 实现左右可调节布局。
 * 左侧：文件树（懒加载），工具栏包含返回按钮、仓库名称、刷新。
 * 右侧：点击文件夹时显示目录内容列表（Table），点击文件时显示文件详情。
 * 左右联动：选中/展开文件夹时自动加载子节点，右侧 Table 点击文件夹时同步展开左侧树。
 *
 * Created by ChaiMingXu, on 2026-04-08
 * Updated on 2026-04-09 - 接入文件树，实现目录懒加载浏览
 * Updated on 2026-04-09 - 区分文件夹/文件点击策略，文件夹用 Table 展示内容列表
 * Updated on 2026-04-09 - 文件夹可选中和递归展开，左右联动
 */
interface RepoPageProps {
  frameSize: { width: number; height: number };
  /** 返回资产列表的回调 */
  onBack?: () => void;
}

/**
 * 将 Gitea 返回的内容条目列表转换为树节点并排序
 *
 * 目录映射为 group（可展开），文件映射为 item（叶子节点）。
 * 排序规则：文件夹在前，文件在后，同类型内按名称字母升序排列。
 */
function buildTreeNodes(entries: GiteaContentEntry[]): TreeNodeItem[] {
  return entries
      .map((entry) => ({
        key: entry.path,
        label: entry.name,
        type: entry.type === 'dir' ? 'group' as const : 'item' as const,
        isLeaf: entry.type !== 'dir',
        data: {path: entry.path, entryType: entry.type},
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'group' ? -1 : 1;
        return a.label.localeCompare(b.label);
      });
}

/**
 * 递归更新树中指定路径节点的 children
 */
function updateNodeChildren(
    nodes: TreeNodeItem[],
    path: string,
    children: TreeNodeItem[]
): TreeNodeItem[] {
  return nodes.map((n) => {
    if (n.key === path) return {...n, children};
    if (n.children) return {...n, children: updateNodeChildren(n.children, path, children)};
    return n;
  });
}

/**
 * 递归查找树节点
 */
function findNode(nodes: TreeNodeItem[], key: string): TreeNodeItem | null {
  for (const n of nodes) {
    if (n.key === key) return n;
    if (n.children) {
      const found = findNode(n.children, key);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

const RepoPage: React.FC<RepoPageProps> = (props) => {
  const {frameSize, onBack} = props;

  /** 从 asset model 读取当前选中的仓库 */
  const selectedRepo: GiteaRepository | null = useSelector((state: any) => state.asset?.selectedRepo);

  /** 文件树数据 */
  const [treeData, setTreeData] = useState<TreeNodeItem[]>([]);
  /** 树加载状态 */
  const [loading, setLoading] = useState(false);
  /** 展开的节点 key 列表 */
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  /** 当前分支 */
  const [currentBranch, setCurrentBranch] = useState<string>('');

  /** 当前选中节点 key（统一标识，文件夹或文件路径） */
  const [selectedKey, setSelectedKey] = useState<string>('');
  /** 选中节点的类型：group=文件夹, item=文件 */
  const [selectedType, setSelectedType] = useState<'group' | 'item' | ''>('');

  /** 右侧：文件夹内容列表 */
  const [folderEntries, setFolderEntries] = useState<GiteaContentEntry[]>([]);
  /** 右侧：文件夹内容加载状态 */
  const [folderLoading, setFolderLoading] = useState(false);

  /** 文件内容（base64 解码后的文本） */
  const [fileContent, setFileContent] = useState<string>('');
  /** 文件内容加载状态 */
  const [fileLoading, setFileLoading] = useState(false);
  /** 是否为二进制文件 */
  const [isBinary, setIsBinary] = useState(false);

  /** Splitter 面板控制 */
  const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_DEFAULT);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  /**
   * 获取仓库 owner 和 repo 名称
   */
  const getRepoInfo = useCallback(() => {
    if (!selectedRepo) return null;
    const owner = selectedRepo.owner?.login || selectedRepo.full_name?.split('/')[0] || '';
    const repo = selectedRepo.name || selectedRepo.full_name?.split('/')[1] || '';
    if (!owner || !repo) return null;
    return {owner, repo};
  }, [selectedRepo]);

  /**
   * 加载指定路径的目录内容并转换为树节点
   */
  const loadDirectory = useCallback(async (owner: string, repo: string, path: string, ref: string): Promise<TreeNodeItem[]> => {
    try {
      const result = await getContents(owner, repo, path, ref);
      const entries = Array.isArray(result) ? result : [result];
      const filtered = entries.filter((e: GiteaContentEntry) => e.type === 'dir' || e.type === 'file');
      return buildTreeNodes(filtered);
    } catch (e: any) {
      Message.error(e?.message || '加载目录失败');
      return [];
    }
  }, []);

  /**
   * 加载指定路径的目录原始内容条目（用于右侧 Table）
   */
  const loadFolderEntries = useCallback(async (owner: string, repo: string, path: string, ref: string): Promise<GiteaContentEntry[]> => {
    try {
      const result = await getContents(owner, repo, path, ref);
      const entries = Array.isArray(result) ? result : [result];
      return entries
          .filter((e: GiteaContentEntry) => e.type === 'dir' || e.type === 'file')
          .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return (a.name || '').localeCompare(b.name || '');
          });
    } catch (e: any) {
      Message.error(e?.message || '加载目录内容失败');
      return [];
    }
  }, []);

  /**
   * 根据文件扩展名判断是否为文本文件
   *
   * 通过常见文本文件扩展名白名单判断，未知扩展名默认视为二进制。
   */
  const isTextFile = (filename: string): boolean => {
    const textExtensions = [
      '.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.toml',
      '.js', '.ts', '.tsx', '.jsx', '.vue', '.css', '.less', '.scss', '.sass',
      '.html', '.htm', '.svg',
      '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php',
      '.sh', '.bash', '.zsh', '.bat', '.ps1',
      '.sql', '.graphql',
      '.dockerfile', '.gitignore', '.env', '.editorconfig',
      '.ini', '.cfg', '.conf', '.properties',
      '.log', '.csv', '.tsv',
    ];
    const lower = filename.toLowerCase();
    // 特殊文件名匹配（无扩展名）
    const specialNames = ['readme', 'license', 'makefile', 'dockerfile', 'jenkinsfile', '.gitignore', '.env'];
    if (specialNames.includes(lower)) return true;
    return textExtensions.some((ext) => lower.endsWith(ext));
  };

  /**
   * 根据文件扩展名推断语言（用于 CodeEditor 语法高亮）
   */
  const detectLanguage = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.py')) return 'python';
    if (lower.endsWith('.java')) return 'java';
    if (lower.endsWith('.xml') || lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.svg')) return 'xml';
    if (lower.endsWith('.css') || lower.endsWith('.less') || lower.endsWith('.scss')) return 'css';
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'yaml';
    if (lower.endsWith('.sql')) return 'sql';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
    if (lower.endsWith('.go')) return 'go';
    if (lower.endsWith('.rs')) return 'rust';
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'c';
    if (lower.endsWith('.cpp') || lower.endsWith('.hpp')) return 'cpp';
    return 'plaintext';
  };

  /**
   * 加载仓库根目录
   */
  const loadRootDirectory = useCallback(async () => {
    const info = getRepoInfo();
    if (!info) return;

    setLoading(true);
    try {
      let branch = selectedRepo?.default_branch || 'main';
      try {
        const branches = await getBranches(info.owner, info.repo);
        if (branches.length > 0) {
          const defaultBranch = branches.find((b) => b.name === selectedRepo?.default_branch);
          branch = defaultBranch?.name || branches[0].name;
        }
      } catch {
        // 分支获取失败时使用默认值
      }
      setCurrentBranch(branch);

      const nodes = await loadDirectory(info.owner, info.repo, '', branch);
      setTreeData(nodes);
      setExpandedKeys([]);
      setSelectedKey('');
      setSelectedType('');
      setFolderEntries([]);
    } finally {
      setLoading(false);
    }
  }, [getRepoInfo, loadDirectory, selectedRepo]);

  /** 页面加载时自动加载根目录 */
  useEffect(() => {
    if (selectedRepo) {
      loadRootDirectory();
    }
  }, [selectedRepo]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 选中文件夹：加载子节点 + 展开节点 + 更新右侧 Table
   *
   * 核心联动方法，Tree 点击文件夹和 Table 点击文件夹行都调用此方法。
   * 确保左侧树展开并加载子节点，同时右侧显示该文件夹的内容列表。
   */
  const handleSelectFolder = useCallback(async (path: string) => {
    const info = getRepoInfo();
    if (!info) return;

    // 统一设置选中状态，清空文件内容
    setSelectedKey(path);
    setSelectedType('group');
    setFileContent('');
    setIsBinary(false);
    setFolderLoading(true);

    // 确保树节点展开
    setExpandedKeys((prev) => prev.includes(path) ? prev : [...prev, path]);

    // 懒加载树子节点（若尚未加载）
    const node = findNode(treeData, path);
    if (node && node.type === 'group' && (!node.children || node.children.length === 0)) {
      const children = await loadDirectory(info.owner, info.repo, path, currentBranch);
      if (children.length > 0) {
        setTreeData((prev) => updateNodeChildren(prev, path, children));
      }
    }

    // 加载右侧 Table 内容
    try {
      const entries = await loadFolderEntries(info.owner, info.repo, path, currentBranch);
      setFolderEntries(entries);
    } finally {
      setFolderLoading(false);
    }
  }, [getRepoInfo, treeData, loadDirectory, loadFolderEntries, currentBranch]);

  /**
   * 选中文件：加载文件内容，区分文本和二进制
   */
  const handleSelectFile = useCallback(async (path: string) => {
    const info = getRepoInfo();
    setSelectedKey(path);
    setSelectedType('item');
    setFolderEntries([]);

    if (!info) return;

    const fileName = path.split('/').pop() || path;
    const textFile = isTextFile(fileName);

    if (!textFile) {
      // 二进制文件：直接标记，不请求内容
      setIsBinary(true);
      setFileContent('');
      return;
    }

    /** 文件过大阈值：超过此大小的文本文件不加载内容 */
    const LARGE_FILE_THRESHOLD = 512 * 1024; // 512KB

    // 文本文件：加载内容
    setIsBinary(false);
    setFileLoading(true);
    try {
      const result = await getContents(info.owner, info.repo, path, currentBranch);
      const entry = Array.isArray(result) ? result[0] : result;

      // Gitea 对大文件不返回 content 字段；文件过大时直接提示
      if (!entry?.content) {
        if (entry?.size && entry.size > LARGE_FILE_THRESHOLD) {
          setIsBinary(true); // 复用二进制文件的展示逻辑
        }
        setFileContent('');
        return;
      }

      // base64 解码：使用 TextDecoder 正确处理 UTF-8 中文
      const binaryStr = atob(entry.content.replace(/\n/g, ''));
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const decoded = new TextDecoder('utf-8').decode(bytes);
      setFileContent(decoded);
    } catch (e: any) {
      // 解码失败（如超大 buffer），按大文件处理
      setIsBinary(true);
      setFileContent('');
    } finally {
      setFileLoading(false);
    }
  }, [getRepoInfo, currentBranch]);

  /**
   * 树节点展开回调：懒加载子目录
   */
  const handleExpand = useCallback((newExpandedKeys: string[]) => {
    const info = getRepoInfo();
    if (!info) {
      setExpandedKeys(newExpandedKeys);
      return;
    }

    const addedKeys = newExpandedKeys.filter((k) => !expandedKeys.includes(k));
    setExpandedKeys(newExpandedKeys);

    addedKeys.forEach(async (key) => {
      const node = findNode(treeData, key);
      if (!node || node.type !== 'group' || (node.children && node.children.length > 0)) return;

      const children = await loadDirectory(info.owner, info.repo, key, currentBranch);
      if (children.length > 0) {
        setTreeData((prev) => updateNodeChildren(prev, key, children));
      }
    });
  }, [expandedKeys, treeData, getRepoInfo, loadDirectory, currentBranch]);

  /**
   * 树节点选中回调：区分文件夹和文件
   */
  const handleTreeSelect = useCallback((node: any) => {
    if (node?.type === 'group') {
      handleSelectFolder(node.key);
    } else if (node?.type === 'item') {
      handleSelectFile(node?.key || '');
    }
  }, [handleSelectFolder, handleSelectFile]);

  /**
   * Table 行点击回调：联动左侧树
   */
  const handleTableItemClick = useCallback((record: GiteaContentEntry) => {
    if (record.type === 'dir') {
      // 点击文件夹行：展开左侧树 + 选中该文件夹 + 更新右侧 Table
      handleSelectFolder(record.path);
    } else {
      // 点击文件行：选中文件
      handleSelectFile(record.path);
    }
  }, [handleSelectFolder, handleSelectFile]);

  /** 刷新文件树 */
  const handleRefresh = useCallback(() => {
    loadRootDirectory();
  }, [loadRootDirectory]);

  /** Splitter 尺寸变化回调 */
  const handleSplitterChange = (size: number) => {
    if (size > 0) {
      setLeftPanelWidth(size);
      setLeftCollapsed(false);
    } else {
      setLeftCollapsed(true);
    }
  };

  /** 显示名称：从路径中提取最后一段 */
  const getDisplayName = (path: string) => path ? path.split('/').pop() || path : '';

  const h = frameSize?.height ?? 600;
  const w = frameSize?.width ?? 800;
  const rightPanelWidth = w - (leftCollapsed ? 0 : leftPanelWidth) - 1;

  /** 仓库名称 */
  const repoName = selectedRepo?.name || selectedRepo?.full_name || '仓库';

  /** Table 列定义 */
  const folderTableColumns = [
    {
      title: '名称',
      key: 'name',
      render: (_: any, r: GiteaContentEntry) => (
          <div style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
            <Icon name={r.type === 'dir' ? 'folder' : 'document'} size={18}/>
            <span style={{color: r.type === 'dir' ? '#1f2937' : '#0969da'}}>{r.name}</span>
          </div>
      ),
    },
    {
      title: '大小',
      key: 'size',
      width: 120,
      render: (_: any, r: GiteaContentEntry) => r.type === 'dir' ? '—' : formatFileSize(r.size),
    },
    {
      title: '路径',
      key: 'path',
      ellipsis: true,
      render: (_: any, r: GiteaContentEntry) => r.path,
    },
  ];

  return (
      <div className="repository-panel" style={{width: w, height: h}}>
        <Splitter
            split="vertical"
            primary="first"
            defaultSize={leftPanelWidth}
            minSize={LEFT_MIN}
            maxSize={Math.min(LEFT_MAX, w - 200)}
            style={{width: w, height: h}}
            onChange={handleSplitterChange}
            collapsible
        >
          {/* 左侧：文件树 */}
          <div className="repository-panel-left" style={{width: leftPanelWidth, height: h}}>
            <div className="repository-panel-left-toolbar" style={{gap: 8}}>
              <IconButton
                  icon="sub_back"
                  size={32}
                  shape="square"
                  onClick={onBack}
                  tooltip="返回资产列表"
              />
              <span className="repository-panel-left-title"
                    style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0}}>
                {repoName}
              </span>
              <div className="repository-panel-left-actions">
                <IconButton
                    icon="reload"
                    size={26}
                    shape="square"
                    bordered
                    onClick={handleRefresh}
                    tooltip="刷新"
                />
              </div>
            </div>
            <div className="repository-panel-left-body" style={{height: h - 50}}>
              {loading ? (
                  <div className="repository-panel-left-loading">
                    <Spin size="default" tip="加载中..."/>
                  </div>
              ) : treeData.length === 0 ? (
                  <div className="repository-panel-left-empty">
                    <p>暂无文件</p>
                    <p className="repository-panel-left-empty-hint">该仓库为空或无法加载文件列表</p>
                  </div>
              ) : (
                  <Tree
                      data={treeData}
                      height={h - 50}
                      clickToCollapse={false}
                      onSelect={handleTreeSelect}
                      onExpand={handleExpand}
                      expandedKeys={expandedKeys}
                      value={selectedKey}
                      folderIcon="folder"
                      itemIcon="document"
                  />
              )}
            </div>
          </div>

          {/* 右侧：内容区域 */}
          <div className="repository-panel-right" style={{width: rightPanelWidth, height: h}}>
            {selectedKey ? (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <div className="repository-panel-toolbar">
                    <div className="repository-panel-toolbar-info">
                      <span className="repository-panel-toolbar-name">
                        {getDisplayName(selectedKey)}
                      </span>
                      <span className="repository-panel-toolbar-tags">
                        <Tag className="repository-panel-tag">{currentBranch || 'main'}</Tag>
                      </span>
                    </div>
                    <div className="repository-panel-toolbar-actions">
                    </div>
                  </div>
                  {/* 文件夹：展示内容列表 Table */}
                  {selectedType === 'group' && (
                      <div style={{flex: 1, minHeight: 0}}>
                        <Table
                            columns={folderTableColumns}
                            data={folderEntries}
                            rowKey="path"
                            height={h - TABLE_OFFSET}
                            showHeader={true}
                            loading={folderLoading}
                            bordered={true}
                            showEmpty={true}
                            emptyText="该文件夹为空"
                            onItemClick={handleTableItemClick}
                        />
                      </div>
                  )}
                  {selectedType === 'item' && (
                      <div className="repository-panel-editor" style={{flex: 1, minHeight: 0}}>
                        {isBinary ? (
                            <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>
                              <Icon name="document" size={48}/>
                              <p style={{marginTop: 12, fontSize: 14}}>{getDisplayName(selectedKey)}</p>
                              <p style={{fontSize: 12, color: '#bfbfbf'}}>{isTextFile(getDisplayName(selectedKey)) ? '文件过大，无法预览' : '二进制文件，无法预览'}</p>
                            </div>
                        ) : (
                            <CodeEditor
                                content={fileContent}
                                language={detectLanguage(selectedKey)}
                                width="100%"
                                height={Math.max(200, h - 50 - 24)}
                                readOnly
                                border
                                wordWrap="on"
                            />
                        )}
                      </div>
                  )}
                </div>
            ) : (
                <div className="repository-panel-right-empty">
                  <Icon name="folder" size={48}/>
                  <p>请从左侧选择文件或文件夹</p>
                </div>
            )}
          </div>
        </Splitter>
      </div>
  );
};

export default RepoPage;
