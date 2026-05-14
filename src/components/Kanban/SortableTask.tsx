import React from 'react';
import {IconButton} from 'air-design';

import {useSortable} from '@dnd-kit/sortable';

import {CSS} from '@dnd-kit/utilities';
import './index.less';

import {type TaskProps} from './KanbanProps';

// 任务的可排序组件
const SortableTask: React.FC<{
  task: TaskProps;
  index: number;
  /** 是否选中（高亮边框） */
  selected?: boolean;
  /** 只读模式：不可拖动，隐藏任务菜单 */
  readonly?: boolean;
  onDelete: (id: string) => void;
  /**
   * 点击任务卡片，整个任务项区域可响应（不包含右侧菜单按钮）
   */
  onClick?: () => void;
}> = ({task, index, selected, readonly, onDelete, onClick}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: task.id,
    disabled: readonly,
  });

  const title = task.title || (typeof task.content === 'string' ? task.content : '任务');
  const description = task.description || '';
  const assigneeName = task.assigneeName || (task.assigneeId ? `#${task.assigneeId.slice(0, 6)}` : '');
  const priority = task.priority || '';
  const priorityLabel = priority === 'high' ? '高' : priority === 'medium' ? '中' : priority === 'low' ? '低' : priority;

  const handleClickDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) onClick?.();
  };

  return (
      <div
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.3 : 1,
          }}
      >
        <div
            className={`air-kanban-task ${selected ? 'air-kanban-task--selected' : ''} ${onClick ? 'air-kanban-task--clickable' : ''}`}
            onClick={onClick ? handleClickDetail : undefined}
            onPointerDown={onClick ? e => e.stopPropagation() : undefined}
        >
          {/* 1. 标题：仅此处可拖动，整个任务项可点击 */}
          <div className="air-kanban-task-head">
            <div
                className={`air-kanban-task-drag-handle ${readonly ? 'air-kanban-task-drag-handle--readonly' : ''}`}
                title={title}
                {...(readonly ? {} : attributes)}
                {...(readonly ? {} : listeners)}
            >
              <span className="air-kanban-task-title">{title}</span>
            </div>
            {!readonly && (
                <div
                    className="air-kanban-task-menu"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                >
                  <IconButton
                      icon="more"
                      size={24}
                      dropdownPlacement="bottomRight"
                      items={[
                        {key: 'delete', label: '删除', onClick: () => onDelete(task.id)},
                      ]}
                  />
                </div>
            )}
          </div>
          {/* 2. 内容 */}
          <div
              className="air-kanban-task-content"
              title={description || '点击查看详情'}
          >
            {description || <span className="air-kanban-task-content-placeholder">点击查看详情</span>}
          </div>
          {/* 3. 优先级与负责人 */}
          <div className="air-kanban-task-footer">
            <div className="air-kanban-task-meta">
              {priority ? <span
                  className={`air-kanban-task-priority air-kanban-task-priority-${priority}`}>{priorityLabel}</span> : null}
              {assigneeName ?
                  <span className="air-kanban-task-assignee" title={assigneeName}>{assigneeName}</span> : null}
              {!priority && !assigneeName ?
                  <span className="air-kanban-task-footer-placeholder">优先级 · 负责人</span> : null}
            </div>
          </div>
        </div>
      </div>
  );
};

export default SortableTask;
