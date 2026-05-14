import React, {useEffect, useMemo, useRef, useState} from 'react';
import {connect} from 'umi';
import {Form, Input, Select, Spin, Tag, message} from 'antd';
import {Button, Dialog, Icon, IconButton, Message, SlidePanel, Splitter, Tree} from 'air-design';
import CodeEditor from '@/components/CodeEditor';
import type {SkillVO} from '@/types/skill';
import {buildSkillTree} from '@/models/skill';
import {POST} from '@/utils/HttpRequest';
import './index.less';

/** 适配 Form.Item：value/onChange 转成 content/onChange 供 CodeEditor 使用 */
const CodeEditorFormField: React.FC<any> = ({value, onChange, ...rest}) => (
    <CodeEditor content={value ?? ''} onChange={onChange} {...rest} />
);

/** 从 metadata 解析 tags */
function parseTagsFromMetadata(metadata?: string): string[] {
  if (!metadata) return [];
  try {
    const obj = JSON.parse(metadata);
    return Array.isArray(obj?.tags) ? obj.tags : [];
  } catch {
    return [];
  }
}

/** 将 tags 序列化为 metadata */
function tagsToMetadata(tags: string[]): string {
  return JSON.stringify({tags: tags || []});
}

/** 左侧面板默认宽度 */
const LEFT_DEFAULT = 350;
const LEFT_MIN = 300;
const LEFT_MAX = 600;

/**
 * 智能工作室 - 技能页面
 *
 * 使用 Splitter 实现左右可调节布局。
 * 左侧：技能组树形结构（技能组 + 技能），支持拖拽、新建组、组菜单（新建组、新建技能、重命名、删除）。
 * 右侧：技能维护区域，顶端工具栏包含保存、信息、更多按钮。
 *
 * Created by ChaiMingXu, on 2026-02-21
 */
interface SkillPageProps {
  dispatch: any;
  frameSize: { width: number; height: number };
  skill: {
    skillList: any[];
    skillGroupTree: any[];
    loading: boolean;
  };
}

