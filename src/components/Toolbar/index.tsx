import React from 'react';
import {Icon} from 'air-design';
import {Button, ButtonGroup} from '@douyinfe/semi-ui';
import './index.less';

/**
 * 工具栏列表项
 * 用于 items 数组，每项渲染为一个可点击按钮（含图标、文案）
 */
export interface ToolbarItem {
  /** 唯一键，用作 React key */
  key: string;
  /** 按钮文案 */
  label: string;
  /** 图标名，对应 aird Icon 的 name，可选 */
  icon?: string;
  /** 点击回调，可选 */
  onClick?: () => void;
  /** 是否禁用，默认 false */
  disabled?: boolean;
}

/**
 * 工具栏组件属性
 * 通过 items 传入按钮列表，每项渲染为 icon+label 的按钮；支持 left/right 插槽补充自定义内容
 */
export interface ToolbarProps {
  /** 按钮列表，每项包含 key、label、icon、onClick、disabled（默认 false） */
  items?: ToolbarItem[];
  /** 是否显示按钮文案，默认 true；为 false 时仅显示图标，无图标时回退显示 label，并用 label 作为 title 提示 */
  showLabel?: boolean;
  /** 左侧额外内容，渲染在 items 之前，如搜索框、筛选器等 */
  left?: React.ReactNode;
  /** 右侧额外内容，如独立的主操作按钮等 */
  right?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 内联样式 */
  style?: React.CSSProperties;
}

/**
 * 工具栏组件
 *
 * 工具栏高度 50px 无边框，按钮高度 40px 带边框。通过 items 传入 JSON 列表，每项：key、label、icon、onClick、disabled（默认 false），
 * 渲染为一行按钮；可选 left、right 插槽补充自定义内容。
 *
 * 使用示例：
 * <Toolbar
 *   items={[{ key: 'new', label: '新建', icon: 'add', onClick: handleNew }]}
 *   showLabel={false}
 * />
 *
 * Created by ChaiMingXu, on 2026-01-25
 */
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {items = [], showLabel = true, left, right, className = '', style} = props;

  return (
      <div className={`air-toolbar ${className}`.trim()} style={style}>
        <div className="air-toolbar-left">
          {left}
          {items.length > 0 && (
              <ButtonGroup size="small" theme="light" className="air-toolbar-button-group">
                {items.map((item) => {
                  const iconOnly = showLabel === false;
                  const hasIcon = !!item.icon;
                  const children = iconOnly ? (hasIcon ? undefined : item.label) : item.label;
                  return (
                      <Button
                          key={item.key}
                          icon={hasIcon ? <Icon name={item.icon!} size={20}/> : undefined}
                          onClick={item.onClick}
                          disabled={item.disabled === true}
                          title={iconOnly ? item.label : undefined}
                      >
                        {children}
                      </Button>
                  );
                })}
              </ButtonGroup>
          )}
        </div>
        <div className="air-toolbar-right">{right}</div>
      </div>
  );
};

export default Toolbar;
