// 任务的数据结构（与后端 ActionVO 对齐）
interface ActionProps {
  id: string;
  /**
   * 任务标题
   */
  title?: string;
  /**
   * 任务描述
   */
  description?: string;
  /**
   * 负责人用户ID
   */
  assigneeId?: string;
  /**
   * 负责人显示名（前端根据用户列表解析或后端扩展返回）
   */
  assigneeName?: string;
  /**
   * 优先级：high / medium / low
   */
  priority?: string;
  /**
   * 截止日期，ISO 日期字符串（前端已屏蔽展示与编辑，仅保留类型兼容）
   */
  dueDate?: string;
  /**
   * 前置任务ID，用于任务依赖
   */
  predecessorTaskId?: string;
  /**
   * 前置任务标题（前端从看板数据解析，用于只读展示）
   */
  predecessorTitle?: string;
  /**
   * 兼容旧字段：历史任务仅有 content 时，默认作为 title 展示
   */
  content?: string | React.ReactNode;
}

// 任务状态的数据结构（与后端 ActionStatusVO 对齐）
interface ActionStatus {
  id: string;
  name: string;
  /** 关联的工作ID，空表示全局状态列 */
  jobId?: string;
  color?: string;
  sortOrder?: number;
  tasks: ActionProps[];
}

// 组件属性定义
interface KanbanProps {
  data: ActionStatus[];
  /**
   * 新建状态列（状态在配置中管理时不需要传）
   */
  onNewStatus?: () => void;
  /**
   * 删除状态列（状态在配置中管理时不需要传）
   */
  onDeleteStatus?: (statusId: string) => void;
  /**
   * 重命名状态列（状态在配置中管理时不需要传）
   */
  onRenameStatus?: (statusId: string, oldName: string) => void;
  onAddTask?: (columnId: string) => void; // 在指定列添加任务
  onDeleteTask?: (columnId: string, taskId: string) => void; // 删除指定列下的任务
  /**
   * 点击任务卡片回调（用于打开侧边栏编辑等）
   *
   * @param columnId 任务所在列 ID（状态 ID）
   * @param taskId 任务 ID
   */
  onTaskClick?: (columnId: string, taskId: string) => void;
  onStatusChange?: (statusList: ActionStatus[]) => void; // 列顺序变化时的回调函数
  onTaskChange?: (statusList: ActionStatus[]) => void; // 任务变化时的回调函数
  /**
   * 同一状态列内拖动排序时触发
   * @param payload.taskId 任务 ID
   * @param payload.statusId 状态列 ID
   * @param payload.fromIndex 原下标（0-based）
   * @param payload.toIndex 新下标（0-based）
   * @param payload.orderedTaskIds 重排后该列内任务 ID 顺序（与 sort_order 0,1,2,... 对应）
   */
  onTaskReorder?: (payload: {
    taskId: string;
    statusId: string;
    fromIndex: number;
    toIndex: number;
    orderedTaskIds: string[];
  }) => void;
  /**
   * 跨状态列拖动时触发
   * @param payload.taskId 任务 ID
   * @param payload.fromStatusId 源状态列 ID
   * @param payload.toStatusId 目标状态列 ID
   * @param payload.toIndex 在目标列中的下标（0-based）
   */
  onTaskMove?: (payload: { taskId: string; fromStatusId: string; toStatusId: string; toIndex: number }) => void;
  width?: number; // 看板整体宽度，单位：px
  height?: number; // 看板整体高度，单位：px
  /** 当前选中的任务 ID，用于高亮显示 */
  selectedTaskId?: string;
  /** 只读模式：不可拖动状态列和任务项，隐藏任务菜单 */
  readonly?: boolean;
  /** 状态列宽度，单位 px，默认 255 */
  columnWidth?: number;
}

export type {ActionProps, ActionStatus, KanbanProps};

// 兼容别名：外部组件可能使用 TaskProps / TaskStatus 命名
export type TaskProps = ActionProps;
export type TaskStatus = ActionStatus;
