import React from 'react';
import {Icon} from 'air-design';
import {Dropdown} from 'antd';
import {Handle, Position} from '@xyflow/react';

const StopNode: React.FC<any> = props => {

  const {
    data,
    selected
  } = props;

  return (
      <div className={`single-node ${selected ? 'selected' : ''}`}>
        <div className="single-node-label">
          <Icon name="agent_action_stop" size={22}/>
          <span>结束</span>
        </div>
        <div className={'single-node-right'}>
          <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
            <div className="single-node-more">
              <Icon name="more" size={18}/>
            </div>
          </Dropdown>
        </div>
        <Handle
            type="target"
            position={Position.Left}
            className="single-node-handle-left"
        />
      </div>
  );
}

export default StopNode;
