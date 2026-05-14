import {POST} from '@/utils/HttpRequest';
import type {ActionProps, ActionStatus} from '@/components/Kanban/KanbanProps';

const createStatus = (id: string, name: string, jobId?: string, tasks: ActionProps[] = []): ActionStatus => ({
  id,
  name,
  jobId,
  sortOrder: 0,
  tasks,
});

const fallbackStatuses: ActionStatus[] = [
  createStatus('Todo', '待办'),
  createStatus('InProgress', '进行中'),
  createStatus('InReview', '评审中'),
  createStatus('Done', '已完成'),
  createStatus('Cancelled', '已取消'),
];

/**
 * 按 statusId 查找列（与后端 status.id 匹配，兼容大小写不一致：后端可能返回 statusId 小写如 "todo"，status.id 首字母大写如 "Todo"）
 */
function findColumnByStatusId(columns: ActionStatus[], statusId: string | null | undefined): ActionStatus | undefined {
  if (statusId == null || statusId === '') return undefined;
  const byId = columns.find((c) => c.id === statusId);
  if (byId) return byId;
  const lower = statusId.toLowerCase();
  return columns.find((c) => c.id.toLowerCase() === lower);
}

/**
 * 将后端 statuses + actions 组装为看板列（含任务敏捷字段）
 */
function buildKanbanColumns(statusList: any[], actionList: any[]): ActionStatus[] {
  const columns: ActionStatus[] = (statusList || []).map((s: any) =>
      createStatus(s.id, s.name, s.jobId, [])
  );
  const actionTitleMap: Record<string, string> = {};
  (actionList || []).forEach((t: any) => {
    actionTitleMap[t.id] = t.title || '';
  });
  (actionList || []).forEach((t: any) => {
    const statusId = t.statusId;
    const col = findColumnByStatusId(columns, statusId);
    if (!col) return;
    const action: ActionProps = {
      id: t.id,
      title: t.title,
      description: t.description,
      assigneeId: t.assigneeId,
      assigneeName: t.assigneeName,
      priority: t.priority,
      dueDate: t.dueDate != null ? (typeof t.dueDate === 'string' ? t.dueDate : String(t.dueDate)) : undefined,
      predecessorTaskId: t.predecessorTaskId || undefined,
      predecessorTitle: t.predecessorTaskId ? actionTitleMap[t.predecessorTaskId] : undefined,
    };
    col.tasks.push(action);
  });
  return columns;
}

/**
 * 看板 Model
 *
 * 遵循 MVVC：所有与 Action/ActionStatus 相关的后端请求在此实现，页面通过 dispatch 访问与数据管理。
 * 状态：columns（看板列与Action）；effects：拉取列表、创建/更新/删除Action、同列重排、跨列移动。
 *
 * @author ChaiMingXu, on 2026/2/4
 * Updated on 2026-03-28 - 重命名为 Action/Job
 */
