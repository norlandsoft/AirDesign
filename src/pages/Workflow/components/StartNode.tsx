import React from 'react';
import {Icon} from 'air-design';
import {Dropdown} from 'antd';
import {Handle, Position} from '@xyflow/react';

const StartNode: React.FC<any> = props => {

  const {
    data,
    selected
  } = props;

  return (
      <div className={`single-node ${selected ? 'selected' : ''}`}>
        <div className="single-node-label">
          <Icon name="agent_action_start" size={22}/>
          <span>开始</span>
        </div>

        <div className="single-node-right">
          <div className="single-node-button" onClick={() => {
            if (data.onDetail) data.onDetail(data);
          }}>
            <Icon name="detail" size={18}/>
          </div>

          <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
            <div className="single-node-more">
              <Icon name="more" size={18}/>
            </div>
          </Dropdown>
        </div>

        <Handle
            type="source"
            position={Position.Right}
            className="single-node-handle-right"
        />
      </div>
  );
}

export default StartNode;
