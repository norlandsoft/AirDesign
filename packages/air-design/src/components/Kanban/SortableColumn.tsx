import React from 'react';
import IconButton from '@/components/Button/IconButton';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {type TaskStatus} from './KanbanProps';

/**
 * 任务状态列组件（可拖拽）
 *
 * 设计思路：
 * - 不使用 antd Card，改为纯 div 结构，确保高度链可控
 * - 列容器自身不滚动，仅任务列表区域出现纵向滚动条
 * - 列头包含：列名（拖拽把手）、添加任务按钮、更多菜单按钮
 *
 * Created by ChaiMingXu, on 2026/2/4
 */

/** 列头操作：添加任务、重命名、删除 */
export interface ColumnHeaderActions {
  onAddTask?: (columnId: string) => void;
  onRenameStatus?: (columnId: string, oldName: string) => void;
  onDeleteStatus?: (columnId: string) => void;
}

const HEADER_BUTTON_SIZE = 28;

const SortableColumn: React.FC<{
  column: TaskStatus;
  index: number;
  children: React.ReactNode;
  readonly?: boolean;
  /** 列宽度，单位 px */
  columnWidth?: number;
  headerActions?: ColumnHeaderActions;
}> = ({column, children, readonly, columnWidth = 272, headerActions}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: column.id,
    disabled: readonly,
  });

  const {onAddTask, onRenameStatus, onDeleteStatus} = headerActions || {};

  return (
      <div
          ref={setNodeRef}
          className={`air-kanban-column ${readonly ? 'air-kanban-column--readonly' : ''}`}
          style={{
            flex: `0 0 ${columnWidth}px`,
            width: columnWidth,
            minWidth: columnWidth,
            maxWidth: columnWidth,
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
          }}
          {...attributes}
      >
        <div className="air-kanban-column-inner">
          <div className="air-kanban-column-header">
          <span {...(readonly ? {} : listeners)} className="air-kanban-column-header-title">
            {column.name}
          </span>
            <div className="air-kanban-column-header-actions">
              {onAddTask && !readonly && (
                  <IconButton
                      icon="add_square"
                      size={HEADER_BUTTON_SIZE}
                      tooltip="添加任务"
                      onClick={() => onAddTask(column.id)}
                  />
              )}
              {onRenameStatus && onDeleteStatus && (
                  <IconButton
                      icon="more"
                      size={HEADER_BUTTON_SIZE}
                      dropdownPlacement="bottomRight"
                      items={[
                        {
                          key: 'renameStatus',
                          label: '重命名',
                          onClick: () => onRenameStatus(column.id, column.name),
                        },
                        {type: 'divider'},
                        {
                          key: 'deleteStatus',
                          label: '删除',
                          onClick: () => onDeleteStatus(column.id),
                        },
                      ]}
                  />
              )}
            </div>
          </div>
          <div className="air-kanban-column-body">{children}</div>
        </div>
      </div>
  );
};

export default SortableColumn;