export default {
  namespace: 'kanban',

  state: {
    columns: fallbackStatuses as ActionStatus[],
    loading: false,
    /** 当前查看 Action 的状态变更记录列表（按时间倒序） */
    taskStatusLogList: [] as any[],
    /** JobSession 列表（左侧区域） */
    jobSessionList: [] as any[],
    /** 当前选中的 sessionId */
    currentSessionId: null as string | null,
    /** Action 执行日志列表（右侧区域，按 sessionId 筛选） */
    jobLogList: [] as any[],
  },

  reducers: {
    setJobSessionList(state: any, {payload}: { payload: any[] }) {
      return {...state, jobSessionList: payload ?? []};
    },
    setCurrentSessionId(state: any, {payload}: { payload: string | null }) {
      return {...state, currentSessionId: payload};
    },
    setJobLogList(state: any, {payload}: { payload: any[] }) {
      return {...state, jobLogList: payload ?? []};
    },
    setColumns(state: any, {payload}: { payload: ActionStatus[] }) {
      return {
        ...state,
        columns: payload ?? state.columns,
      };
    },
    addTaskToColumn(
        state: any,
        {payload}: { payload: { columnId: string; task: ActionProps } }
    ) {
      const {columnId, task} = payload;
      const columns = (state.columns || []).map((col: ActionStatus) =>
          col.id === columnId ? {...col, tasks: [...(col.tasks || []), task]} : col
      );
      return {...state, columns};
    },
    removeTaskFromColumn(
        state: any,
        {payload}: { payload: { columnId: string; taskId: string } }
    ) {
      const {columnId, taskId} = payload;
      const columns = (state.columns || []).map((col: ActionStatus) =>
          col.id === columnId
              ? {...col, tasks: (col.tasks || []).filter((t) => t.id !== taskId)}
              : col
      );
      return {...state, columns};
    },
    updateTaskInColumns(
        state: any,
        {
          payload,
        }: {
          payload: {
            taskId: string;
            title?: string;
            description?: string;
            assigneeId?: string;
            assigneeName?: string;
            priority?: string;
            dueDate?: string;
            predecessorTaskId?: string;
            predecessorTitle?: string;
          };
        }
    ) {
      const {
        taskId,
        title,
        description,
        assigneeId,
        assigneeName,
        priority,
        dueDate,
        predecessorTaskId,
        predecessorTitle
      } = payload;
      const columns = (state.columns || []).map((col: ActionStatus) => ({
        ...col,
        tasks: (col.tasks || []).map((t) =>
            t.id === taskId
                ? {
                  ...t,
                  title: title ?? t.title,
                  description: description ?? t.description,
                  assigneeId: assigneeId !== undefined ? assigneeId : t.assigneeId,
                  assigneeName: assigneeName !== undefined ? assigneeName : t.assigneeName,
                  priority: priority !== undefined ? priority : t.priority,
                  dueDate: dueDate !== undefined ? dueDate : t.dueDate,
                  predecessorTaskId: predecessorTaskId !== undefined ? predecessorTaskId : t.predecessorTaskId,
                  predecessorTitle: predecessorTitle !== undefined ? predecessorTitle : t.predecessorTitle,
                }
                : t
        ),
      }));
      return {...state, columns};
    },
    setTaskStatusLogList(state: any, {payload}: { payload: any[] }) {
      return {...state, taskStatusLogList: payload ?? []};
    },
  },

  effects: {
    /**
     * 拉取看板数据：调用 kanban/board 一次获取状态列与 Action，支持 jobId 按工作隔离
     */
    * fetchBoard(
        {
          payload,
          callback,
        }: {
          payload?: { jobId?: string; sessionId?: string; requireSession?: boolean };
          callback?: (resp: any) => void;
        },
        {call, put}
    ) {
      const jobId = payload?.jobId ?? undefined;
      const sessionId = payload?.sessionId ?? undefined;
      const requireSession = payload?.requireSession ?? false;
      const body: any = {jobId: jobId || null};
      if (sessionId) body.sessionId = sessionId;
      if (requireSession) body.requireSession = true;
      const resp: any = yield call(POST, '/rest/platform/kanban/board', body);
      if (resp?.success && resp?.data) {
        const statuses = resp.data.statuses || [];
        const actions = resp.data.actions || [];
        const columns = buildKanbanColumns(statuses, actions);
        yield put({type: 'setColumns', payload: columns});
      }
      if (callback) callback(resp);
    },

    /**
     * 拉取看板数据（兼容旧用法，无 jobId 时等价于全局看板）
     */
    * fetchColumns(
        {payload, callback}: { payload?: { jobId?: string }; callback?: (resp: any) => void },
        {call, put}
    ) {
      yield put({type: 'fetchBoard', payload: payload ?? {}, callback});
    },

    /**
     * 创建 Action（支持 jobId、priority、dueDate、assigneeId）
     */
    * createTask(
        {
          payload,
          callback,
        }: {
          payload: {
            columnId: string;
            title: string;
            description?: string;
            jobId?: string;
            sessionId?: string;
            priority?: string;
            assigneeId?: string;
            predecessorTaskId?: string;
          };
          callback?: (resp: any) => void;
        },
        {call, put}
    ) {
      const body: any = {
        title: payload.title,
        description: payload.description ?? '',
        statusId: payload.columnId,
        status: 'A',
      };
      if (payload.jobId != null) body.jobId = payload.jobId;
      if (payload.sessionId != null) body.sessionId = payload.sessionId;
      if (payload.priority != null) body.priority = payload.priority;
      if (payload.assigneeId != null) body.assigneeId = payload.assigneeId;
      if (payload.predecessorTaskId != null) body.predecessorTaskId = payload.predecessorTaskId;
      const resp: any = yield call(POST, '/rest/platform/action/create', body);
      if (resp?.success && resp?.data) {
        const d = resp.data;
        const action: ActionProps = {
          id: d.id,
          title: d.title ?? payload.title,
          description: d.description ?? payload.description ?? '',
          assigneeId: d.assigneeId,
          assigneeName: d.assigneeName,
          priority: d.priority,
          dueDate: d.dueDate != null ? (typeof d.dueDate === 'string' ? d.dueDate : String(d.dueDate)) : undefined,
          predecessorTaskId: d.predecessorTaskId,
          predecessorTitle: d.predecessorTitle,
        };
        yield put({type: 'addTaskToColumn', payload: {columnId: payload.columnId, task: action}});
      }
      if (callback) callback(resp);
    },

    /**
     * 更新 Action（标题、描述、负责人、优先级、截止日）
     */
    * updateTask(
        {
          payload,
          callback,
        }: {
          payload: {
            id: string;
            title?: string;
            description?: string;
            assigneeId?: string;
            assigneeName?: string;
            priority?: string;
            dueDate?: string;
            predecessorTaskId?: string;
            predecessorTitle?: string;
          };
          callback?: (resp: any) => void;
        },
        {call, put}
    ) {
      const resp: any = yield call(POST, '/rest/platform/action/update', payload);
      if (resp?.success && resp?.data) {
        const d = resp.data;
        yield put({
          type: 'updateTaskInColumns',
          payload: {
            taskId: payload.id,
            title: d.title ?? payload.title,
            description: d.description ?? payload.description,
            assigneeId: d.assigneeId ?? payload.assigneeId,
            assigneeName: d.assigneeName ?? payload.assigneeName,
            priority: d.priority ?? payload.priority,
            dueDate: d.dueDate != null ? (typeof d.dueDate === 'string' ? d.dueDate : String(d.dueDate)) : payload.dueDate,
            predecessorTaskId: d.predecessorTaskId ?? payload.predecessorTaskId,
            predecessorTitle: d.predecessorTitle ?? payload.predecessorTitle,
          },
        });
      }
      if (callback) callback(resp);
    },

    /**
     * 删除 Action
     */
    * deleteTask(
        {
          payload,
          callback,
        }: { payload: { columnId: string; taskId: string }; callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp: any = yield call(POST, '/rest/platform/action/delete', {
        id: payload.taskId,
      });
      if (resp?.success) {
        yield put({
          type: 'removeTaskFromColumn',
          payload: {columnId: payload.columnId, taskId: payload.taskId},
        });
      }
      if (callback) callback(resp);
    },

    /**
     * 同状态列内重排
     */
    * reorderTask(
        {
          payload,
          callback,
        }: {
          payload: { statusId: string; taskIds: string[] };
          callback?: (resp: any) => void;
        },
        {call}
    ) {
      const resp: any = yield call(POST, '/rest/platform/action/reorder', payload);
      if (callback) callback(resp);
    },

    /**
     * 跨状态列移动
     */
    * moveTask(
        {
          payload,
          callback,
        }: {
          payload: { taskId: string; toStatusId: string; toIndex: number };
          callback?: (resp: any) => void;
        },
        {call}
    ) {
      const resp: any = yield call(POST, '/rest/platform/action/move', payload);
      if (callback) callback(resp);
    },

    /**
     * 拉取指定 Action 的状态变更记录列表
     */
    * fetchTaskStatusLogList(
        {payload, callback}: { payload: { taskId: string }; callback?: (resp: any) => void },
        {call, put}
    ) {
      const taskId = payload?.taskId;
      if (!taskId) {
        if (callback) callback({success: false, message: '任务ID为空'});
        return;
      }
      const resp: any = yield call(POST, '/rest/platform/actionStatusLog/list', {taskId});
      if (resp?.success && Array.isArray(resp.data)) {
        yield put({type: 'setTaskStatusLogList', payload: resp.data});
      }
      if (callback) callback(resp);
    },

    /**
     * 拉取 JobSession 列表（不按 jobId 分组，返回全部 Session）
     */
    * fetchJobSessionList(
        {payload, callback}: { payload?: { jobId?: string }; callback?: (resp: any) => void },
        {call, put}
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/session/list', payload ?? {});
      if (resp?.success && resp.data?.sessions) {
        yield put({type: 'setJobSessionList', payload: resp.data.sessions});
      } else {
        yield put({type: 'setJobSessionList', payload: []});
      }
      if (callback) callback(resp);
    },

    /**
     * 拉取工作执行日志（按 jobId 或 sessionId）
     */
    * fetchJobLogList(
        {
          payload,
          callback,
        }: {
          payload: { jobId: string; sessionId?: string };
          callback?: (resp: any) => void;
        },
        {call, put}
    ) {
      const jobId = payload?.jobId;
      if (!jobId) {
        yield put({type: 'setJobLogList', payload: []});
        if (callback) callback({success: true, data: {logs: []}});
        return;
      }
      const body: any = {jobId};
      if (payload?.sessionId) body.sessionId = payload.sessionId;
      const resp: any = yield call(POST, '/rest/platform/job/log/list', body);
      if (resp?.success && resp.data?.logs) {
        yield put({type: 'setJobLogList', payload: resp.data.logs});
      } else {
        yield put({type: 'setJobLogList', payload: []});
      }
      if (callback) callback(resp);
    },

    /**
     * 变更 Action 状态：写记录并迁移 Action 到目标状态列
     */
    * changeTaskStatus(
        {
          payload,
          callback,
        }: {
          payload: { taskId: string; toStatusId: string; reason?: string };
          callback?: (resp: any) => void;
        },
        {call}
    ) {
      const resp: any = yield call(POST, '/rest/platform/actionStatusLog/changeStatus', {
        taskId: payload.taskId,
        toStatusId: payload.toStatusId,
        reason: payload.reason ?? '',
      });
      if (callback) callback(resp);
    },

    /**
     * 删除运行记录（JobSession）及其关联的所有 Action
     */
    * deleteJobSession(
        {
          payload,
          callback,
        }: {
          payload: { sessionId: string };
          callback?: (resp: any) => void;
        },
        {call, put}
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/session/delete', {
        sessionId: payload.sessionId,
      });
      if (resp?.success) {
        // 删除成功后刷新列表
        yield put({type: 'fetchJobSessionList', payload: {}});
      }
      if (callback) callback(resp);
    },
  },
};