const SkillPage: React.FC<SkillPageProps> = (props) => {
  const {dispatch, frameSize, skill: skillModel} = props;
  const {skillList = [], skillGroupTree = [], loading = false} = skillModel || {};
  const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_DEFAULT);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [skillForm] = Form.useForm();
  const [infoForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [createGroupForm] = Form.useForm();
  const [renameGroupForm] = Form.useForm();
  const [editingSkill, setEditingSkill] = useState<SkillVO | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dispatch({type: 'skill/fetchSkillList', payload: {}});
    dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
  }, [dispatch]);

  const skillTreeData = useMemo(
      () => buildSkillTree(skillList, skillGroupTree),
      [skillList, skillGroupTree]
  );

  /** Splitter 尺寸变化回调：拖拽时更新宽度，折叠/展开时切换折叠状态（不修改宽度以保留暂存值） */
  const handleSplitterChange = (size: number) => {
    if (size > 0) {
      setLeftPanelWidth(size);
      setLeftCollapsed(false);
    } else {
      setLeftCollapsed(true);
    }
  };

  const handleTreeSelect = (node: any) => {
    if (node?.type === 'item' && node?.data) {
      handleSelectSkill(node.data as SkillVO);
    }
  };

  const handleSkillTreeDrop = (info: any) => {
    const {dropToGap, node, dragNode} = info;
    const dragKey = dragNode?.key;
    const dragType = dragNode?.type ?? dragNode?.data?.type;
    const targetKey = node?.key;
    const targetType = node?.type ?? node?.data?.type;
    const targetParent =
        node?.data?.parent ?? (typeof node?.parent === 'string' ? node.parent : node?.parent?.key);

    if (!dragKey) return;

    if (dragType === 'item') {
      let newGroupId: string | undefined;
      if (dropToGap) {
        newGroupId = targetParent || undefined;
      } else {
        if (targetType === 'group') {
          newGroupId = targetKey;
        } else {
          newGroupId = (node?.data as SkillVO)?.groupId ?? targetParent ?? undefined;
        }
      }
      if (!newGroupId) {
        Message.error('技能必须归属于某个技能组');
        dispatch({type: 'skill/fetchSkillList', payload: {}});
        dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
        return;
      }
      dispatch({
        type: 'skill/updateSkill',
        payload: {id: dragKey, groupId: newGroupId},
        callback: (r: any) => {
          if (r?.success) {
            Message.success('技能已移动');
          } else {
            Message.error(r?.message || '移动失败');
          }
          dispatch({type: 'skill/fetchSkillList', payload: {}});
          dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
        },
      });
    } else {
      let newParentId: string | undefined;
      if (dropToGap) {
        newParentId = targetParent ?? undefined;
      } else {
        if (targetType === 'group') {
          newParentId = targetKey;
        } else {
          newParentId = (node?.data as SkillVO)?.groupId ?? targetParent ?? undefined;
        }
      }
      dispatch({
        type: 'skill/updateSkillGroup',
        payload: {id: dragKey, parentId: newParentId},
        callback: (r: any) => {
          if (r?.success) {
            Message.success('技能组已移动');
          } else {
            Message.error(r?.message || '移动失败');
          }
          dispatch({type: 'skill/fetchSkillList', payload: {}});
          dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
        },
      });
    }
  };

  const handleGroupMenuItemClick = (menuItem: any, data: any) => {
    if (data?.type !== 'group') return;
    const groupKey = data?.key || data?.id;
    const groupLabel = data?.label || data?.name || '该组';
    if (menuItem.key === 'addGroup') {
      handleCreateSkillGroup(groupKey);
    } else if (menuItem.key === 'addSkill') {
      handleCreateSkill(groupKey);
    } else if (menuItem.key === 'importSkill') {
      handleImportToGroup(groupKey);
    } else if (menuItem.key === 'rename') {
      handleRenameSkillGroup(groupKey, groupLabel);
    } else if (menuItem.key === 'delete') {
      const skillsInGroup = (skillList || []).filter((s) => s.groupId === groupKey);
      const childGroups = (data?.children || []).filter((c: any) => c?.type === 'group');
      if (skillsInGroup.length > 0) {
        Message.warning(`组「${groupLabel}」内有 ${skillsInGroup.length} 个技能，不可删除`);
        return;
      }
      if (childGroups.length > 0) {
        Message.warning(`组「${groupLabel}」内有 ${childGroups.length} 个子组，不可删除`);
        return;
      }
      Dialog({
        title: '确认删除',
        width: 400,
        content: <div>确定要删除技能组「{groupLabel}」吗？</div>,
        okText: '确定',
        cancelText: '取消',
        onConfirm: (dlg: any) => {
          dispatch({
            type: 'skill/deleteSkillGroup',
            payload: {id: groupKey},
            callback: (r: any) => {
              if (r?.success) {
                Message.success('技能组已删除');
                dlg.doCancel();
                dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
              } else {
                Message.error(r?.message || '删除失败');
              }
            },
          });
        },
      });
    }
  };

  const skillGroupMenu = [
    {key: 'addGroup', label: '新建组'},
    {key: 'addSkill', label: '新建技能'},
    {key: 'importSkill', label: '导入技能'},
    {type: 'divider'},
    {key: 'rename', label: '重命名'},
    {key: 'delete', label: '删除', danger: true},
  ];

  const handleRenameSkillGroup = (groupKey: string, currentName: string) => {
    renameGroupForm.resetFields();
    renameGroupForm.setFieldsValue({name: currentName});
    Dialog({
      title: '重命名技能组',
      width: 400,
      content: (
          <Form form={renameGroupForm} layout="vertical">
            <Form.Item name="name" label="技能组名称" rules={[{required: true, message: '请输入技能组名称'}]}>
              <Input placeholder="请输入技能组名称"/>
            </Form.Item>
          </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        renameGroupForm.validateFields().then((vals) => {
          dispatch({
            type: 'skill/updateSkillGroup',
            payload: {id: groupKey, name: vals.name},
            callback: (r: any) => {
              if (r?.success) {
                Message.success('重命名成功');
                dlg.doCancel();
                dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
              } else {
                Message.error(r?.message || '重命名失败');
              }
            },
          });
        });
      },
    });
  };

  const handleCreateSkillGroup = (parentId?: string) => {
    createGroupForm.resetFields();
    Dialog({
      title: parentId ? '新建子技能组' : '新建技能组',
      width: 400,
      content: (
          <Form form={createGroupForm} layout="vertical">
            <Form.Item name="name" label="技能组名称" rules={[{required: true, message: '请输入技能组名称'}]}>
              <Input placeholder="请输入技能组名称"/>
            </Form.Item>
          </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        createGroupForm.validateFields().then((vals) => {
          dispatch({
            type: 'skill/createSkillGroup',
            payload: {name: vals.name, parentId: parentId || undefined},
            callback: (r: any) => {
              if (r?.success) {
                Message.success('技能组创建成功');
                dlg.doCancel();
                dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
              } else {
                Message.error(r?.message || '创建失败');
              }
            },
          });
        });
      },
    });
  };

  /** 导入 ZIP 技能文件到指定技能组 */
  const handleImportToGroup = (groupId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const headers = {'Authorization': `Bearer ${token}`, 'X-User-Id': userId};

      try {
        // 1. 预览
        const previewForm = new FormData();
        previewForm.append('file', file);
        const previewResp = await fetch('/api/openclaw/skills/import/preview', {
          method: 'POST', headers, body: previewForm,
        }).then((r) => r.json());

        if (!previewResp?.success || !previewResp?.data) {
          Message.error(previewResp?.message || '解析ZIP文件失败');
          return;
        }

        const {skills, totalCount, conflictCount} = previewResp.data;

        // 2. 确认导入
        const hasConflict = conflictCount > 0;
        const confirmContent = hasConflict
            ? `共 ${totalCount} 个技能，其中 ${conflictCount} 个同名冲突，冲突项将跳过。确定导入吗？`
            : `共 ${totalCount} 个技能，确定导入吗？`;

        Dialog({
          title: '导入技能',
          width: 420,
          content: <div>{confirmContent}</div>,
          okText: '确定',
          cancelText: '取消',
          onConfirm: async (dlg: any) => {
            // 3. 执行导入
            const resolutions = skills.map((s: any) => ({
              name: s.name,
              action: s.conflict ? 'skip' : 'create',
            }));

            const execForm = new FormData();
            execForm.append('file', file);
            execForm.append('resolutions', JSON.stringify(resolutions));
            execForm.append('targetGroupId', groupId);

            const execResp = await fetch('/api/openclaw/skills/import/execute', {
              method: 'POST', headers, body: execForm,
            }).then((r) => r.json());

            if (execResp?.success) {
              const {created, overwritten, skipped} = execResp.data;
              Message.success(`导入完成：新建 ${created}，覆盖 ${overwritten}，跳过 ${skipped}`);
              dispatch({type: 'skill/fetchSkillList', payload: {}});
              dispatch({type: 'skill/fetchSkillGroupTree', payload: {}});
            } else {
              Message.error(execResp?.message || '导入失败');
            }
            dlg.doCancel();
          },
        });
      } catch (err: any) {
        Message.error('导入失败: ' + (err?.message || ''));
      }
    };
    input.click();
  };

  const handleCreateSkill = (groupId?: string) => {
    createForm.resetFields();
    Dialog({
      title: '新建技能',
      width: 520,
      content: (
          <Form form={createForm} layout="vertical">
            <Form.Item name="name" label="技能名称" rules={[{required: true, message: '请输入技能名称'}]}>
              <Input placeholder="请输入技能名称"/>
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={4} placeholder="技能描述（可选）" style={{resize: 'none'}}/>
            </Form.Item>
          </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        createForm.validateFields().then((vals) => {
          const payload = {
            name: vals.name,
            description: vals.description || '',
            content: '# 新建技能\n\n在此编辑技能内容...',
            metadata: tagsToMetadata([]),
            groupId: groupId || undefined,
          };
          dispatch({
            type: 'skill/createSkill',
            payload,
            callback: (r: any) => {
              if (r?.success && r?.data) {
                Message.success('技能创建成功');
                dlg.doCancel();
                const created = r.data as SkillVO;
                setEditingSkill(created);
                skillForm.setFieldsValue({skill: created.content || payload.content});
                infoForm.setFieldsValue({
                  name: created.name,
                  description: created.description || '',
                  tags: parseTagsFromMetadata(created.metadata),
                });
              } else {
                Message.error(r?.message || '创建失败');
              }
            },
          });
        });
      },
    });
  };

  const handleSyncToOpenClaw = () => {
    setSyncing(true);
    dispatch({
      type: 'skill/syncSkillsToOpenClaw',
      callback: (r: any) => {
        setSyncing(false);
        if (r?.success) {
          Message.success(r?.message || '同步成功');
        } else {
          Message.error(r?.message || '同步失败');
        }
      },
    });
  };

  const handleSelectSkill = (skill: SkillVO) => {
    setEditingSkill(skill);
    dispatch({
      type: 'skill/fetchSkillInfo',
      payload: {id: skill.id},
      callback: (r: any) => {
        if (r?.success && r?.data) {
          const full = r.data as SkillVO;
          setEditingSkill(full);
          skillForm.setFieldsValue({skill: full.content || ''});
          infoForm.setFieldsValue({
            name: full.name,
            description: full.description || '',
            tags: parseTagsFromMetadata(full.metadata),
          });
        }
      },
    });
  };

  const getCurrentFormValues = () => {
    const skillVals = skillForm.getFieldsValue();
    const infoVals = infoForm.getFieldsValue();
    return {...infoVals, ...skillVals};
  };

  const handleSaveSkill = () => {
    if (!editingSkill) return;
    skillForm.validateFields().then(() => {
      const skillContent = skillForm.getFieldValue('skill') ?? '';
      dispatch({
        type: 'skill/updateSkill',
        payload: {id: editingSkill.id, content: skillContent},
        callback: (r: any) => {
          if (r?.success) {
            Message.success('技能内容保存成功');
            setEditingSkill((prev) => (prev ? {...prev, content: skillContent} : null));
          } else {
            Message.error(r?.message || '保存失败');
          }
        },
      });
    });
  };

  const handleDeleteSkill = () => {
    if (!editingSkill) return;
    Dialog({
      title: '确认删除',
      width: 400,
      content: <div>确定要删除技能「{editingSkill.name}」吗？</div>,
      okText: '确定',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'skill/deleteSkill',
          payload: {id: editingSkill.id},
          callback: (r: any) => {
            if (r?.success) {
              Message.success('技能删除成功');
              dlg.doCancel();
              setEditingSkill(null);
              skillForm.resetFields();
              infoForm.resetFields();
            } else {
              Message.error(r?.message || '删除技能失败');
            }
          },
        });
      },
    });
  };

  const handleExportSkill = () => {
    const vals = getCurrentFormValues();
    const content = vals.skill ?? editingSkill?.content ?? '';
    const name = vals.name ?? editingSkill?.name ?? 'skill';
    const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    Message.success('导出成功');
  };

  const handleSaveInfoPanel = () => {
    if (!editingSkill) return;
    infoForm.validateFields().then((vals) => {
      const payload = {
        id: editingSkill.id,
        name: vals.name,
        description: vals.description ?? '',
        metadata: tagsToMetadata(vals.tags || []),
      };
      dispatch({
        type: 'skill/updateSkill',
        payload,
        callback: (r: any) => {
          if (r?.success) {
            Message.success('保存成功');
            setShowInfoPanel(false);
            setEditingSkill((prev) => (prev ? {...prev, ...payload} : null));
          } else {
            Message.error(r?.message || '保存失败');
          }
        },
      });
    });
  };

  const displayName = Form.useWatch('name', infoForm) ?? editingSkill?.name ?? '';
  const displayTags = Form.useWatch('tags', infoForm) ?? parseTagsFromMetadata(editingSkill?.metadata) ?? [];

  const moreMenuItems = [
    {key: 'export', label: '导出', onClick: () => handleExportSkill()},
    ...(editingSkill ? [{key: 'delete', label: '删除', onClick: () => handleDeleteSkill(), danger: true}] : []),
  ];

  // ==================== 文件面板 ====================

  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);
  const uploadRef = useRef<any>(null);

  /** 预置的文件夹列表（始终在文件树中显示） */
  const PRESET_FOLDERS = ['scripts/', 'references/', 'assets/'];

  /** 文本文件扩展名集合 */
  const TEXT_EXTENSIONS = new Set([
    '.md', '.txt', '.py', '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml',
    '.xml', '.html', '.css', '.less', '.scss', '.sh', '.bash', '.zsh',
    '.sql', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp',
    '.toml', '.ini', '.cfg', '.conf', '.env', '.gitignore', '.dockerignore',
    '.csv', '.log', '.rb', '.php', '.pl', '.lua', '.r', '.m',
  ]);

  /** 判断是否为文本文件 */
  const isTextFile = (name: string, mimeType?: string) => {
    if (mimeType?.startsWith('text/')) return true;
    if (mimeType === 'application/json') return true;
    const ext = '.' + name.split('.').pop()?.toLowerCase();
    return TEXT_EXTENSIONS.has(ext);
  };

  /** 文件夹菜单 */
  const fileFolderMenu = [
    {key: 'upload', label: '上传'},
  ];

  /** 文件夹菜单点击 */
  const handleFolderMenuItemClick = (info: any, data: any) => {
    // 文件树节点的 path 存储在 data.data.path 中（与技能树 data.key 的访问层级一致）
    const folderPath = data?.data?.path || data?.path;
    if (info.key === 'upload' && folderPath) {
      handleUploadFile(folderPath);
    }
  };

  /** 将文件列表构建为 air-design Tree 需要的树结构，支持任意深度的文件夹 */
  const buildFileTree = () => {
    // 收集所有目录路径（以 / 结尾）
    const dirSet = new Set<string>();
    // 预置文件夹始终显示
    PRESET_FOLDERS.forEach((p) => dirSet.add(p));
    // 从数据库 folder 记录收集
    fileList.forEach((f: any) => {
      if (f.type === 'folder' && f.path) {
        dirSet.add(f.path.endsWith('/') ? f.path : f.path + '/');
      }
    });
    // 从文件路径推断所有父目录
    fileList.forEach((f: any) => {
      if (f.type === 'file' && f.path) {
        const lastSlash = f.path.lastIndexOf('/');
        if (lastSlash > 0) {
          const parts = f.path.substring(0, lastSlash).split('/');
          let current = '';
          parts.forEach((p: string) => {
            current += p + '/';
            dirSet.add(current);
          });
        }
      }
    });

    // 按深度排序，确保父目录先创建
    const sortedDirs = Array.from(dirSet).sort(
        (a, b) => a.split('/').filter(Boolean).length - b.split('/').filter(Boolean).length,
    );

    // 构建目录节点映射：path -> node
    const nodeMap = new Map<string, any>();
    sortedDirs.forEach((dirPath) => {
      const name = dirPath.endsWith('/')
          ? dirPath.slice(0, -1).split('/').pop() || dirPath
          : dirPath.split('/').pop() || dirPath;
      const node: any = {
        key: dirPath,
        label: name,
        type: 'group',
        children: [],
        data: {type: 'folder', path: dirPath, name},
      };
      nodeMap.set(dirPath, node);
    });

    // 将目录节点挂到父目录下
    const result: any[] = [];
    sortedDirs.forEach((dirPath) => {
      const trimmed = dirPath.endsWith('/') ? dirPath.slice(0, -1) : dirPath;
      const parentSlash = trimmed.lastIndexOf('/');
      if (parentSlash > 0) {
        const parentPath = trimmed.substring(0, parentSlash + 1);
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          parentNode.children.push(nodeMap.get(dirPath));
        } else {
          result.push(nodeMap.get(dirPath));
        }
      } else {
        result.push(nodeMap.get(dirPath));
      }
    });

    // 将文件添加到对应目录
    fileList.forEach((f: any) => {
      if (f.type !== 'file') return;
      const lastSlash = f.path.lastIndexOf('/');
      const parentDir = lastSlash > 0 ? f.path.substring(0, lastSlash + 1) : '';
      const fileNode = {
        key: f.id,
        label: f.name,
        type: 'item',
        data: f,
      };
      if (parentDir && nodeMap.has(parentDir)) {
        nodeMap.get(parentDir)!.children.push(fileNode);
      } else {
        result.push(fileNode);
      }
    });

    return result;
  };

  /** 加载技能的文件列表 */
  const loadSkillFiles = () => {
    if (!editingSkill) return;
    dispatch({
      type: 'skill/fetchSkillFiles',
      payload: {skillId: editingSkill.id},
      callback: (r: any) => {
        if (r?.success) {
          setFileList(r.data || []);
        }
      },
    });
  };

  /** 文件树节点选中 */
  const handleFileSelect = (node: any) => {
    // 文件夹节点不处理
    if (node?.type === 'group') return;
    const fileData = node?.data;
    if (!fileData || fileData.type === 'folder') return;

    setSelectedFile(fileData);
    setFileContent('');
    setFileLoading(true);

    dispatch({
      type: 'skill/fetchSkillFile',
      payload: {id: node.key},
      callback: (r: any) => {
        setFileLoading(false);
        if (r?.success && r.data) {
          const file = r.data;
          setSelectedFile(file);
          if (file.content) {
            if (typeof file.content === 'string') {
              try {
                const bytes = Uint8Array.from(atob(file.content), c => c.charCodeAt(0));
                setFileContent(new TextDecoder('utf-8').decode(bytes));
              } catch {
                setFileContent(file.content);
              }
            } else if (file.content instanceof ArrayBuffer || file.content instanceof Uint8Array) {
              const bytes = file.content instanceof Uint8Array ? file.content : new Uint8Array(file.content);
              setFileContent(new TextDecoder().decode(bytes));
            }
          }
        }
      },
    });
  };

  /** 上传文件（支持多文件） */
  const handleUploadFile = (targetPath: string) => {
    if (!editingSkill) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = e.target?.files;
      if (!files || files.length === 0) return;

      const token = sessionStorage.getItem('air-machine-token') || '';
      const userId = sessionStorage.getItem('air-machine-user') || '';
      const totalCount = files.length;
      let successCount = 0;
      let failCount = 0;

      // 逐个上传文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('skillId', editingSkill.id);
        formData.append('path', targetPath + file.name);

        try {
          const resp = await fetch('/api/openclaw/skill-files/save', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-Id': userId,
            },
            body: formData,
          });
          const r = await resp.json();
          if (r?.success) {
            successCount++;
          } else {
            failCount++;
            console.warn(`文件上传失败: ${file.name}`, r?.message);
          }
        } catch {
          failCount++;
          console.warn(`文件上传异常: ${file.name}`);
        }
      }

      // 汇总提示结果
      if (totalCount === 1) {
        if (successCount > 0) {
          message.success('文件上传成功');
        } else {
          message.error('文件上传失败');
        }
      } else {
        if (failCount === 0) {
          message.success(`${totalCount} 个文件全部上传成功`);
        } else if (successCount === 0) {
          message.error(`${totalCount} 个文件全部上传失败`);
        } else {
          message.warning(`${successCount} 个文件上传成功，${failCount} 个失败`);
        }
      }

      // 刷新文件列表
      loadSkillFiles();
    };
    input.click();
  };

  /** 删除文件或文件夹 */
  const handleDeleteFile = (fileData: any) => {
    if (!editingSkill) return;
    Dialog({
      title: '确认删除',
      width: 400,
      content: <div>确定要删除「{fileData.name || fileData.path}」吗？</div>,
      okText: '确定',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'skill/deleteSkillFile',
          payload: {id: fileData.id, skillId: editingSkill.id},
          callback: (r: any) => {
            if (r?.success) {
              message.success('删除成功');
              setSelectedFile(null);
              setFileContent('');
              loadSkillFiles();
            } else {
              message.error(r?.message || '删除失败');
            }
            dlg.doCancel();
          },
        });
      },
    });
  };

  /** 根据文件名推断编辑器语言 */
  const getLanguage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
      py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java',
      json: 'json', yaml: 'yaml', yml: 'yaml', xml: 'xml', html: 'html',
      css: 'css', less: 'less', scss: 'scss', sql: 'sql', sh: 'shell',
      md: 'markdown', txt: 'plaintext', csv: 'plaintext',
    };
    return map[ext] || 'plaintext';
  };

  const showRightPanel = !!editingSkill;
  const h = frameSize?.height ?? 600;
  const w = frameSize?.width ?? 800;
  const editorHeight = Math.max(200, h - 50 - 24);
  const rightPanelWidth = w - (leftCollapsed ? 0 : leftPanelWidth) - 1;

  return (
      <div className="skill-panel" style={{width: w, height: h}}>
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
          {/* 左侧：技能组树形结构 */}
          <div className="skill-panel-left" style={{width: leftPanelWidth, height: h}}>
            <div className="skill-panel-left-toolbar">
              <span className="skill-panel-left-title">技能</span>
              <div className="skill-panel-left-actions">
                <IconButton
                    icon="add_folder"
                    size={28}
                    shape="square"
                    onClick={() => handleCreateSkillGroup()}
                    tooltip="新建技能组"
                />
                <IconButton
                    icon="sync"
                    size={28}
                    shape="square"
                    onClick={handleSyncToOpenClaw}
                    tooltip="同步到 OpenClaw"
                    disabled={syncing}
                />
              </div>
            </div>
            <div className="skill-panel-left-body" style={{height: h - 50}}>
              {loading ? (
                  <div className="skill-panel-left-loading">
                    <Spin size="default" tip="加载中..."/>
                  </div>
              ) : skillTreeData.length === 0 ? (
                  <div className="skill-panel-left-empty">
                    <p>暂无技能</p>
                    <p className="skill-panel-left-empty-hint">点击上方按钮新建技能组，或在组菜单中新建技能</p>
                  </div>
              ) : (
                  <Tree
                      data={skillTreeData}
                      height={h - 50}
                      clickToCollapse={false}
                      groupMenu={skillGroupMenu}
                      menuItemClick={handleGroupMenuItemClick}
                      onSelect={handleTreeSelect}
                      onDrop={handleSkillTreeDrop}
                      onExpand={setExpandedKeys}
                      expandedKeys={expandedKeys}
                      rootButtonClick={() => handleCreateSkillGroup()}
                      value={editingSkill?.id}
                      draggable
                      folderIcon="folder"
                      itemIcon="skill"
                  />
              )}
            </div>
          </div>

          {/* 右侧：技能维护区域 */}
          <div className="skill-panel-right" style={{width: rightPanelWidth, height: h}}>
            {showRightPanel ? (
                <Form form={skillForm} layout="vertical"
                      style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <div className="skill-panel-toolbar">
                    <div className="skill-panel-toolbar-info">
                      <span className="skill-panel-toolbar-name">{displayName || '未命名'}</span>
                      {displayTags?.length > 0 && (
                          <span className="skill-panel-toolbar-tags">
                    {displayTags.map((t: string) => (
                        <Tag key={t} className="skill-panel-tag">{t}</Tag>
                    ))}
                  </span>
                      )}
                    </div>
                    <div className="skill-panel-toolbar-actions">
                      <Button type="primary" size="small" onClick={handleSaveSkill}>
                        保存
                      </Button>
                      <IconButton
                          icon="info"
                          size={32}
                          shape="square"
                          bordered
                          tooltip="信息"
                          onClick={() => setShowInfoPanel(true)}
                      />
                      <IconButton
                          icon="library"
                          size={32}
                          shape="square"
                          bordered
                          tooltip="文件"
                          onClick={() => { setShowFilePanel(true); loadSkillFiles(); }}
                      />
                      <IconButton
                          icon="more"
                          size={32}
                          shape="square"
                          bordered
                          tooltip="更多"
                          items={moreMenuItems}
                      />
                    </div>
                  </div>
                  <div className="skill-panel-editor" style={{flex: 1, minHeight: 0}}>
                    <Form.Item name="skill" rules={[{required: true, message: '请输入技能内容'}]}
                               style={{height: '100%', marginBottom: 0}}>
                      <CodeEditorFormField width="100%" height={editorHeight} language="markdown" border showMap={false}
                                           wordWrap="on"/>
                    </Form.Item>
                  </div>
                </Form>
            ) : (
                <div className="skill-panel-right-empty">
                  <Icon name="skill" size={48}/>
                  <p>请从左侧选择技能或新建技能</p>
                </div>
            )}
          </div>
        </Splitter>

        <SlidePanel
            open={showInfoPanel}
            title="技能信息"
            type="medium"
            placement="right"
            hasCloseButton
            closable
            confirmButtonText="保存"
            closeButtonText="关闭"
            onConfirm={handleSaveInfoPanel}
            onClose={() => setShowInfoPanel(false)}
        >
          <Form form={infoForm} layout="vertical" style={{padding: '0 4px'}}>
            <Form.Item name="name" label="技能名称" rules={[{required: true, message: '请输入技能名称'}]}>
              <Input placeholder="请输入技能名称"/>
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={4} placeholder="技能描述（可选）"/>
            </Form.Item>
            <Form.Item name="tags" label="标签">
              <Select
                  mode="tags"
                  placeholder="输入标签后回车添加"
                  style={{width: '100%'}}
                  tokenSeparators={[',']}
              />
            </Form.Item>
          </Form>
        </SlidePanel>

        {/* 文件管理面板 */}
        <SlidePanel
            open={showFilePanel}
            title={`附件文件 - ${editingSkill?.name || ''}`}
            type="huge"
            placement="right"
            hasCloseButton
            closable
            showFooter={false}
            bodyPadding="0"
            onClose={() => { setShowFilePanel(false); setSelectedFile(null); setFileContent(''); }}
        >
          <div className="skill-file-panel" style={{height: h - 50}}>
            {/* 左列：文件树 */}
            <div className="skill-file-left">
              <div className="skill-file-toolbar">
                <span className="skill-file-toolbar-title">文件列表</span>
                <div className="skill-file-toolbar-actions">
                  <IconButton
                      icon="refresh"
                      size={32}
                      shape="square"
                      tooltip="刷新"
                      onClick={loadSkillFiles}
                  />
                </div>
              </div>
              <div className="skill-file-tree">
                <Tree
                    data={buildFileTree()}
                    height={h - 50 - 44}
                    folderIcon="folder"
                    itemIcon="document"
                    groupMenu={fileFolderMenu}
                    menuItemClick={handleFolderMenuItemClick}
                    onSelect={handleFileSelect}
                    defaultExpandedKeys={PRESET_FOLDERS}
                    clickToCollapse={false}
                />
              </div>
            </div>

            {/* 右列：文件内容 */}
            <div className="skill-file-right">
              {fileLoading ? (
                <div className="skill-file-empty"><Spin tip="加载中..." /></div>
              ) : selectedFile ? (
                <div className="skill-file-content">
                  <div className="skill-file-content-header">
                    <span className="skill-file-content-path">{selectedFile.path}</span>
                    <div className="skill-file-content-actions">
                      {selectedFile.size != null && (
                        <span className="skill-file-content-size">
                          {selectedFile.size > 1024 ? `${(selectedFile.size / 1024).toFixed(1)} KB` : `${selectedFile.size} B`}
                        </span>
                      )}
                      <Button type="default" size="small" onClick={() => handleDeleteFile(selectedFile)}>
                        删除
                      </Button>
                    </div>
                  </div>
                  {isTextFile(selectedFile.name || '', selectedFile.mimeType) ? (
                    <div className="skill-file-content-editor">
                      <CodeEditor
                          content={fileContent}
                          width="100%"
                          height={h - 50 - 44 - 2}
                          language={getLanguage(selectedFile.name || '')}
                          border
                          showMap={false}
                          readOnly
                      />
                    </div>
                  ) : (
                    <div className="skill-file-binary-info">
                      <Icon name="file" size={48} />
                      <p>二进制文件，无法预览</p>
                      <p className="skill-file-binary-detail">
                        {selectedFile.name} · {selectedFile.mimeType || '未知类型'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="skill-file-empty">
                  <p>选择文件查看内容</p>
                </div>
              )}
            </div>
          </div>
        </SlidePanel>
      </div>
  );
};

export default connect(({global, skill}: any) => ({
  frameSize: global.frameSize,
  skill,
}))(SkillPage);
