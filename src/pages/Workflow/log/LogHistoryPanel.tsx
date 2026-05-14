import React, {useEffect, useMemo, useState} from "react";
import {connect} from 'umi';
import Markdown from '@/components/Markdown';
import type {MenuProps} from "antd";
import {Dropdown} from "antd";
import {Dialog, Icon, Message} from 'air-design';
import './LogHistoryPanel.less';
import './RealtimeLogPanel.less';

const LogHistoryPanel: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    flowId,
  } = props;

  const [logList, setLogList] = useState<any[]>([]);
  const [taskLog, setTaskLog] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  /**
   * 将文本内容下载为文件
   *
   * 设计思路：
   * - 通过 Blob + ObjectURL 在浏览器端生成文件下载
   * - 不依赖后端，避免引入新的接口与文件服务逻辑
   */
  const downloadTextFile = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], {type: 'text/markdown;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 延迟释放，避免部分浏览器下载被中断
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      Message.error(`下载失败：${e?.message || '未知错误'}`);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  };

  /**
   * 生成可用于文件名的安全字符串
   * - 移除 Windows/macOS 不允许的字符
   * - 控制长度，避免文件名过长
   */
  const toSafeFilename = (name: string, fallback: string) => {
    const raw = (name || '').trim() || fallback;
    const cleaned = raw
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_');
    return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned;
  };

  /**
   * 将任务日志转换为 Markdown
   *
   * 设计思路：
   * - 以“任务执行记录”为单位导出（左侧列表项即一次任务执行）
   * - 每条日志用二级标题分段，便于阅读与检索
   * - 日志 content 可能本身已是 Markdown，保持原样输出
   */
  const buildTaskLogMarkdown = (task: any, logs: any[]) => {
    const taskTitle = task?.description || '任务';
    const startedAt = task?.createdTime ? formatTime(task.createdTime) : '';
    const taskMode = task?.taskMode ? String(task.taskMode) : '';
    const headerLines = [
      `# 工作流执行日志`,
      ``,
      `- 任务：${taskTitle}`,
      startedAt ? `- 开始时间：${startedAt}` : '',
      taskMode ? `- 模式：${taskMode}` : '',
      task?.taskId ? `- taskId：${task.taskId}` : '',
      ``,
      `---`,
      ``,
    ].filter(Boolean);

    const bodyLines: string[] = [];
    (logs || []).forEach((log: any, index: number) => {
      const time = log?.createdTime ? formatTime(log.createdTime) : '';
      const nodeName = log?.nodeName ? String(log.nodeName) : '';
      const actionType = log?.actionType ? String(log.actionType) : '';
      const status = log?.status ? String(log.status) : '';
      const logType = log?.logType ? String(log.logType) : '';
      const logLevel = log?.logLevel ? String(log.logLevel) : '';

      bodyLines.push(`## ${time || `日志 #${index + 1}`}${nodeName ? ` - ${nodeName}` : ''}`);
      bodyLines.push(``);

      const meta: string[] = [];
      if (logType) meta.push(`- 类型：${logType}`);
      if (actionType) meta.push(`- 操作：${actionType}`);
      if (status) meta.push(`- 状态：${status}`);
      if (logLevel) meta.push(`- 级别：${logLevel}`);
      if (meta.length > 0) {
        bodyLines.push(...meta);
        bodyLines.push(``);
      }

      if (log?.content) {
        bodyLines.push(String(log.content));
        bodyLines.push(``);
      }
      if (log?.errorMessage) {
        bodyLines.push(`### 错误信息`);
        bodyLines.push(``);
        bodyLines.push(String(log.errorMessage));
        bodyLines.push(``);
      }
      if (log?.errorStack) {
        bodyLines.push(`### 堆栈信息`);
        bodyLines.push(``);
        bodyLines.push('```');
        bodyLines.push(String(log.errorStack));
        bodyLines.push('```');
        bodyLines.push(``);
      }

      bodyLines.push(`---`);
      bodyLines.push(``);
    });

    return [...headerLines, ...bodyLines].join('\n');
  };

  const fetchWorkflowTaskLog = (taskId: string) => {
    if (!taskId) {
      return;
    }

    setSelectedTaskId(taskId);
    dispatch({
      type: 'workflow/fetchWorkflowTaskLog',
      payload: {
        taskId: taskId
      },
      callback: (resp: any) => {
        if (resp.success && resp.data) {
          // 按时间正序排列
          const logs = resp.data.sort((a: any, b: any) => a.createdTime - b.createdTime);
          setTaskLog(logs);
        }
      }
    });
  };

  /**
   * 导出某个任务的日志为 Markdown
   * - 如果该任务当前已选中，则直接使用已加载的 taskLog
   * - 否则先请求后端拉取该 taskId 的完整日志，再导出
   */
  const exportTaskLogAsMarkdown = (task: any) => {
    if (!task?.taskId) {
      Message.warning('日志数据异常：缺少 taskId');
      return;
    }

    const doExport = (logs: any[]) => {
      const md = buildTaskLogMarkdown(task, logs || []);
      const base = toSafeFilename(task?.description || '任务', '任务');
      const timePart = task?.createdTime ? toSafeFilename(formatTime(task.createdTime), 'time') : 'time';
      const filename = `${base}_${timePart}.md`;
      downloadTextFile(md, filename);
      Message.success('已导出 Markdown 到本地');
    };

    // 已选中并且已有日志数据时，直接导出，避免重复请求
    if (selectedTaskId === task.taskId && Array.isArray(taskLog) && taskLog.length > 0) {
      doExport(taskLog);
      return;
    }

    dispatch({
      type: 'workflow/fetchWorkflowTaskLog',
      payload: {taskId: task.taskId},
      callback: (resp: any) => {
        if (resp?.success && Array.isArray(resp.data)) {
          const logs = resp.data.sort((a: any, b: any) => (a.createdTime || 0) - (b.createdTime || 0));
          doExport(logs);
        } else {
          Message.error(resp?.message || '导出失败：获取日志失败');
        }
      }
    });
  };

  /**
   * 删除左侧列表中的某个执行记录（当前实现：前端本地删除）
   *
   * 说明：
   * - 目前 `workflow` model 仅提供 `clearLog`（清空）接口，缺少“按 taskId 删除单条记录”的 effect
   * - 为避免误清空其它任务日志，这里先做本地删除，后续如后端提供删除接口，可在此处补充 dispatch 调用
   */
  const deleteLogListItem = (task: any) => {
    if (!task?.taskId) {
      Message.warning('日志数据异常：缺少 taskId');
      return;
    }

    Dialog({
      title: '删除执行记录',
      content: `确认删除“${task.description || '任务'}”的执行记录吗？该操作会从数据库中彻底删除该次执行的全部日志，且无法恢复。`,
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'workflow/deleteWorkflowTaskLog',
          payload: {taskId: task.taskId},
          callback: (resp: any) => {
            if (resp?.success) {
              setLogList(prev => {
                const next = (prev || []).filter((x: any) => x?.taskId !== task.taskId);

                // 如果删除的是当前选中项，则自动切换到下一条（如果存在）
                if (selectedTaskId === task.taskId) {
                  const nextTask = next.length > 0 ? next[0] : null;
                  if (nextTask?.taskId) {
                    fetchWorkflowTaskLog(nextTask.taskId);
                  } else {
                    setSelectedTaskId(null);
                    setTaskLog([]);
                  }
                }
                return next;
              });
              dlg.doCancel();
              Message.success(resp?.message || '删除成功');
            } else {
              Message.error(resp?.message || '删除失败');
            }
          }
        });
      }
    });
  };

  const getTaskMenuItems = useMemo(() => {
    return (task: any): MenuProps['items'] => ([
      {
        key: 'export',
        label: '导出',
        onClick: (e: any) => {
          // antd menu 的 onClick 可能携带 domEvent，这里保证不会触发父级 onClick
          if (e?.domEvent?.stopPropagation) e.domEvent.stopPropagation();
          exportTaskLogAsMarkdown(task);
        }
      },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        onClick: (e: any) => {
          if (e?.domEvent?.stopPropagation) e.domEvent.stopPropagation();
          deleteLogListItem(task);
        }
      }
    ]);
  }, [selectedTaskId, taskLog]);

  useEffect(() => {
    if (!flowId) {
      return;
    }

    // 加载工作流的任务列表
    dispatch({
      type: 'workflow/fetchWorkflowLogList',
      payload: {
        flowId: flowId
      },
      callback: (resp: any) => {
        if (resp.success && resp.data && Array.isArray(resp.data)) {
          // 后端已经过滤出已完成的任务（有"任务执行完成"或"任务执行失败"日志的任务）
          // 这里只需要过滤出"任务开始"的系统日志，按时间倒序
          const tasks = resp.data
              .filter((log: any) => {
                // 后端已按 action_type='start' 过滤，前端只需确认数据有效性
                return log && log.taskId;
              })
              .sort((a: any, b: any) => {
                const timeA = a.createdTime || 0;
                const timeB = b.createdTime || 0;
                return timeB - timeA; // 倒序
              });

          setLogList(tasks);

          // 默认选中第一个任务
          if (tasks.length > 0 && tasks[0].taskId) {
            fetchWorkflowTaskLog(tasks[0].taskId);
          }
        }
      }
    });

    return () => {
      setLogList([]);
      setTaskLog([]);
      setSelectedTaskId(null);
    }
  }, [flowId]);

  return (
      <div className="agent-log-panel" style={{height: frameSize.slideHeight - 50}}>
        <div className="agent-log-panel-list" style={{height: frameSize.slideHeight - 50}}>
          {logList.length === 0 ? (
              <div style={{padding: 20, textAlign: 'center', color: '#999'}}>暂无执行记录</div>
          ) : (
              logList.map((log: any) => {
                if (!log || !log.taskId) {
                  console.warn('日志数据异常:', log);
                  return null;
                }
                return (
                    <div
                        key={log.id || log.taskId}
                        className={`agent-log-panel-list-item ${selectedTaskId === log.taskId ? 'selected' : ''}`}
                        onClick={() => fetchWorkflowTaskLog(log.taskId)}
                    >
                      <div className="list-item-content">
                        <div className="list-item-actions" onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                              menu={{items: getTaskMenuItems(log)}}
                              placement="bottomRight"
                              trigger={['click']}
                              destroyOnHidden={true}
                          >
                            <div
                                className="list-item-more-btn"
                                onClick={(e) => {
                                  // 防止点击菜单按钮时触发列表项选中
                                  e.stopPropagation();
                                }}
                            >
                              <Icon name="more" size={18}/>
                            </div>
                          </Dropdown>
                        </div>
                        <div className="list-item-description">
                          {log.description || '任务'}
                        </div>
                        <div className="list-item-meta">
                          <span className="list-item-time">{formatTime(log.createdTime)}</span>
                          {log.taskMode && (
                              <span className="list-item-mode">{log.taskMode}</span>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>
        <div className="agent-log-panel-content log-container" style={{height: frameSize.slideHeight - 50}}>
          {!selectedTaskId ? (
              <div style={{padding: 20, textAlign: 'center', color: '#8c8c8c'}}>请选择一个任务查看日志</div>
          ) : taskLog.length === 0 ? (
              <div style={{padding: 20, textAlign: 'center', color: '#8c8c8c'}}>该任务暂无日志</div>
          ) : (
              taskLog.map((log: any) => {
                // 判断日志样式类型
                const getLogStyleType = (): 'style-1' | 'style-2' | 'style-3' => {
                  if (log.logType === 'task') return 'style-1';
                  if (log.taskMode === 'agent' && log.logType === 'step') return 'style-3';
                  if (log.logType === 'node') return 'style-2';
                  if (log.logType === 'step') return 'style-3';
                  return 'style-2';
                };

                const styleType = getLogStyleType();
                const isError = log.logLevel === 'error' || log.status === 'failed';
                const isWarning = log.logLevel === 'warning';

                // 获取状态文本
                const getStatusText = (status?: string) => {
                  if (!status) return '';
                  const statusMap: Record<string, string> = {
                    'success': '成功',
                    'failed': '失败',
                    'running': '运行中',
                    'skipped': '跳过',
                  };
                  return statusMap[status] || status;
                };

                // 样式一：系统日志
                if (styleType === 'style-1') {
                  return (
                      <div
                          key={log.id}
                          className={`log-item-style-1 ${isError ? 'log-item-error' : ''}`}
                      >
                        <div className="log-header-bar">
                          <div className="header-left">
                            <div className="title">{log.content || '系统消息'}</div>
                          </div>
                          <div className="header-right">
                            <span className="time">{formatTime(log.createdTime)}</span>
                          </div>
                        </div>
                      </div>
                  );
                }

                // 样式三：智能体迭代
                if (styleType === 'style-3') {
                  return (
                      <div
                          key={log.id}
                          className={`log-item-style-3 ${isError ? 'log-item-error' : isWarning ? 'log-item-warning' : ''}`}
                      >
                        <div className="log-header-bar">
                          <div className="header-left">
                            <div className="iteration-info">
                              <div className="iteration-title">{log.nodeName || '智能体迭代'}</div>
                              <div className="iteration-desc">
                                {log.actionTypeText ?? log.actionType ? `操作: ${log.actionTypeText ?? log.actionType}` : '智能体执行中'}
                              </div>
                            </div>
                          </div>
                          <div className="header-right">
                            <span className="time">{formatTime(log.createdTime)}</span>
                          </div>
                        </div>
                        {log.content && (
                            <div className="log-content">
                              <Markdown content={log.content}/>
                            </div>
                        )}
                      </div>
                  );
                }

                // 样式二：节点日志
                return (
                    <div
                        key={log.id}
                        className={`log-item-style-2 ${isError ? 'log-item-error' : isWarning ? 'log-item-warning' : ''}`}
                    >
                      <div className="log-header-bar">
                        <div className="header-left">
                          <div className="node-name">{log.nodeName || '节点'}</div>
                          {(log.actionTypeText ?? log.actionType) && (
                              <div className="action-type">{log.actionTypeText ?? log.actionType}</div>
                          )}
                        </div>
                        <div className="header-right">
                          {log.status && (
                              <span className={`status ${log.status}`}>
                        {getStatusText(log.status)}
                      </span>
                          )}
                          <span className="time">{formatTime(log.createdTime)}</span>
                        </div>
                      </div>
                      {log.content && (
                          <div className="log-content">
                            <Markdown content={log.content}/>
                          </div>
                      )}
                      {log.errorMessage && (
                          <div style={{
                            padding: 8,
                            marginTop: 4,
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: 3,
                            fontSize: 12
                          }}>
                            <div style={{fontWeight: 500, color: '#ff7875', marginBottom: 4}}>错误信息：</div>
                            <div style={{color: '#ff7875'}}>{log.errorMessage}</div>
                            {log.errorStack && (
                                <div style={{marginTop: 6, paddingTop: 6, borderTop: '1px solid #ffccc7'}}>
                                  <div style={{fontWeight: 500, color: '#ff7875', marginBottom: 4}}>堆栈信息：</div>
                                  <pre style={{
                                    margin: 0,
                                    fontSize: 11,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    color: '#ff7875'
                                  }}>
                          {log.errorStack}
                        </pre>
                                </div>
                            )}
                          </div>
                      )}
                    </div>
                );
              })
          )}
        </div>
      </div>
  );
};

export default connect(({global}) => ({
  frameSize: global.frameSize
}))(LogHistoryPanel);
