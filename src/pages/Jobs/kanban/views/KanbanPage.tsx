import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'umi';
import {Dialog, IconButton, Message, Splitter, TableRowMenu} from 'air-design';
import {Form, Input, Select} from 'antd';
import Kanban from '@/components/Kanban';
import type {ActionProps, ActionStatus} from '@/components/Kanban/KanbanProps';
import './KanbanPage.less';

/**
 * 任务看板页面
 *
 * 看板数据由 kanban model 管理，按 PlanSession 隔离。工作由智能体分解并在看板流转。
 * 侧边栏分为查看（只读）与编辑两种模式。
 *
 * Created by ChaiMingXu, on 2026-02-10
 */
/** 状态变更记录项（与后端 TaskStatusLogVO 对齐） */
interface TaskStatusLogItem {
  id: string;
  taskId: string;
  fromStatusId: string;
  toStatusId: string;
  reason?: string;
  operatorId?: string;
  operatorName?: string;
  createTime?: string;
  fromStatusName?: string;
  toStatusName?: string;
}

/** JobSession 项 */
interface JobSessionItem {
  id: string;
  jobId: string;
  sessionId: string;
  status?: string;
  statusText?: string;
  createTime?: string;
}

/** 工作执行日志项 */
interface JobLogItem {
  id: string;
  jobId?: string;
  sessionId?: string;
  content?: string;
  level?: string;
  createTime?: string;
}

interface KanbanPageProps {
  width: number;
  height: number;
  dispatch: (arg: any) => void;
  kanban: {
    columns: ActionStatus[];
    loading?: boolean;
    taskStatusLogList?: TaskStatusLogItem[];
    jobSessionList?: JobSessionItem[];
    currentSessionId?: string | null;
    jobLogList?: JobLogItem[];
  };
  userList?: any[];
}

/** 从看板列中扁平化出所有任务（用于前置任务选择等） */
function flattenTasks(columns: ActionStatus[]): ActionProps[] {
  return (columns || []).flatMap((c) => c.tasks || []);
}

const SESSION_LIST_EXPANDED_WIDTH = 220;
const SESSION_LIST_COLLAPSED_WIDTH = 40;
/** 左中右三部分顶层 header 固定高度 */
const HEADER_HEIGHT = 50;
/** 任务日志栏缺省宽度（Splitter primary 部分） */
const LOG_PANEL_DEFAULT_WIDTH = 320;
/** 任务日志栏最小宽度 */
const LOG_PANEL_MIN_WIDTH = 280;

/** localStorage 存储项 key */
const UI_STORAGE_KEY = 'machine:teams:kanban:ui';

/** UI 状态持久化数据结构 */
interface KanbanUIState {
  /** 左侧运行栏是否展开 */
  showRunPanel?: boolean;
  /** 右侧详情栏宽度 */
  logPaneSize?: number;
}

