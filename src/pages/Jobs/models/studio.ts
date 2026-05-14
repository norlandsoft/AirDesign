import {POST} from '@/utils/HttpRequest';
import type {
  JobExecutionContextResponse,
  JobCreateRequest,
  JobLogCreateRequest,
  JobLogQueryRequest,
  JobLogResponse,
  JobQueryRequest,
  JobResponse,
  JobUpdateRequest,
} from '@/types/job';

/**
 * 智能工作室工作（studio_job）Model
 *
 * 用于智能工作室工作台工作与工作日志。工作可拆分为多个 studio_action 任务。
 * 接口路径：/rest/platform/job。
 * 执行接口路径：/rest/studio/job。
 *
 * Created by ChaiMingXu, on 2026-02-14
 * Updated on 2026-03-28 - 重命名为 Job
 */
export default {
  namespace: 'studio',

  state: {
    /** 工作列表 */
    jobList: [] as JobResponse[],
    /** 当前选中的工作 */
    currentJob: null as JobResponse | null,
    /** 当前工作日志列表 */
    currentLogs: [] as JobLogResponse[],
    /** 加载状态 */
    loading: false,
    /** 运行中的执行上下文列表 */
    runningContexts: [] as JobExecutionContextResponse[],
    /** 运行中的工作数量 */
    runningCount: 0,
  },

  reducers: {
    /**
     * 设置工作列表
     */
    setJobList(state: any, {payload}: { payload: JobResponse[] }) {
      return {
        ...state,
        jobList: payload ?? [],
      };
    },

    /**
     * 设置当前选中的工作
     */
    setCurrentJob(state: any, {payload}: { payload: JobResponse | null }) {
      return {
        ...state,
        currentJob: payload,
      };
    },

    /**
     * 设置当前工作日志列表
     */
    setCurrentLogs(state: any, {payload}: { payload: JobLogResponse[] }) {
      return {
        ...state,
        currentLogs: payload ?? [],
      };
    },

    /**
     * 设置加载状态
     */
    setLoading(state: any, {payload}: { payload: boolean }) {
      return {
        ...state,
        loading: payload,
      };
    },

    /**
     * 设置运行中的执行上下文列表
     */
    setRunningContexts(state: any, {payload}: { payload: JobExecutionContextResponse[] }) {
      return {
        ...state,
        runningContexts: payload ?? [],
        runningCount: payload?.length ?? 0,
      };
    },

    /**
     * 添加运行上下文（乐观更新，启动后立即显示）
     */
    addRunningContext(state: any, {payload}: { payload: JobExecutionContextResponse }) {
      if (!payload?.jobId) return state;
      const list = state.runningContexts || [];
      const exists = list.some((c: JobExecutionContextResponse) => c.jobId === payload.jobId);
      const next = exists
          ? list.map((c: JobExecutionContextResponse) => (c.jobId === payload.jobId ? payload : c))
          : [payload, ...list];
      return {...state, runningContexts: next, runningCount: next.length};
    },

    /**
     * 移除运行上下文（启动失败时调用）
     */
    removeRunningContext(state: any, {payload}: { payload: { jobId: string } }) {
      if (!payload?.jobId) return state;
      const list = state.runningContexts || [];
      const next = list.filter((c: JobExecutionContextResponse) => c.jobId !== payload.jobId);
      return {...state, runningContexts: next, runningCount: next.length};
    },

    /**
     * 更新工作列表中某个工作的会话状态
     */
    updateJobSessionStatus(state: any, {payload}: {
      payload: { id: string; sessionStatus: string; sessionResult?: string }
    }) {
      const {id, sessionStatus, sessionResult} = payload;
      const jobList = state.jobList.map((job: JobResponse) =>
          job.id === id ? {...job, sessionStatus: sessionStatus as any, sessionResult} : job
      );
      return {
        ...state,
        jobList,
      };
    },

    /**
     * 清空状态
     */
    clearState(state: any) {
      return {
        ...state,
        jobList: [],
        currentJob: null,
        currentLogs: [],
        loading: false,
        runningContexts: [],
        runningCount: 0,
      };
    },
  },

  effects: {
    /**
     * 获取工作列表
     */
    * fetchJobList(
        {payload, callback}: { payload?: JobQueryRequest; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      yield put({type: 'setLoading', payload: true});
      try {
        const resp: any = yield call(POST, '/rest/platform/job/list', payload || {});
        if (resp?.success && resp.data?.jobs) {
          const jobList: JobResponse[] = resp.data.jobs;
          yield put({type: 'setJobList', payload: jobList});
        }
        if (callback) callback(resp);
      } finally {
        yield put({type: 'setLoading', payload: false});
      }
    },

    /**
     * 获取单个工作
     */
    * fetchJob(
        {payload, callback}: { payload: JobQueryRequest; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/get', payload);
      if (resp?.success && resp.data) {
        yield put({type: 'setCurrentJob', payload: resp.data});
      }
      if (callback) callback(resp);
    },

    /**
     * 创建工作
     */
    * createJob(
        {payload, callback}: { payload: JobCreateRequest; callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/create', payload);
      if (callback) callback(resp);
    },

    /**
     * 更新工作
     */
    * updateJob(
        {payload, callback}: { payload: JobUpdateRequest; callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/update', payload);
      if (callback) callback(resp);
    },

    /**
     * 删除工作
     */
    * deleteJob(
        {payload, callback}: { payload: JobQueryRequest; callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/delete', payload);
      if (callback) callback(resp);
    },

    /**
     * 获取工作日志列表
     */
    * fetchLogs(
        {payload, callback}: { payload: JobLogQueryRequest; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/log/list', payload);
      if (resp?.success && resp.data?.logs) {
        const logs: JobLogResponse[] = resp.data.logs;
        yield put({type: 'setCurrentLogs', payload: logs});
      }
      if (callback) callback(resp);
    },

    /**
     * 创建工作日志
     */
    * createLog(
        {payload, callback}: { payload: JobLogCreateRequest; callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/platform/job/log/create', payload);
      if (callback) callback(resp);
    },

    // ========== 执行相关接口 ==========

    /**
     * 启动工作执行
     */
    * startJob(
        {payload, callback}: { payload: { id: string; jobTitle?: string }; callback?: (resp: any) => void },
        {call, put, select}: any
    ) {
      // 从 jobList 中获取工作标题（用于乐观更新）
      const jobList = yield select((state: any) => state.job?.jobList ?? []);
      const job = jobList.find((j: JobResponse) => j.id === payload.id);
      const jobTitle = payload.jobTitle || job?.title || '未命名';

      // 1. 先乐观更新：立即显示运行状态（不等待后端响应）
      yield put({
        type: 'addRunningContext',
        payload: {
          jobId: payload.id,
          jobTitle,
          status: 'R',
          statusMessage: '正在启动...',
          progress: 0,
          startTime: Date.now(),
        } as JobExecutionContextResponse,
      });

      // 2. 同时更新工作列表中的会话状态
      yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'R'}});

      // 3. 调用后端 API
      const resp: any = yield call(POST, '/rest/studio/job/start', payload);

      if (resp?.success) {
        // 4. 后端返回后，用实际数据替换乐观数据
        if (resp?.data) {
          yield put({type: 'addRunningContext', payload: resp.data});
        }
        // 5. 立即刷新运行中列表，获取最新状态
        yield put({type: 'fetchRunningJobs'});
      } else {
        // 启动失败，移除乐观添加的运行状态
        yield put({type: 'removeRunningContext', payload: {jobId: payload.id}});
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: undefined}});
      }

      if (callback) callback(resp);
    },

    /**
     * 暂停工作执行
     */
    * pauseJob(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/pause', payload);
      if (resp?.success) {
        // 更新工作会话状态为暂停
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'P'}});
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },

    /**
     * 恢复工作执行
     */
    * resumeJob(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/resume', payload);
      if (resp?.success) {
        // 更新工作会话状态为执行中
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'R'}});
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },

    /**
     * 取消工作执行
     */
    * cancelJob(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/cancel', payload);
      if (resp?.success) {
        // 更新工作会话状态为已取消
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'X'}});
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },

    /**
     * 重试工作执行
     */
    * retryJob(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/retry', payload);
      if (resp?.success) {
        // 更新工作会话状态为执行中
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'R'}});
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },

    /**
     * 获取工作执行状态
     */
    * fetchExecutionStatus(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/status', payload);
      if (callback) callback(resp);
    },

    /**
     * 获取所有运行中的工作
     */
    * fetchRunningJobs(
        {callback}: { callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/running', {});
      if (resp?.success && resp.data) {
        yield put({type: 'setRunningContexts', payload: resp.data});
      }
      if (callback) callback(resp);
    },

    /**
     * 获取引擎状态
     */
    * fetchEngineStatus(
        {callback}: { callback?: (resp: any) => void },
        {call}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/engine', {});
      if (callback) callback(resp);
    },

    /**
     * 强制清除工作的运行记录
     */
    * forceClearJob(
        {payload, callback}: { payload: { id: string }; callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/force-clear', payload);
      if (resp?.success) {
        // 更新工作会话状态为已取消
        yield put({type: 'updateJobSessionStatus', payload: {id: payload.id, sessionStatus: 'X'}});
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },

    /**
     * 清理所有孤立的运行中会话
     */
    * cleanupStaleSessions(
        {callback}: { callback?: (resp: any) => void },
        {call, put}: any
    ) {
      const resp: any = yield call(POST, '/rest/studio/job/cleanup-stale', {});
      if (resp?.success) {
        // 刷新运行中的工作列表
        yield put({type: 'fetchRunningJobs'});
      }
      if (callback) callback(resp);
    },
  },
};
