import React from "react";
import {Icon} from 'air-design';
import {Dropdown} from "antd";
import {Handle, NodeResizeControl, Position, useNodeId, useStore} from "@xyflow/react";

import {SubItems} from '../ActionItems';

const GroupNode: React.FC<any> = props => {

  const {
    data,
    selected
  } = props;

  // 获取当前节点的id
  const nodeId = useNodeId();

  // 获取节点信息
  const node = useStore((store) => store.nodes.find(n => n.id === nodeId));
  const nodes = useStore(store => store.nodes);

  let width = data.dx;
  let height = data.dy;

  // 安全地访问measured属性，避免在节点初始化时出错
  if (node && node.measured && typeof node.measured.width === 'number' && typeof node.measured.height === 'number') {
    width = node.measured.width;
    height = node.measured.height;
  }

  const subNodeItems = SubItems.map(item => {
    // 如果item.split为true，返回分隔符
    if (item.split) {
      return {
        type: 'divider' as const
      }
    }

    return {
      key: item.key,
      label: <div className={'dropdown-menu-item'}><Icon name={`agent_action_${item.key}`} size={18}/>{item.name}</div>,
      onClick: () => data.onAddSubNode(nodeId, nodes, item)
    }
  });

  return (
      <div className={`group-node ${selected ? 'selected' : ''} ${data.enabled === false ? 'node-disabled' : ''}`} style={{height: height, width: width}}>
        {/*添加resize控制器 */}
        {
            selected && <NodeResizeControl
                color={'transparent'}
                style={{border: 'none'}}
                minWidth={360}
                minHeight={200}
            >
                <div
                    style={{
                      cursor: 'resize',
                      position: 'absolute',
                      right: 2,
                      bottom: 2,
                    }}
                >
                    <Icon name={'resizer'} color={'#3366FF'} size={18}/>
                </div>
            </NodeResizeControl>
        }

        <div className={'group-node-header'}>
          <div className="group-node-label">
            <Icon name={`agent_action_${data.action === 'forEach' ? 'todo' : data.action}`} size={18}/>
            <span>{data.action === 'loop' ? '循环' : data.action === 'forEach' ? '任务列表' : '条件'}</span>
          </div>
          <div className={'group-node-right'}>
            <Dropdown menu={{items: subNodeItems}} trigger={['click']} destroyOnHidden={true}>
              <div className="group-node-more">
                <Icon name="add" size={18}/>
              </div>
            </Dropdown>
            <div className={'group-node-button'} onClick={() => {
              if (data.onDetail) data.onDetail(data);
            }}>
              <Icon name="detail" size={18}/>
            </div>
            <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
              <div className="group-node-more">
                <Icon name="more" size={18}/>
              </div>
            </Dropdown>
          </div>
        </div>

        <Handle
            type="target"
            position={Position.Left}
            className="group-node-handle-left"
        />
        <Handle
            type="source"
            position={Position.Right}
            className="group-node-handle-right"
        />
      </div>
  );
}

export default GroupNode;
