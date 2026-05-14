import React, {useCallback, useEffect, useRef, useState} from 'react';
import {connect} from 'umi';
import {Form, Spin} from 'antd';
import {Button, Dialog, error, Icon, IconButton, Message, SlidePanel} from 'air-design';
import {addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './WorkflowInfo.less';

import ActionNode from './components/ActionNode';
import GroupNode from './components/GroupNode';
import StartNode from './components/StartNode';
import StopNode from './components/StopNode';
import CaseNode from './components/CaseNode';
import BreakNode from './components/BreakNode';

// 侧边栏显示节点属性
import StartActionPanel from './components/StartActionPanel';
import LLMActionPanel from './components/LLMActionPanel';
import HttpRequestActionPanel from './components/HttpRequestActionPanel';
import AgentActionPanel from "./components/AgentActionPanel";
import CaseActionPanel from "./components/CaseActionPanel";
import LoopActionPanel from "./components/LoopActionPanel";
import ForEachActionPanel from "./components/ForEachActionPanel";

import WorkflowDebugPanel from './WorkflowDebugPanel';
import LogHistoryPanel from './log/LogHistoryPanel';
import RealtimeLogPanel from './log/RealtimeLogPanel';
import WorkflowSettingsPanel, {WorkflowSettingsPanelRef} from './WorkflowSettingsPanel';

// data
import {AllItems} from './ActionItems';

const WorkflowInfo: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    current,
    width,
    onWorkflowInfoSaved,
    onWorkflowDeleted,
  } = props;

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const viewportRef = React.useRef<any>(null);
  // 工作流已删除标志，阻止cleanup时对已删除工作流执行保存
  const deletedRef = useRef<boolean>(false);

  // 当前操作的节点
  const [currentNode, setCurrentNode] = useState<any | null>(null);
  // 当前是否有节点被选中
  const [nodeSelected, setNodeSelected] = useState<boolean>(false);

  const [actionForm] = Form.useForm();
  const [extraProps, setExtraProps] = useState<any>({});

  const [showLoading, setShowLoading] = useState(false);

  // 日志侧边栏
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [showLogOutput, setShowLogOutput] = useState(false);
  const [logContent, setLogContent] = useState('');
  // 当前运行的任务ID，用于实时日志
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  // 标记是否是Agent执行的开始（用于判断是否清空日志内容）
  const [isAgentExecutionStart, setIsAgentExecutionStart] = useState<boolean>(false);
  // 使用ref追踪是否已经处理过第一个OPEN消息（避免闭包问题）
  const isFirstOpenProcessedRef = useRef<boolean>(false);

  // 设置侧边栏
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const settingsPanelRef = useRef<WorkflowSettingsPanelRef>(null);

  // 是否存在已经打开的侧边栏
  const hasSidePanelOpen = useRef(false);

  const [runningForm] = Form.useForm();
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
  // 追踪当前taskId的ref，避免setInterval回调中的闭包问题
  const currentTaskIdRef = useRef<string | null>(null);

  // 防抖动相关状态
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 任务结束后延迟清空 currentTaskId 的定时器，多拉几轮日志以免末尾日志未展示
  const logPollingDelayClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {

    const timer = setTimeout(() => {
      setShowLoading(true);
    }, 200);

    // 获取agent flow
    loadFlow();
    // 检查运行状态：先从后端获取当前工作流的运行中taskId，再检查状态以恢复运行中指示器
    dispatch({
      type: 'workflow/getRunningTaskId',
      payload: {flowId: current.id},
      callback: (resp: any) => {
        if (resp?.success && resp?.data != null) {
          // 找到运行中的taskId，检查其状态
          checkAgentRunning(resp.data);
        }
      },
    });

    return () => {
      setNodes([]);
      setEdges([]);
      setCurrentNode(null);
      setExtraProps({});

      // 工作流已删除时跳过保存，避免对已删除的工作流执行保存导致报错
      if (viewportRef.current && !deletedRef.current) {
        // 保存画布位置和缩放
        dispatch({
          type: 'workflow/saveWorkflow',
          payload: {
            id: current.id,
            px: Math.round(viewportRef.current.px),
            py: Math.round(viewportRef.current.py),
            zoom: viewportRef.current.zoom
          },
          callback: resp => {
            if (!resp.success) {
              error({
                title: '保存画布失败',
                message: '无法保存画布位置'
              });
            }
          }
        });
      }

      viewportRef.current = null;
      setShowLoading(false);
      if (logPollingDelayClearRef.current) {
        clearTimeout(logPollingDelayClearRef.current);
        logPollingDelayClearRef.current = null;
      }
      clearTimeout(timer);

      // 清理resize防抖动定时器
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    }
  }, [current.id]);

  const loadFlow = () => {
    // 获取agent信息
    dispatch({
      type: 'workflow/fetchWorkflow',
      payload: {
        id: current.id
      },
      callback: resp => {
        if (resp.success && resp.data.info) {
          viewportRef.current = resp.data.info;
          const nodes: any[] = [];
          const edges: any[] = [];
          resp.data.actions.forEach(action => {
            nodes.push(buildNode(action));
          });

          resp.data.edges.forEach(edge => {
            edges.push(buildEdge(edge));
          });

          setNodes(nodes);
          setEdges(edges);
        }
      }
    });
  }

  const addNode = (action: any) => {
    // 计算new action 的位置, 相对于当前画布位置偏移
    // 200到300之间的随机数
    const offsetX = Math.floor(Math.random() * 100) + 200;
    const offsetY = Math.floor(Math.random() * 100) + 100;

    const newX = Math.round(0 - viewportRef.current.px + offsetX);
    const newY = Math.round(0 - viewportRef.current.py + offsetY);

    const newAction = {...action, flowId: current.id, type: action.type, px: newX, py: newY};

    // 添加节点
    dispatch({
      type: 'workflow/saveAction',
      payload: newAction,
      callback: resp => {
        if (resp.success) {
          // 保存成功，在画布上绘制节点
          setNodes([...nodes, buildNode(resp.data)]);
        }
      }
    })
  }

  const addSubNode = (parentId: string, allNodes: any[], newNode: any) => {
    // 计算new action 的位置, 相对于当前画布位置偏移
    // 200到300之间的随机数
    const offsetX = Math.floor(Math.random() * 100) + 200;
    const offsetY = Math.floor(Math.random() * 100) + 100;

    const newX = Math.round(0 - viewportRef.current.px + offsetX);
    const newY = Math.round(0 - viewportRef.current.py + offsetY);

    const newAction = {...newNode, flowId: current.id, type: newNode.type, px: newX, py: newY, parentId: parentId};

    // 添加节点
    dispatch({
      type: 'workflow/saveAction',
      payload: newAction,
      callback: resp => {
        if (resp.success) {
          // 保存成功，在画布上绘制节点
          setNodes([...allNodes, buildNode(resp.data)]);
        }
      }
    })
  }

  // 构建节点
  const buildNode = (action: any) => {
    // 节点菜单
    const toolMenuItems: any[] = [];

    // 启用/禁用菜单项（开始和结束节点不显示）
    if (action.action !== 'start' && action.action !== 'stop') {
      const isEnabled = action.enabled !== false;
      toolMenuItems.push({
        key: 'toggleEnabled',
        label: (
            <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
              <Icon name={isEnabled ? 'disable' : 'enable'} size={14}/>
              {isEnabled ? '禁用' : '启用'}
            </div>
        ),
        onClick: () => toggleNodeEnabled(action)
      });
    }

    toolMenuItems.push({
      key: 'delete',
      label: (
          <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <Icon name="delete" color={'darkred'} size={14}/> 删除
          </div>
      ),
      onClick: () => deleteNode(action.id)
    });

    return {
      id: action.id,
      data: {
        ...action,
        onDetail: onShowNodeDetail,
        onAddSubNode: addSubNode,
        toolMenuItems: toolMenuItems,
      },
      parentId: action.parentId,
      extent: action.parentId ? 'parent' : undefined,
      position: {x: action.px, y: action.py},
      type: (() => {
        switch (action.action) {
          case 'start':
            return 'startNode';
          case 'stop':
            return 'stopNode';
          case 'loop':
          case 'forEach':
            return 'groupNode';
          case 'case':
            return 'caseNode';
          case 'continue':
          case 'break':
            return 'breakNode';
          default:
            return 'actionNode';
        }
      })(),
    }
  }

  // 构建边
  const buildEdge = (edge: any) => {
    return {
      ...edge,
      type: 'default',
      markerEnd: {
        type: 'arrowclosed', // 添加箭头
      }
    }
  }

  // 画布初始化事件
  const onInit = useCallback((reactFlowInstance: any) => {
    // 画布初始化时，查找className为'react-flow__panel'的div节点，并删除它们
    if (typeof window !== 'undefined') {
      // 使用setTimeout确保DOM已渲染
      setTimeout(() => {
        // 获取所有class为'react-flow__panel'的div节点
        const panels = document.querySelectorAll('div.react-flow__attribution');
        panels.forEach(panel => {
          // 删除节点
          panel.remove();
        });
      }, 0);
    }
  }, [current.id]);

  // 画布移动事件
  const onViewportChange = useCallback((viewport) => {
    viewportRef.current = {
      ...viewportRef.current,
      px: viewport.x,
      py: viewport.y,
      zoom: viewport.zoom
    }
  }, [current.id]);

  // 节点改变事件
  const onNodesChange = useCallback(
      (changes) => {
        // 遍历变化
        changes.forEach(change => {
          if (change.type === 'position' && !change.dragging) {
            // 获取节点信息
            const node = nodes.find(item => (item.id === change.id));
            const positionChange = {
              ...node.data,
              px: Math.round(change.position.x),
              py: Math.round(change.position.y),
              dx: node.measured.width,
              dy: node.measured.height
            }
            dispatch({
              type: 'workflow/saveAction',
              payload: positionChange,
              callback: resp => {
                if (!resp.success) {
                  error({
                    title: '保存节点失败',
                    message: '无法保存节点位置'
                  });
                }
              }
            })
          } else if (change.type === 'dimensions') {
            // 如果节点没有被选中，则不执行resize
            if (!nodeSelected) {
              return;
            }

            // 如果存在打开的侧边栏，则不响应尺寸改变事件
            if (hasSidePanelOpen.current) {
              return;
            }

            // 如果鼠标左键正在按下，不执行resize响应（防抖动）
            if (isMouseDown) {
              return;
            }

            // 清除之前的定时器
            if (resizeTimeoutRef.current) {
              clearTimeout(resizeTimeoutRef.current);
            }

            // 获取节点信息
            const node = nodes.find(item => (item.id === change.id));
            // 设置防抖动定时器，延迟执行resize保存
            resizeTimeoutRef.current = setTimeout(() => {
              dispatch({
                type: 'workflow/saveAction',
                payload: {
                  ...node.data,
                  px: node.position.x,
                  py: node.position.y,
                  dx: change.dimensions.width,
                  dy: change.dimensions.height
                },
                callback: resp => {
                  if (!resp.success) {
                    error({
                      title: '保存节点失败',
                      message: '无法保存节点尺寸'
                    });
                  }
                }
              });
            }, 300); // 300ms防抖动延迟
          } else if (change.type === 'remove') {
            // 阻止默认的删除行为
            change.type = 'select';
            deleteNode(change.id);
            return false; // 不执行这个change
          }
        });

        setNodes((nds) => applyNodeChanges(changes, nds))
      },
      [nodes, current.id],
  );

  // 边改变事件
  const onEdgesChange = useCallback(
      (changes) => {
        if (!nodeSelected) {
          // 更新边
          changes.forEach(change => {
            // 删除边
            if (change.type === 'remove') {

              // 如果存在打开的侧边栏，则不响应删除操作
              if (hasSidePanelOpen.current) {
                return false;
              }

              change.type = 'select';
              dispatch({
                type: 'workflow/deleteEdge',
                payload: {
                  id: change.id
                },
                callback: resp => {
                  if (resp.success) {
                    // 刷新画布
                    loadFlow();
                  } else {
                    error({
                      title: '失败',
                      message: '无法删除连线'
                    });
                  }
                }
              });
              return false;
            }
          });
          setEdges((eds) => applyEdgeChanges(changes, eds));
        }
      },
      [edges, current.id, nodeSelected],
  );

  // 连接事件
  const onConnect = useCallback(
      (params) => {

        // params中sourceHandle和targetHandle如果为null，转换为undefined
        params.sourceHandle = params.sourceHandle === null ? undefined : params.sourceHandle;
        params.targetHandle = params.targetHandle === null ? undefined : params.targetHandle;

        const isEdgeExists = edges.some(
            (edge) =>
                edge.source === params.source &&
                edge.target === params.target &&
                edge.sourceHandle === params.sourceHandle &&
                edge.targetHandle === params.targetHandle
        );

        if (isEdgeExists) {
          return;
        }

        // 添加边
        const newEdge = {
          source: params.source,
          sourceHandle: params.sourceHandle,
          target: params.target,
          targetHandle: params.targetHandle,
          flowId: current.id
        }

        dispatch({
          type: 'workflow/saveEdge',
          payload: newEdge,
          callback: resp => {
            if (resp.success) {
              const added = {
                ...resp.data,
                type: 'default',
                markerEnd: {
                  type: 'arrowclosed'
                }
              }
              setEdges((eds) => addEdge(added, eds));
            } else {
              error({
                title: '保存边失败',
                message: '无法保存边'
              });
            }
          }
        })
      },
      [edges, current.id],
  );

  // 添加选择事件处理函数
  const onSelectionChange = useCallback(({nodes, edges}) => {
    // 如果节点被选中，则设置nodeSelected为true，否则为false
    if (nodes.length > 0) {
      setNodeSelected(true);
    } else {
      setNodeSelected(false);
    }
  }, [current.id]);

  // 打开节点信息表单
  const onShowNodeDetail = node => {
    // 获取最新信息
    dispatch({
      type: 'workflow/fetchAction',
      payload: {id: node.id},
      callback: resp => {
        if (resp.success) {
          setCurrentNode(resp.data);

          if (resp.data?.props) {
            setExtraProps(JSON.parse(resp.data.props));
          } else {
            setExtraProps({});
          }
        }
      }
    });
  }

  // 切换节点启用/禁用状态
  const toggleNodeEnabled = (action: any) => {
    const isEnabled = action.enabled !== false;
    dispatch({
      type: 'workflow/saveAction',
      payload: {
        ...action,
        enabled: !isEnabled,
        dx: -1,
        dy: -1
      },
      callback: resp => {
        if (resp.success) {
          loadFlow();
        } else {
          error({
            title: '操作失败',
            message: '无法更新节点状态'
          });
        }
      }
    });
  }

  // 删除节点
  const deleteNode = (id: string) => {

    // 如果存在打开的侧边栏，则不响应删除操作
    if (hasSidePanelOpen.current) {
      return;
    }

    Dialog({
      title: '删除智能工作流节点',
      message: '确定删除该操作节点吗？',
      onConfirm: dlg => {
        dispatch({
          type: 'workflow/deleteAction',
          payload: {
            id,
            flowId: current.id
          },
          callback: resp => {
            if (resp.success) {
              // 获取agent flow
              loadFlow();

              setCurrentNode(null);
              dlg.doCancel();
            }
          }
        })
      }
    });
  }

  const nodeItems = AllItems.map(item => {
    // 如果item.split为true，返回分隔符
    if (item.split) {
      return {
        key: item.key,
        type: 'divider'
      }
    }

    return {
      key: item.key,
      label: <div className={'dropdown-menu-item'}><Icon name={`agent_action_${item.key === 'forEach' ? 'todo' : item.key}`} size={18}/>{item.name}</div>,
      onClick: () => addNode({name: item.name, action: item.key, type: item.type})
    }
  })

  // ====================================================================================================
  // 菜单操作项
  // ====================================================================================================

  // 停止工作流运行
  const handleStopWorkflow = () => {
    Dialog({
      title: '停止',
      content: '确定停止当前运行的工作流吗？正在执行的节点将被中断。',
      width: 400,
      onConfirm: dlg => {
        dispatch({
          type: 'workflow/stopTask',
          payload: {taskId: currentTaskIdRef.current},
          callback: resp => {
            if (resp?.success) {
              setAgentRunning(false);
              Message.success('已发送停止信号');
            } else {
              error({
                title: '停止失败',
                message: resp?.message || '停止任务失败'
              });
            }
            dlg.doCancel();
          }
        });
      }
    });
  }

  // 运行工作流
  const handleShowDebugPanel = () => {
    // 重置表单，清除上次的值
    runningForm.resetFields();
    runningForm.setFieldsValue({
      description: ''
    });

    Dialog({
      title: '运行',
      content: <WorkflowDebugPanel form={runningForm} extraProps={extraProps}/>,
      width: 400,
      onConfirm: dlg => {
        runningForm.validateFields().then(values => {
          // 清理日志内容（新的任务开始）
          setLogContent('');
          setIsAgentExecutionStart(true); // 标记为Agent执行开始
          isFirstOpenProcessedRef.current = false; // 重置ref标志
          // 打开日志侧边栏（日志输出由工作流设置中的saveLog控制）
          setShowLogOutput(true);

          // 构建初始数据（从Start节点的initContent获取）
          const initData = extraProps.initContent ? {
            initContent: extraProps.initContent
          } : null;

          dispatch({
            type: 'workflow/run',
            payload: {
              flowId: current.id,
              flowName: current.name,
              mode: 'debug', // 调试模式运行
              data: initData, // 传递初始数据
              description: values.description || '' // 传递任务描述
            },
            callback: resp => {
              if (resp.success) {
                const data = resp.data;
                if (data && data.id) {
                  setCurrentTaskId(data.id);
                  currentTaskIdRef.current = data.id;
                  checkAgentRunning();
                }
                dlg.doCancel();
              }
            }
          });
        });
      }
    });
  }

  // 保存工作流设置（基本信息和运行时设置）
  const handleSaveSettings = () => {
    if (!settingsPanelRef.current) {
      return;
    }

    settingsPanelRef.current.validateAndGetValues().then((result) => {
      if (!result) {
        // 验证失败，不执行保存
        return;
      }

      if (!current?.id) {
        Message.error('工作流ID不能为空');
        return;
      }

      const {basicInfo, runtimeSettings} = result;
      const savePromises: Promise<boolean>[] = [];

      // 保存基本信息
      if (basicInfo) {
        const basicInfoPromise = new Promise<boolean>((resolve) => {
          dispatch({
            type: 'workflow/saveWorkflow',
            payload: {
              id: basicInfo.id,
              name: basicInfo.name,
              description: basicInfo.description,
            },
            callback: (resp: any) => {
              if (resp?.success) {
                // 更新当前工作流信息
                if (current) {
                  current.name = basicInfo.name;
                  current.description = basicInfo.description;
                }
                resolve(true);
              } else {
                Message.error(resp?.message || '保存基本信息失败');
                resolve(false);
              }
            },
          });
        });
        savePromises.push(basicInfoPromise);
      }

      // 保存运行时设置
      if (runtimeSettings) {
        const runtimeSettingsPromise = new Promise<boolean>((resolve) => {
          dispatch({
            type: 'workflow/saveWorkflowProps',
            payload: runtimeSettings,
            callback: (resp: any) => {
              if (resp?.success) {
                resolve(true);
              } else {
                Message.error(resp?.message || '保存运行时设置失败');
                resolve(false);
              }
            },
          });
        });
        savePromises.push(runtimeSettingsPromise);
      }

      // 等待所有保存操作完成
      if (savePromises.length > 0) {
        Promise.all(savePromises).then((results) => {
          const allSuccess = results.every(result => result === true);
          if (allSuccess) {
            Message.success('保存成功');
            setShowSettingsPanel(false);
            // 刷新工作流列表，使新名称等信息及时展示
            onWorkflowInfoSaved?.();
          }
        });
      } else {
        // 如果两部分都不需要保存，直接关闭面板
        setShowSettingsPanel(false);
      }
    });
  };

  // 检查工作流运行状态；任务结束时先置为非运行，延迟再清 currentTaskId，以便实时日志多拉几轮收齐末尾日志
  // taskId参数可选，不传时使用currentTaskIdRef中的值
  const checkAgentRunning = (taskId?: string) => {
    const checkId = taskId || currentTaskIdRef.current;
    dispatch({
      type: 'workflow/checkWorkflowStatus',
      payload: {flowId: current.id, id: checkId},
      callback: resp => {
        const status = resp?.data?.status;
        const running = status === 'running' || status === 'pending';
        setAgentRunning(running);
        if (running && checkId) {
          // 恢复运行中状态时同步更新taskId
          setCurrentTaskId(checkId);
          currentTaskIdRef.current = checkId;
        }
        if (!running) {
          if (logPollingDelayClearRef.current) {
            clearTimeout(logPollingDelayClearRef.current);
            logPollingDelayClearRef.current = null;
          }
          setCurrentTaskId(prev => {
            const id = prev;
            if (id) {
              logPollingDelayClearRef.current = setTimeout(() => {
                logPollingDelayClearRef.current = null;
                setCurrentTaskId(p => (p === id ? null : p));
              }, 5000);
            }
            return prev;
          });
        }
      }
    });
  }

  // 定时检查工作流运行状态：每3秒检查一次，如果agentRunning为false则停止检查
  useEffect(() => {
    // 如果agentRunning为false，不启动定时器
    if (!agentRunning) {
      return;
    }

    // 启动定时器，每3秒执行一次检查
    const intervalId = setInterval(() => {
      checkAgentRunning();
    }, 3000);

    // 清理函数：当agentRunning变为false或组件卸载时，清除定时器
    return () => {
      clearInterval(intervalId);
    };
  }, [agentRunning, current.id]);

  // 打开实时日志面板且本地无 taskId 时，从 Redis 拉取当前工作流的运行中 taskId
  // 正常情况下组件挂载时已恢复，此逻辑作为兜底：例如用户手动关闭日志面板后重新打开
  useEffect(() => {
    if (!showLogOutput || !current?.id || currentTaskId != null) return;
    dispatch({
      type: 'workflow/getRunningTaskId',
      payload: {flowId: current.id},
      callback: (resp: any) => {
        if (resp?.success && resp?.data != null) {
          setCurrentTaskId(resp.data);
        }
      },
    });
  }, [showLogOutput, current?.id, dispatch, currentTaskId]);

  // 导出智能工作流，保存文件并下载到本地
  const handleExportAgent = () => {
    dispatch({
      type: 'workflow/exportWorkflow',
      payload: current
    });
  }

  // 侧边栏编辑节点信息后执行保存操作, dx,dy设置为-1，可以使后台服务忽略此数据
  const handleSaveAction = () => {
    actionForm.validateFields().then(values => {
      const actionProps = JSON.stringify(extraProps);

      // 如果extraProps中包含conditionItems列表
      // case节点处理
      if (extraProps?.conditionItems) {

        // 遍历edges列表，从中找到所有sourceHandle等于conditionItems列表中id的边
        const existEdges = edges.filter(edge => {
          // 获取当前存在的边信息
          return extraProps.conditionItems.some(item => `case-${item.id}` === edge.sourceHandle);
        })

        // 遍历edges列表，找到所有flowId为current.id且source为currentNode.id的项
        const allEdges = edges.filter(edge => edge.flowId === current.id && edge.source === currentNode.id && edge.sourceHandle.startsWith('case-elseif'));

        // 获取allEdges中包含但是existEdges不包含的项, 输出的就是需要删除的边
        const removedEdges = allEdges.filter(edge => !existEdges.some(item => item.id === edge.id));
        // 逐项删除
        removedEdges.forEach(edge => {
          dispatch({
            type: 'workflow/deleteEdge',
            payload: {
              id: edge.id
            }
          })
        })
      }

      dispatch({
        type: 'workflow/saveAction',
        payload: {
          ...values,
          props: actionProps,
          id: currentNode.id,
          px: Math.round(currentNode.px),
          py: Math.round(currentNode.py),
          dx: -1,
          dy: -1
        },
        callback: resp => {
          if (resp.success) {
            loadFlow();
          }
        }
      })
    });
  }

  const handleClearLog = () => {
    Dialog({
      title: '清空日志',
      message: '清空所有日志，是否继续？',
      onConfirm: dlg => {
        dispatch({
          type: 'workflow/clearLog',
          payload: {flowId: current.id},
          callback: resp => {
            if (resp.success) {
              setShowLogHistory(false);
              dlg.doCancel();
            }
          }
        });
      }
    });
  }

  // 键盘事件处理函数, 处理Delete键删除节点和边
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete') {

      // 如果存在打开的侧边栏，则不响应删除操作
      if (hasSidePanelOpen.current) {
        return;
      }

      // 获取选中的节点和边
      const selectedNodes = nodes.filter(node => node.selected);
      const selectedEdges = edges.filter(edge => edge.selected);

      // 删除选中的节点
      selectedNodes.forEach(node => {
        deleteNode(node.id);
      });

      // 删除选中的边
      selectedEdges.forEach(edge => {
        dispatch({
          type: 'workflow/deleteEdge',
          payload: {
            id: edge.id
          },
          callback: resp => {
            if (resp.success) {
              // 刷新画布
              loadFlow();
            } else {
              error({
                title: '失败',
                message: '无法删除连线'
              });
            }
          }
        });
      });
    }
  }, [nodes, edges, current.id]);

  // 添加键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 添加鼠标事件监听，跟踪鼠标左键状态
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // 左键
        setIsMouseDown(true);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // 左键
        setIsMouseDown(false);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
      <div style={{height: frameSize.height, width}} className={'agent-flow-container'}>
        {
          showLoading ? (
              viewportRef.current && (
                  <>
                    {/*流程视图*/}
                    <ReactFlow
                        key={viewportRef.current.id} // 使用当前页面的 ID 作为 key, 确保每次页面切换时，画布重新加载
                        nodes={nodes}
                        edges={edges}
                        onInit={onInit}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onSelectionChange={onSelectionChange}
                        onViewportChange={onViewportChange}
                        fitView={false}
                        defaultViewport={{
                          x: viewportRef.current.px,
                          y: viewportRef.current.py,
                          zoom: viewportRef.current.zoom
                        }}
                        nodeTypes={{
                          actionNode: ActionNode,
                          groupNode: GroupNode,
                          startNode: StartNode,
                          stopNode: StopNode,
                          caseNode: CaseNode,
                          breakNode: BreakNode
                        }}
                    >
                      <Background style={{backgroundColor: '#f1f2f3'}}/>
                      <Controls showInteractive={false}/>
                    </ReactFlow>

                    {/*流程工具栏*/}
                    <div className={'agent-flow-bar'}>
                      <IconButton icon="add" size={28} items={nodeItems}/>
                      <IconButton icon="export" size={28} onClick={handleExportAgent}/>
                      {/* 分隔符 */}
                      <div className={'agent-flow-bar-divider'}/>
                      <IconButton icon="send" size={28} onClick={handleShowDebugPanel} disabled={agentRunning}/>
                      <IconButton icon="stop" size={28} onClick={handleStopWorkflow} disabled={!agentRunning}/>
                      <IconButton icon="log" size={28} onClick={() => setShowLogHistory(true)}/>
                      {/* 分隔符 */}
                      <div className={'agent-flow-bar-divider'}/>
                      <IconButton icon="settings" size={28} onClick={() => setShowSettingsPanel(true)}/>
                    </div>

                    {/*运行状态栏*/}
                    {
                        agentRunning && (
                            <div className={'agent-status-bar'}>
                              <div className={'agent-status-text'}>
                                运行中
                              </div>
                              <IconButton icon="chat_content" size={32} onClick={() => setShowLogOutput(true)}/>
                            </div>
                        )
                    }
                  </>
              )
          ) : (
              <div className={'air-flow-loading-wrapper'}>
                <Spin
                    tip="加载中"
                    size="large"
                >
                  <div className={'air-flow-loading'}/>
                </Spin>
              </div>
          )
        }

        {/* 节点信息侧边栏 */}
        <SlidePanel
            open={!!currentNode}
            title={currentNode?.name}
            type={['llm', 'http', 'agent', 'case', 'forEach'].includes(currentNode?.action) ? "large" : "medium"}
            hasCloseButton={true}
            onClose={() => {
              setCurrentNode(null);
            }}
            onConfirm={() => {
              handleSaveAction();
              setCurrentNode(null);
            }}
            onOpenChange={open => {
              hasSidePanelOpen.current = open;
            }}
        >
          {currentNode?.action === 'start' &&
              <StartActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                                setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'llm' &&
              <LLMActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                              setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'http' &&
              <HttpRequestActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                                      setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'agent' &&
              <AgentActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                                setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'loop' &&
              <LoopActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                               setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'forEach' &&
              <ForEachActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                                  setExtraProps={setExtraProps}/>}
          {currentNode?.action === 'case' &&
              <CaseActionPanel action={currentNode} form={actionForm} extraProps={extraProps}
                               setExtraProps={setExtraProps}/>}
        </SlidePanel>

        {/* 日志侧边栏 */}
        <SlidePanel
            open={showLogHistory}
            title="日志"
            type="huge"
            hasCloseButton={true}
            closeButtonText="关闭"
            onClose={() => {
              setShowLogHistory(false);
            }}
            onOpenChange={open => {
              hasSidePanelOpen.current = open;
            }}
            bodyPadding={0}
            footerExtra={<Button type="danger" onClick={handleClearLog}>清空</Button>}
        >
          <LogHistoryPanel flowId={current.id}/>
        </SlidePanel>

        {/* 设置侧边栏 */}
        <SlidePanel
            open={showSettingsPanel}
            title="执行设置"
            type="medium"
            hasCloseButton={true}
            onClose={() => {
              setShowSettingsPanel(false);
            }}
            onConfirm={handleSaveSettings}
            confirmButtonText="保存"
            closeButtonText="取消"
            onOpenChange={open => {
              hasSidePanelOpen.current = open;
            }}
        >
          <WorkflowSettingsPanel
              ref={settingsPanelRef}
              workflowId={current?.id || null}
              workflowName={current?.name}
              workflowInfo={current ? {
                id: current.id,
                name: current.name,
                description: current.description,
              } : undefined}
              dispatch={dispatch}
              onClose={() => setShowSettingsPanel(false)}
              onDelete={() => {
                deletedRef.current = true;
                onWorkflowDeleted?.();
              }}
          />
        </SlidePanel>

        <SlidePanel
            open={showLogOutput}
            title="实时日志"
            type="large"
            hasCloseButton={true}
            closeButtonText="关闭"
            bodyPadding={16}
            onClose={() => {
              setShowLogOutput(false);
              // 注意：不清理currentTaskId，以便再次打开时继续获取同一任务的日志
            }}
        >
          <RealtimeLogPanel
              taskId={currentTaskId}
              visible={showLogOutput}
              dispatch={dispatch}
              isTaskRunning={agentRunning && currentTaskId !== null}
          />
        </SlidePanel>
      </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(WorkflowInfo);
