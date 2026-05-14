import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dispatch} from '@umijs/max';
import {Spin} from 'air-design';
import Markdown from '@/components/Markdown';
import './RealtimeLogPanel.less';

interface RealtimeLogPanelProps {
  taskId: string | null;
  visible: boolean;
  dispatch: Dispatch;
  isTaskRunning?: boolean; // 任务是否正在运行（由父组件传入）
}

/**
 * 实时日志显示面板
 *
 * 功能说明：
 * 1. 通过定时查询方式获取实时日志
 * 2. 打开面板时开始定时抓取，关闭面板或任务结束时停止
 * 3. 仅在新任务开始时清空内容；任务结束后保留日志，直到用户关闭侧边栏（或侧边栏已关闭）时才清理
 * 4. 内容变化时，日志内容自动滚动到最下端
 *
 * Created by ChaiMingXu, on 2025/2/16
 */
interface LogItem {
  id: string;
  time: string;
  content: string;
  level?: string;
  nodeName?: string;
  logType?: string;
  status?: string;
  duration?: number;
  actionType?: string;
  /** 后端返回的 actionType 中文展示（reasoning->思考过程 等），前端优先用此展示 */
  actionTypeText?: string;
  taskMode?: string;
  errorMessage?: string;
}

const RealtimeLogPanel: React.FC<RealtimeLogPanelProps> = ({taskId, visible, dispatch, isTaskRunning = false}) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastLogIdRef = useRef<string | null>(null); // 记录最后一条日志ID，用于增量查询
  const prevTaskIdRef = useRef<string | null>(null); // 记录上一个taskId，用于检测变化
  const agentStreamConfirmedRef = useRef<Set<string>>(new Set()); // 已发送「Agent 流结束」确认的 taskId，避免重复调用

  // 格式化时间
  const formatTime = (timestamp: number) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * 滚动到底部函数
   * 自动查找并滚动所有可滚动的父容器
   */
  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    const performScroll = () => {
      if (!logContainerRef.current) {
        return;
      }

      const container = logContainerRef.current;

      // 滚动当前容器
      container.scrollTop = container.scrollHeight;

      // 查找并滚动所有父级滚动容器
      let parent = container.parentElement;
      let level = 1;
      while (parent && level <= 3) {
        const parentStyle = window.getComputedStyle(parent);
        const hasScroll = parentStyle.overflowY === 'auto' || parentStyle.overflowY === 'scroll';

        // 如果父级有滚动，也滚动它
        if (hasScroll && parent.scrollHeight > parent.clientHeight) {
          parent.scrollTop = parent.scrollHeight;
        }

        parent = parent.parentElement;
        level++;
      }
    };

    // 立即执行
    performScroll();

    // 延迟执行，确保异步内容（如 Markdown）已渲染
    scrollTimerRef.current = setTimeout(performScroll, 100);
    scrollTimerRef.current = setTimeout(performScroll, 300);
  }, []);

  /**
   * 监听内容变化，自动滚动到底部
   */
  useEffect(() => {
    if (logs.length > 0 && autoScroll) {
      // 使用 requestAnimationFrame 确保在下一帧执行
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [logs, autoScroll, scrollToBottom]);

  /**
   * 组件卸载时清理定时器
   */
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 获取任务日志（传 lastLogId 时后端只返回新日志，避免心跳全量拉取）
  const fetchTaskLogs = () => {
    if (!taskId || !dispatch) {
      return;
    }

    const payload: { taskId: string; lastLogId?: string | null } = {taskId};
    if (lastLogIdRef.current) {
      payload.lastLogId = lastLogIdRef.current;
    }

    dispatch({
      type: 'workflow/fetchWorkflowTaskLog',
      payload,
      callback: (response: any) => {
        if (response && response.success && response.data) {
          const rawLogs = Array.isArray(response.data) ? response.data : [];
          const newLogs = rawLogs.map((log: any) => ({
            id: log.id,
            createdTime: log.createdTime ?? log.created_time,
            content: log.content ?? '',
            logLevel: log.logLevel ?? log.log_level,
            nodeName: log.nodeName ?? log.node_name,
            logType: log.logType ?? log.log_type,
            status: log.status,
            duration: log.duration,
            actionType: log.actionType ?? log.action_type,
            actionTypeText: log.actionTypeText ?? log.action_type_text,
            taskMode: log.taskMode ?? log.task_mode,
            errorMessage: log.errorMessage ?? log.error_message,
          }));

          const hasAgentStreamEnd = rawLogs.some(
              (log: any) => (log.actionType ?? log.action_type) === 'agent_stream_end'
          );
          if (hasAgentStreamEnd && taskId && !agentStreamConfirmedRef.current.has(taskId)) {
            agentStreamConfirmedRef.current.add(taskId);
            dispatch({type: 'workflow/agentStreamReceived', payload: {taskId}});
          }

          setLogs(prevLogs => {
            if (lastLogIdRef.current === null) {
              // 首次加载：后端返回全量，直接展示
              const mappedLogs = newLogs.map((log: any) => ({
                id: log.id,
                time: formatTime(log.createdTime),
                content: log.content || '',
                level: log.logLevel,
                nodeName: log.nodeName,
                logType: log.logType,
                status: log.status,
                duration: log.duration,
                actionType: log.actionType,
                actionTypeText: log.actionTypeText,
                taskMode: log.taskMode,
                errorMessage: log.errorMessage,
              }));
              lastLogIdRef.current = mappedLogs.length > 0 ? mappedLogs[mappedLogs.length - 1].id : null;
              return mappedLogs;
            }
            // 增量：后端已只返回新日志，直接追加
            if (newLogs.length === 0) {
              return prevLogs;
            }
            const newItems = newLogs.map((log: any) => ({
              id: log.id,
              time: formatTime(log.createdTime),
              content: log.content || '',
              level: log.logLevel,
              nodeName: log.nodeName,
              logType: log.logType,
              status: log.status,
              duration: log.duration,
              actionType: log.actionType,
              actionTypeText: log.actionTypeText,
              taskMode: log.taskMode,
              errorMessage: log.errorMessage,
            }));
            lastLogIdRef.current = newItems[newItems.length - 1].id;
            return [...prevLogs, ...newItems];
          });
        }
      },
    });
  };

  // 当 taskId 变为新的非空值（新任务开始）时清空日志；任务结束时 taskId 变为 null 则保留当前日志
  useEffect(() => {
    if (taskId !== prevTaskIdRef.current) {
      prevTaskIdRef.current = taskId;
      if (taskId != null) {
        setLogs([]);
        lastLogIdRef.current = null;
        setAutoScroll(true);
      }
    }
  }, [taskId]);

  // 关闭侧边栏时（或侧边栏处于关闭状态时）清理实时日志内容
  useEffect(() => {
    if (!visible) {
      setLogs([]);
      lastLogIdRef.current = null;
    }
  }, [visible]);

  // 定时抓取日志
  useEffect(() => {
    if (!visible || !taskId) {
      // 如果面板不可见或没有任务ID，停止定时抓取
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 新任务时由 taskId 的 effect 已清空；延迟一小段时间再开始抓取，确保状态已就绪
    const startTimer = setTimeout(() => {
      // 立即获取一次日志
      fetchTaskLogs();

      // 设置定时器，每2秒抓取一次日志
      intervalRef.current = setInterval(() => {
        fetchTaskLogs();
      }, 2000);
    }, 50); // 延迟50ms，确保清空操作完成

    // 清理函数：停止定时器和延迟启动定时器
    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, taskId]);


  // 切换自动滚动
  const handleScroll = () => {
    if (logContainerRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = logContainerRef.current;
      // 如果滚动到底部附近（10px内），启用自动滚动
      setAutoScroll(scrollHeight - scrollTop - clientHeight < 10);
    }
  };

  // 判断日志样式类型
  const getLogStyleType = (log: LogItem): 'style-1' | 'style-2' | 'style-3' => {
    // 样式一：任务日志（任务开始/结束）
    if (log.logType === 'task') {
      return 'style-1';
    }

    // 样式三：智能体迭代（step类型日志，或agent模式下的节点日志）
    if (log.logType === 'step' || (log.taskMode === 'agent' && log.logType === 'node')) {
      return 'style-3';
    }

    // 样式二：普通节点日志
    if (log.logType === 'node') {
      return 'style-2';
    }

    // 默认使用样式二
    return 'style-2';
  };

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

  /**
   * 智能体步骤 actionType 展示：优先用后端返回的 actionTypeText（中文），否则按英文映射为中文。
   */
  const getActionTypeDisplay = (log: LogItem): string => {
    if (log.actionTypeText) return log.actionTypeText;
    const actionType = log.actionType;
    if (!actionType) return '';
    const map: Record<string, string> = {
      'reasoning': '思考过程',
      'tool': '执行行动',
      'text': '产出结果',
    };
    return map[actionType] || actionType;
  };

  // 渲染日志项
  const renderLogItem = (log: LogItem) => {
    const styleType = getLogStyleType(log);
    const isError = log.level === 'error' || log.status === 'failed';
    const isWarning = log.level === 'warning';

    // 样式一：系统日志（任务开始/结束）
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
                <span className="time">{log.time}</span>
              </div>
            </div>
            {log.errorMessage && (
                <div className="log-content">{log.errorMessage}</div>
            )}
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
                    {log.actionType || log.actionTypeText ? `操作: ${getActionTypeDisplay(log)}` : '智能体执行中'}
                  </div>
                </div>
              </div>
              <div className="header-right">
                <span className="time">{log.time}</span>
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
              {(log.actionType || log.actionTypeText) && (
                  <div className="action-type">{getActionTypeDisplay(log)}</div>
              )}
            </div>
            <div className="header-right">
              {log.status && (
                  <span className={`status ${log.status}`}>
                {getStatusText(log.status)}
              </span>
              )}
              <span className="time">{log.time}</span>
            </div>
          </div>
          {log.content && (
              <div className="log-content">
                <Markdown content={log.content}/>
              </div>
          )}
        </div>
    );
  };

  return (
      <div className="log-panel">
        <div
            ref={logContainerRef}
            onScroll={handleScroll}
            className="log-container"
        >
          {logs.length === 0 ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 40,
              }}>
                {taskId ? <Spin/> : <span style={{color: '#999', fontSize: 14}}>请先启动工作流任务</span>}
              </div>
          ) : (
              <>
                {logs.map(renderLogItem)}
                {/* 任务运行中状态指示器（与日志条目区分：圆角条、无左侧色条、内容居中） */}
                {isTaskRunning && (
                    <div className="log-running-indicator">
                      <Spin/>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default RealtimeLogPanel;
