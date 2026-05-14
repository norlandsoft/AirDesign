import {POST} from "@/utils/HttpRequest";

export default {
  namespace: 'workflow',
  state: {},
  effects: {
    // 运行Workflow Task
    * run({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/run', payload);
      if (callback) callback(resp);
    },
    // 停止运行中的工作流任务
    * stopTask({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/task/stop', payload);
      if (callback) callback(resp);
    },
    // 读取Workflow
    * fetchWorkflow({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/info', payload);
      if (callback) callback(resp);
    },
    // 保存Workflow
    * saveWorkflow({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/save', payload);
      if (callback) callback(resp);
    },
    // 删除Workflow
    * deleteWorkflow({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/delete', payload);
      if (callback) callback(resp);
    },
    * fetchWorkflowList({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/list', payload);
      if (callback) callback(resp);
    },
    * exportWorkflow({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/export', payload);
      if (callback) callback(resp);
    },
    // action
    * fetchAction({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/action/info', payload);
      if (callback) callback(resp);
    },
    * saveAction({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/action/save', payload);
      if (callback) callback(resp);
    },
    * deleteAction({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/action/delete', payload);
      if (callback) callback(resp);
    },
    // edge
    * fetchEdges({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/edges', payload);
      if (callback) callback(resp);
    },
    * saveEdge({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/edge/save', payload);
      if (callback) callback(resp);
    },
    * deleteEdge({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/edge/delete', payload);
      if (callback) callback(resp);
    },
    // 统一的任务状态查询接口（支持taskId和flowId）
    * getTaskStatus({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/task/status', payload);
      if (callback) callback(resp);
    },
    /**
     * 根据 flowId 从后端（Redis）获取当前运行中的 taskId
     * 用于刷新页面后恢复实时日志所需的 taskId
     */
    * getRunningTaskId({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/task/running', payload);
      if (callback) callback(resp);
    },
    // 获取任务执行结果
    * getTaskResult({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/task/result', payload);
      if (callback) callback(resp);
    },
    // 查询工作流状态（兼容旧接口，通过flowId查询，仅debug模式）
    * checkWorkflowStatus({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/status', payload);
      if (callback) callback(resp);
    },
    // log
    * fetchWorkflowLogList({payload, callback}, _) {
      // 获取工作流的任务列表（通过flowId）
      const resp = yield POST('/rest/workflow/log/flow', payload);
      if (callback) callback(resp);
    },
    * fetchWorkflowTaskLog({payload, callback}, _) {
      // 获取任务的完整日志（通过taskId）
      const resp = yield POST('/rest/workflow/log/task', payload);
      if (callback) callback(resp);
    },
    /**
     * 平台确认：收到「Agent 节点流式输出结束」日志后调用，后端据此尽快执行 OpenCode 停止与清理。
     */
    * agentStreamReceived({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/log/agentStreamReceived', payload);
      if (callback) callback(resp);
    },
    /**
     * 删除任务的所有历史日志（数据库彻底删除）
     *
     * 说明：
     * - 按 taskId 删除一次执行对应的全部日志记录
     * - 对应后端接口：/rest/workflow/log/task/delete
     */
    * deleteWorkflowTaskLog({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/log/task/delete', payload);
      if (callback) callback(resp);
    },
    * clearLog({payload, callback}, _) {
      const resp = yield POST('/rest/workflow/log/clear', payload);
      if (callback) callback(resp);
    },
    // 工作流执行设置
    * fetchWorkflowProps({payload, callback}: { payload?: any, callback?: (resp: any) => void }, {call}) {
      const resp = yield call(POST, '/rest/workflow/props/get', payload || {});
      if (callback) callback(resp);
    },
    * saveWorkflowProps({payload, callback}: { payload: any, callback?: (resp: any) => void }, {call}) {
      const resp = yield call(POST, '/rest/workflow/props/save', payload);
      if (callback) callback(resp);
    }
  },
}
