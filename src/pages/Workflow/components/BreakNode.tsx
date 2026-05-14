import React from 'react';
import {Icon} from 'air-design';
import {Dropdown} from 'antd';
import {Handle, Position} from '@xyflow/react';

const BreakNode: React.FC<any> = props => {

  const {
    data,
    selected
  } = props;

  return (
      <div className={`single-node ${selected ? 'selected' : ''} ${data.enabled === false ? 'node-disabled' : ''}`}
           style={{backgroundColor: '#f1f2f3', borderColor: data.enabled === false ? '#bbb' : '#aa66aa'}}>
        <div className="single-node-label">
          <Icon name={data.action === 'break' ? 'agent_action_break' : 'agent_action_continue'} size={22}
                color={'#aa66aa'}/>
          <span style={{color: '#aa66aa'}}>
          {
            data.action === 'break' ? '退出循环' : '下一循环'
          }
        </span>
        </div>
        <div className={'single-node-right'}>
          <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
            <div className="single-node-more">
              <Icon name="more" size={18} color={'#aa66aa'}/>
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

export default BreakNode;