/** 从 localStorage 读取 UI 设置 */
function loadUISettings(): KanbanUIState {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

/** 保存 UI 设置到 localStorage */
function saveUISettings(state: KanbanUIState): void {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const KanbanPage: React.FC<KanbanPageProps> = props => {
  const {width, height, dispatch, kanban, userList = []} = props;
  const columns = kanban?.columns ?? [];
  const jobSessionList = kanban?.jobSessionList ?? [];
  const currentSessionId = kanban?.currentSessionId ?? null;
  const selectedSession = jobSessionList.find((s: JobSessionItem) => s.sessionId === currentSessionId);

  /** 页面载入时读取 localStorage 中的 UI 设置 */
  const savedUI = React.useMemo(() => loadUISettings(), []);

  /** 左侧运行栏是否展开，模仿智能工作流页面 */
  const [showRunPanel, setShowRunPanel] = useState(savedUI.showRunPanel ?? true);
  const runPanelWidth = showRunPanel ? SESSION_LIST_EXPANDED_WIDTH : SESSION_LIST_COLLAPSED_WIDTH;

  /** 任务日志栏宽度（Splitter primary=second 时由 onChange 更新，用于计算看板区宽度） */
  const [logPaneSize, setLogPaneSize] = useState(savedUI.logPaneSize ?? LOG_PANEL_DEFAULT_WIDTH);

  /** UI 状态变化时保存到 localStorage */
  useEffect(() => {
    saveUISettings({showRunPanel, logPaneSize});
  }, [showRunPanel, logPaneSize]);

  const [editingTaskId, setEditingTaskId] = useState<string>('');
  const [editingColumnId, setEditingColumnId] = useState<string>('');
  const [createTaskForm] = Form.useForm();
  const [moveReasonForm] = Form.useForm();

  /** 加载用户列表（用于负责人选择） */
  useEffect(() => {
    dispatch({type: 'user/fetchUsers', payload: {}});
  }, [dispatch]);

  /**
   * 页面加载时拉取 JobSession 列表（全部，不按 Plan 分组）
   */
  useEffect(() => {
    dispatch({type: 'kanban/fetchJobSessionList', payload: {}});
  }, [dispatch]);

  /**
   * 按 sessionId 拉取看板数据
   * 当 sessionId 存在时，仅显示该 Session 关联的任务；未选 Session 时返回空任务列表
   */
  useEffect(() => {
    dispatch({
      type: 'kanban/fetchBoard',
      payload: {
        sessionId: currentSessionId ?? undefined,
        requireSession: true,
      },
      callback: (resp: any) => {
        if (!resp?.success) {
          Message.error(`加载任务看板失败：${resp?.message || '未知错误'}`);
        }
      },
    });
  }, [dispatch, currentSessionId]);

  /** 当前 Session 变化时拉取工作执行日志（运行日志栏） */
  useEffect(() => {
    const jobId = selectedSession?.jobId;
    if (!jobId) {
      dispatch({type: 'kanban/setJobLogList', payload: []});
      return;
    }
    dispatch({
      type: 'kanban/fetchJobLogList',
      payload: {jobId, sessionId: currentSessionId ?? undefined},
    });
  }, [dispatch, currentSessionId, selectedSession?.jobId]);

  /** 看板列数据变化时同步当前任务所在列（例如变更状态后任务已移动到新列） */
  useEffect(() => {
    if (editingTaskId && columns.length) {
      const col = columns.find((c) => c.tasks?.some((t) => t.id === editingTaskId));
      if (col) setEditingColumnId(col.id);
    }
  }, [columns, editingTaskId]);

  /** 点击任务时加载该任务的状态变更记录 */
  useEffect(() => {
    if (editingTaskId) {
      dispatch({type: 'kanban/fetchTaskStatusLogList', payload: {taskId: editingTaskId}});
    } else {
      dispatch({type: 'kanban/setTaskStatusLogList', payload: []});
    }
  }, [dispatch, editingTaskId]);

  const handleStatusChange = useCallback(
    (statusList: ActionStatus[]) => {
      dispatch({type: 'kanban/setColumns', payload: statusList});
    },
    [dispatch]
  );

  const handleTaskChange = useCallback(
    (statusList: ActionStatus[]) => {
      dispatch({type: 'kanban/setColumns', payload: statusList});
    },
    [dispatch]
  );

  /**
   * 同状态列内拖动排序：由 model 调用后端重排接口
   */
  const handleTaskReorder = useCallback(
    (payload: {
      taskId: string;
      statusId: string;
      fromIndex: number;
      toIndex: number;
      orderedTaskIds: string[];
    }) => {
      if (!payload.orderedTaskIds?.length) return;
      dispatch({
        type: 'kanban/reorderTask',
        payload: {statusId: payload.statusId, taskIds: payload.orderedTaskIds},
        callback: (resp: any) => {
          if (resp?.success) Message.success('排序已保存');
          else Message.error(`保存排序失败：${resp?.message || '未知错误'}`);
        },
      });
    },
    [dispatch]
  );

  /**
   * 跨状态列拖动：弹出变更原因对话框，确认后调用 changeTaskStatus（写 log 并移动任务），再刷新看板
   */
  const handleTaskMove = useCallback(
    (payload: { taskId: string; fromStatusId: string; toStatusId: string; toIndex: number }) => {
      moveReasonForm.resetFields();
      Dialog({
        title: '变更状态',
        width: 440,
        okText: '确定变更',
        cancelText: '取消',
        content: (
          <Form form={moveReasonForm} layout="vertical">
            <Form.Item label="变更原因" name="reason">
              <Input.TextArea rows={3} placeholder="请填写变更原因（可选）"/>
            </Form.Item>
          </Form>
        ),
        onConfirm: (dlg: any) => {
          const values = moveReasonForm.getFieldsValue();
          const raw = values?.reason?.trim() ?? '';
          const toStatusName = columns.find((c) => c.id === payload.toStatusId)?.name ?? payload.toStatusId;
          const reason = raw || `变更为${toStatusName}`;
          dispatch({
            type: 'kanban/changeTaskStatus',
            payload: {
              taskId: payload.taskId,
              toStatusId: payload.toStatusId,
              reason,
            },
            callback: (resp: any) => {
              if (resp?.success) {
                Message.success('状态已变更');
                dlg?.doCancel?.();
                dispatch({
                  type: 'kanban/fetchBoard',
                  payload: {sessionId: currentSessionId ?? undefined, requireSession: true}
                });
              } else {
                Message.error(`变更失败：${resp?.message || '未知错误'}`);
              }
            },
          });
        },
      });
    },
    [columns, dispatch, currentSessionId, moveReasonForm]
  );

  /** 在指定列添加任务：支持标题、描述、负责人、优先级、前置任务（截止日期已屏蔽） */
  const handleAddTask = useCallback(
    (columnId: string) => {
      createTaskForm.resetFields();
      const allTasks = flattenTasks(columns);
      Dialog({
        title: '新建任务',
        width: 520,
        okText: '创建',
        cancelText: '取消',
        content: (
          <Form form={createTaskForm} layout="vertical">
            <Form.Item
              label="标题"
              name="title"
              rules={[{required: true, message: '请输入任务标题'}]}
            >
              <Input placeholder="请输入任务标题"/>
            </Form.Item>
            <Form.Item label="描述" name="description">
              <Input.TextArea rows={4} placeholder="请输入任务描述（可选）"/>
            </Form.Item>
            <Form.Item label="负责人" name="assigneeId">
              <Select
                allowClear
                placeholder="请选择负责人"
                options={(userList || []).map((u: any) => ({label: u.name || u.id, value: u.id}))}
              />
            </Form.Item>
            <Form.Item label="优先级" name="priority">
              <Select
                allowClear
                placeholder="请选择优先级"
                options={[
                  {label: '高', value: 'high'},
                  {label: '中', value: 'medium'},
                  {label: '低', value: 'low'},
                ]}
              />
            </Form.Item>
            <Form.Item label="前置任务" name="predecessorTaskId">
              <Select
                allowClear
                placeholder="请选择前置任务（可选）"
                options={allTasks.map((t) => ({label: t.title || t.id, value: t.id}))}
              />
            </Form.Item>
          </Form>
        ),
        onConfirm: async (dlg: any) => {
          const values = await createTaskForm.validateFields();
          const t = (values?.title || '').trim();
          const description = values?.description ?? '';
          const assigneeId = values?.assigneeId ?? undefined;
          const priority = values?.priority ?? undefined;
          const predecessorTaskId = values?.predecessorTaskId ?? undefined;
          if (!t) {
            Message.warning('请输入任务标题');
            return;
          }
          dispatch({
            type: 'kanban/createTask',
            payload: {
              columnId,
              title: t,
              description,
              jobId: selectedSession?.jobId,
              sessionId: currentSessionId ?? undefined,
              assigneeId,
              priority,
              predecessorTaskId
            },
            callback: (resp: any) => {
              if (resp?.success) {
                Message.success('创建任务成功');
                dlg?.doCancel?.();
              } else {
                Message.error(`创建任务失败：${resp?.message || '未知错误'}`);
              }
            },
          });
        },
      });
    },
    [columns, createTaskForm, dispatch, selectedSession?.jobId, currentSessionId, userList]
  );

  /** 删除指定列下的任务：由 model 调用删除接口并更新 columns */
  const handleDeleteTask = useCallback(
    (columnId: string, taskId: string) => {
      Dialog({
        title: '删除任务',
        message: '确定删除该任务吗？',
        okText: '删除',
        cancelText: '取消',
        onConfirm: (dlg: any) => {
          dispatch({
            type: 'kanban/deleteTask',
            payload: {columnId, taskId},
            callback: (resp: any) => {
              if (resp?.success) {
                Message.success('删除成功');
                dlg?.doCancel?.();
              } else {
                Message.error(`删除失败：${resp?.message || '未知错误'}`);
              }
            },
          });
        },
      });
    },
    [dispatch]
  );

  /** 点击任务卡片：高亮选中 */
  const handleTaskClick = useCallback((columnId: string, taskId: string) => {
    setEditingTaskId(taskId);
    setEditingColumnId(columnId);
  }, []);

  /** 删除运行记录（Session）及其关联任务 */
  const handleDeleteSession = useCallback((session: JobSessionItem) => {
    Dialog({
      title: '删除运行记录',
      width: 420,
      message: `确定删除运行记录「${session.sessionId}」吗？\n此操作将同时删除该运行关联的所有任务。`,
      okText: '删除',
      cancelText: '取消',
      onConfirm: (dlg: any) => {
        dispatch({
          type: 'kanban/deleteJobSession',
          payload: {sessionId: session.sessionId},
          callback: (resp: any) => {
            if (resp?.success) {
              Message.success('删除成功');
              dlg?.doCancel?.();
              // 如果删除的是当前选中的 session，清除选中状态
              if (currentSessionId === session.sessionId) {
                dispatch({type: 'kanban/setCurrentSessionId', payload: null});
                setEditingTaskId('');
                setEditingColumnId('');
              }
              // 刷新列表
              dispatch({type: 'kanban/fetchJobSessionList', payload: {}});
              dispatch({
                type: 'kanban/fetchBoard',
                payload: {
                  sessionId: currentSessionId === session.sessionId ? undefined : currentSessionId ?? undefined,
                  requireSession: true
                }
              });
            } else {
              Message.error(resp?.message || '删除失败');
            }
          },
        });
      },
    });
  }, [dispatch, currentSessionId]);

  const centerPadding = 4;
  const BOARD_TITLE_HEIGHT = HEADER_HEIGHT;
  /** 右侧整体宽度（Session 列表右侧全部为 Splitter：看板 + 任务日志） */
  const rightSideWidth = Math.max(0, width - runPanelWidth);
  /** 看板区宽度（Splitter 左侧 pane，随拖动变化） */
  const kanbanPaneWidth = Math.max(0, rightSideWidth - logPaneSize - 1);
  const boardHeight = Math.max(0, height - BOARD_TITLE_HEIGHT);

  const jobLogList = kanban?.jobLogList ?? [];

  return (
    <div className="kanban-page" style={{width, height}}>
      {/* 左侧：运行栏，可折叠，展开 220px，折叠 40px，模仿智能工作流 */}
      <div
        className={`kanban-page__session-list${!showRunPanel ? ' kanban-page__session-list--collapsed' : ''}`}
        style={{width: runPanelWidth}}
      >
        {showRunPanel ? (
          <>
            <div className="kanban-page__panel-header kanban-page__panel-header--with-toolbar"
                 style={{height: HEADER_HEIGHT}}>
              <span>
                工作
                {jobSessionList.length > 0 ? (
                  <span className="kanban-page__session-list-badge">{jobSessionList.length}</span>
                ) : null}
              </span>
              <IconButton icon="toggle_left" size={28} shape="circle" onClick={() => setShowRunPanel(false)}
                          tooltip="折叠"/>
            </div>
            <div className="kanban-page__session-list-body"
                 style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
              {jobSessionList.length === 0 ? (
                <div className="kanban-page__session-list-empty">暂无执行记录</div>
              ) : (
                <ul className="kanban-page__session-list-items">
                  {jobSessionList.map((s: JobSessionItem) => (
                    <li
                      key={s.id}
                      className={`kanban-page__session-item${currentSessionId === s.sessionId ? ' kanban-page__session-item--active' : ''}`}
                      onClick={() => dispatch({type: 'kanban/setCurrentSessionId', payload: s.sessionId})}
                    >
                      <div className="kanban-page__session-item-header">
                        <div className="kanban-page__session-item-id">
                          {s.sessionId}
                        </div>
                      </div>
                      <div className="kanban-page__session-item-meta">
                        <span className="kanban-page__session-item-info">
                          {s.statusText || s.status} · {s.createTime ? new Date(s.createTime).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                        </span>
                        <span
                          className="kanban-page__session-item-more"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TableRowMenu
                            items={[
                              {
                                key: 'delete',
                                label: '删除',
                                onClick: () => handleDeleteSession(s),
                                danger: true,
                              },
                            ]}
                            data={s}
                          >
                            <IconButton
                              icon="more"
                              size={14}
                              shape="square"
                              bordered={false}
                              tooltip="更多操作"
                            />
                          </TableRowMenu>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div
            className="kanban-page__session-list-collapsed"
            style={{width: SESSION_LIST_COLLAPSED_WIDTH, height}}
            onClick={() => setShowRunPanel(true)}
          >
            <span>工作</span>
          </div>
        )}
      </div>

      {/* 右侧：Splitter 垂直拆分为「任务看板」与「任务日志」，任务日志为 primary，缺省 320px，最小 280px */}
      <div className="kanban-page__right-side"
           style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        <Splitter
          split="vertical"
          primary="second"
          defaultSize={logPaneSize}
          minSize={LOG_PANEL_MIN_WIDTH}
          style={{width: rightSideWidth, height, flex: 1}}
          onChange={(size: number) => setLogPaneSize(size)}
          collapsible={false}
        >
          {/* 左侧：任务看板 */}
          <div className="kanban-page__board-wrap" style={{width: kanbanPaneWidth, height}}>
            <div className="kanban-page__board" style={{width: kanbanPaneWidth, height}}>
              <div className="kanban-page__board-title" style={{height: HEADER_HEIGHT}}>任务</div>
              <div className="kanban-page__board-body" style={{flex: 1, minHeight: 0}}>
                <Kanban
                  data={columns}
                  readonly={true}
                  selectedTaskId={editingTaskId || undefined}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onTaskClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                  onTaskChange={handleTaskChange}
                  onTaskReorder={handleTaskReorder}
                  onTaskMove={handleTaskMove}
                  width={Math.max(0, kanbanPaneWidth - centerPadding * 2)}
                  height={Math.max(0, boardHeight - centerPadding * 2)}
                />
              </div>
            </div>
          </div>

          {/* 右侧：任务详情或运行日志（primary，缺省 320px，最小 280px） */}
          <div className="kanban-page__log-panel-wrap" style={{width: logPaneSize, height}}>
            <div className="kanban-page__log-panel">
              <div className="kanban-page__log-panel-title" style={{height: HEADER_HEIGHT}}>
                {editingTaskId ? '任务详情' : '详情'}
              </div>
              <div className="kanban-page__log-panel-content">
                {editingTaskId ? (
                  (() => {
                    const allTasks = flattenTasks(columns);
                    const task = allTasks.find(t => t.id === editingTaskId);
                    const currentCol = columns.find(c => c.tasks?.some(t => t.id === editingTaskId));
                    if (!task) {
                      return <div className="kanban-page__log-panel-empty">任务不存在</div>;
                    }
                    const priorityMap: Record<string, string> = {high: '高', medium: '中', low: '低'};
                    const taskLogs = (kanban?.taskStatusLogList || []).filter(l => l.taskId === editingTaskId);
                    return (
                      <div className="kanban-page__task-view">
                        <div className="kanban-page__view-card kanban-page__view-card--basic">
                          <span className="kanban-page__view-value kanban-page__view-value--main-title">
                            {task.title || task.content || '未命名任务'}
                          </span>
                          {task.description ? (
                            <div className="kanban-page__view-field kanban-page__view-field--no-label"
                                 style={{marginTop: 12}}>
                                      <span
                                        className="kanban-page__view-value kanban-page__view-value--block">{task.description}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="kanban-page__view-card kanban-page__view-card--status-row">
                          <div className="kanban-page__status-row">
                            <span className="kanban-page__status-label">当前状态</span>
                            <span className="kanban-page__view-value kanban-page__view-value--status">
                              {currentCol?.name || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="kanban-page__view-card">
                          <div className="kanban-page__view-meta">
                            <div className="kanban-page__view-meta-row">
                              <span className="kanban-page__view-meta-label">负责人</span>
                              <span className="kanban-page__view-meta-value">
                                {task.assigneeName || (userList.find((u: any) => u.id === task.assigneeId)?.name) || '-'}
                              </span>
                            </div>
                            <div className="kanban-page__view-meta-row">
                              <span className="kanban-page__view-meta-label">优先级</span>
                              <span className="kanban-page__view-meta-value">
                                {task.priority ? priorityMap[task.priority] || task.priority : '-'}
                              </span>
                            </div>
                            <div className="kanban-page__view-meta-row">
                              <span className="kanban-page__view-meta-label">前置任务</span>
                              <span className="kanban-page__view-meta-value">
                                {task.predecessorTitle || (task.predecessorTaskId ? (allTasks.find(t => t.id === task.predecessorTaskId)?.title || task.predecessorTaskId) : '-')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="kanban-page__view-card">
                          <h4 className="kanban-page__view-card-title">状态变更记录</h4>
                          {taskLogs.length === 0 ? (
                            <div className="kanban-page__view-empty">暂无变更记录</div>
                          ) : (
                            <ul className="kanban-page__status-timeline">
                              {taskLogs.map(log => (
                                <li key={log.id} className="kanban-page__status-timeline-item">
                                  <span className="kanban-page__status-timeline-dot"/>
                                  <div className="kanban-page__status-timeline-content">
                                    <div className="kanban-page__status-timeline-change">
                                      {log.fromStatusName || '-'} → {log.toStatusName || '-'}
                                    </div>
                                    {log.reason ? (
                                      <div
                                        className="kanban-page__status-timeline-reason">{log.reason}</div>
                                    ) : null}
                                    <div className="kanban-page__status-timeline-meta">
                                      {log.operatorName ? (
                                        <span
                                          className="kanban-page__status-timeline-operator">{log.operatorName}</span>
                                      ) : null}
                                      {log.createTime ? (
                                        <span className="kanban-page__status-timeline-time">
                                          {new Date(log.createTime).toLocaleString('zh-CN')}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  jobLogList.length === 0 ? (
                    <div className="kanban-page__log-panel-empty">暂无运行日志</div>
                  ) : (
                    <ul className="kanban-page__log-list">
                      {jobLogList.map((log: JobLogItem) => (
                        <li
                          key={log.id}
                          className={`kanban-page__log-item${log.level === 'ERROR' ? ' kanban-page__log-item--error' : log.level === 'WARN' ? ' kanban-page__log-item--warn' : ''}`}
                        >
                          <span className="kanban-page__log-content">{log.content ?? '-'}</span>
                          {log.createTime ? (
                            <span
                              className="kanban-page__log-time">{new Date(log.createTime).toLocaleString('zh-CN')}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>
          </div>
        </Splitter>
      </div>
    </div>
  );
};

export default connect(({kanban, user}: any) => ({
  kanban: {
    ...kanban,
    jobSessionList: kanban?.jobSessionList ?? [],
    currentSessionId: kanban?.currentSessionId ?? null,
    jobLogList: kanban?.jobLogList ?? [],
  },
  userList: user?.userList ?? [],
}))(KanbanPage);
