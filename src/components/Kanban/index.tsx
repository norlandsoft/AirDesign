import React, {useState} from 'react';
import {IconButton} from 'air-design';

// dnd-kit 相关导入
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import './index.less';

import SortableColumn from './SortableColumn';
import SortableTask from './SortableTask';
import {type KanbanProps, type TaskProps, type TaskStatus} from './KanbanProps';

const Kanban: React.FC<KanbanProps> = props => {

  const {
    data,
    selectedTaskId,
    readonly = false,
    columnWidth = 255,
    onNewStatus,
    onDeleteStatus,
    onRenameStatus,
    onAddTask,
    onDeleteTask,
    onTaskClick,
    onStatusChange,
    onTaskChange,
    onTaskReorder,
    onTaskMove,
    width = 800,
    height = 400
  } = props;

  const showToolbar = !!onNewStatus;

  // 拖拽相关状态
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<{ task: TaskProps; columnId: string } | null>(null);

  // dnd-kit 传感器
  const sensors = useSensors(
      useSensor(PointerSensor, {activationConstraint: {distance: 5}})
  );

  const handleAddTask = (columnId: string) => {
    onAddTask?.(columnId);
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    onDeleteTask?.(columnId, taskId);
  };

  // dnd-kit 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveColumnId(null);
    setActiveTask(null);
    if (!over) return;
    // 列拖拽
    if (data.find(col => col.id === active.id) && data.find(col => col.id === over.id)) {
      const oldIndex = data.findIndex(col => col.id === active.id);
      const newIndex = data.findIndex(col => col.id === over.id);
      if (oldIndex !== newIndex) {
        const newColumns = arrayMove(data, oldIndex, newIndex);
        //setColumns(newColumns);
        onStatusChange?.(newColumns);
      }
      return;
    }
    // 任务拖拽
    let sourceCol: TaskStatus | undefined, destCol: TaskStatus | undefined, task: TaskProps | undefined;
    data.forEach(col => {
      if (col.tasks.find(t => t.id === active.id)) {
        sourceCol = col;
        task = col.tasks.find(t => t.id === active.id);
      }
      if (col.tasks.find(t => t.id === over.id)) {
        destCol = col;
      }
    });
    // 1. 拖到任务上（目标是任务 id）
    if (sourceCol && destCol && task) {
      if (sourceCol.id !== destCol.id) {
        const overIndex = destCol.tasks.findIndex(t => t.id === over.id);
        onTaskMove?.({
          taskId: task.id,
          fromStatusId: sourceCol.id,
          toStatusId: destCol.id,
          toIndex: overIndex,
        });
      } else {
        // 同列内排序
        const oldIndex = sourceCol.tasks.findIndex(t => t.id === active.id);
        const newIndex = sourceCol.tasks.findIndex(t => t.id === over.id);
        if (oldIndex !== newIndex) {
          const newTasks = arrayMove(sourceCol.tasks, oldIndex, newIndex);
          const newColumns = data.map(col =>
              col.id === sourceCol!.id ? {...col, tasks: newTasks} : col
          );
          onTaskChange?.(newColumns);
          onTaskReorder?.({
            taskId: task.id,
            statusId: sourceCol.id,
            fromIndex: oldIndex,
            toIndex: newIndex,
            orderedTaskIds: newTasks.map((t) => t.id),
          });
        }
      }
      return;
    }
    // 2. 拖到空白列（目标是列 id）
    if (sourceCol && task && data.find(col => col.id === over.id)) {
      const destCol2 = data.find(col => col.id === over.id)!;
      if (sourceCol.id !== destCol2.id) {
        const toIndex = destCol2.tasks.length;
        onTaskMove?.({
          taskId: task.id,
          fromStatusId: sourceCol.id,
          toStatusId: destCol2.id,
          toIndex,
        });
      }
    }
  };

  return (
      <div
          className="air-kanban-container"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
      >
        {showToolbar && (
            <div className="air-kanban-header">
              <IconButton icon="add" size={32} onClick={onNewStatus} tooltip="新建状态"/>
            </div>
        )}

        {/* dnd-kit 拖拽上下文 */}
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={e => {
              // 记录拖拽的列或任务
              if (data.find(col => col.id === e.active.id)) {
                setActiveColumnId(e.active.id as string);
              } else {
                // 任务拖拽
                const col = data.find(col => col.tasks.find(t => t.id === e.active.id));
                if (col) {
                  const task = col.tasks.find(t => t.id === e.active.id);
                  if (task) setActiveTask({task, columnId: col.id});
                }
              }
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              setActiveColumnId(null);
              setActiveTask(null);
            }}
        >
          {/* 列的可排序容器 */}
          <SortableContext items={data.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            <div className="air-kanban-board">
              {data.map((status, colIndex) => (
                  <SortableColumn
                      key={status.id}
                      column={status}
                      index={colIndex}
                      readonly={readonly}
                      columnWidth={columnWidth}
                      headerActions={{
                        onAddTask: handleAddTask,
                        onRenameStatus,
                        onDeleteStatus
                      }}
                  >
                    <SortableContext items={status.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="air-kanban-task-list">
                        {status.tasks.map((task, taskIndex) => (
                            <SortableTask
                                key={task.id}
                                task={task}
                                index={taskIndex}
                                selected={selectedTaskId === task.id}
                                readonly={readonly}
                                onDelete={tid => handleDeleteTask(status.id, tid)}
                                onClick={() => onTaskClick?.(status.id, task.id)}
                            />
                        ))}
                      </div>
                    </SortableContext>
                  </SortableColumn>
              ))}
            </div>
          </SortableContext>
          {/* 拖拽时的悬浮层，显示正在拖拽的列或任务 */}
          <DragOverlay>
            {activeColumnId ? (
                // 只显示标题部分
                (() => {
                  const col = data.find(col => col.id === activeColumnId);
                  if (!col) return null;
                  return (
                      <div
                          style={{width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth, maxHeight: height}}>
                        <div className="air-kanban-column air-kanban-column-overlay">
                          <div className="air-kanban-column-inner">
                            <div className="air-kanban-column-header">
                              <span className="air-kanban-column-header-title">{col.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                  );
                })()
            ) : activeTask ? (
                (() => {
                  const t = activeTask.task as TaskProps;
                  const title = t.title || (typeof t.content === 'string' ? t.content : '任务');
                  const priorityLabel = t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : t.priority === 'low' ? '低' : t.priority || '';
                  return (
                      <div style={{width: '100%'}}>
                        <div className="air-kanban-task air-kanban-task-overlay">
                          <div className="air-kanban-task-head">
                            <div className="air-kanban-task-title">{title}</div>
                          </div>
                          <div className="air-kanban-task-content">{t.description || ''}</div>
                          <div className="air-kanban-task-footer">
                            <div className="air-kanban-task-meta">
                              {t.priority ? <span
                                  className={`air-kanban-task-priority air-kanban-task-priority-${t.priority}`}>{priorityLabel}</span> : null}
                              {(t.assigneeName || t.assigneeId) ? <span
                                  className="air-kanban-task-assignee">{t.assigneeName || `#${(t.assigneeId || '').slice(0, 6)}`}</span> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                  );
                })()
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
  );
};

export default Kanban;
