import React, {useEffect, useState} from 'react';
import {Icon} from 'air-design';
import {Dropdown} from 'antd';
import {Handle, Position} from '@xyflow/react';

const CaseNode: React.FC<any> = props => {

  const {
    data,
    selected
  } = props;

  const [propItems, setPropItems] = useState<any>({});

  useEffect(() => {
    if (data.props) {
      setPropItems(JSON.parse(data.props));
    }
  }, [data]);

  const elseCount = propItems?.conditionItems?.length || 0;
  // 计算节点高度
  const nodeHeight = 140 + elseCount * 20;

  const isDisabled = data.enabled === false;

  return (
      <div
          className={`agent-node agent-node-case ${selected ? 'selected' : ''} ${isDisabled ? 'node-disabled' : ''}`}
          style={{height: `${nodeHeight}px`}}
      >
        <div className={'agent-node-header'}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Icon name="agent_action_case" size={20} color={'#0062ff'}/>
            <div className="agent-node-label">{data.name}</div>
          </div>

          <div style={{display: 'flex', marginLeft: 'auto', gap: 2}}>
            <div className="agent-node-button" onClick={() => {
              if (data.onDetail) data.onDetail(data);
            }}>
              <Icon name="detail" size={18}/>
            </div>
            <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
              <div className="agent-node-button">
                <Icon name="more" size={18}/>
              </div>
            </Dropdown>
          </div>
        </div>

        <div className="agent-node-selection">
          <span key="case-if">IF</span>
          {
              propItems?.conditionItems && propItems?.conditionItems?.length > 0 && (
                  propItems?.conditionItems?.map((item: any) => (
                      <span key={item.id} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{fontWeight: 500, fontSize: '0.75rem', color: '#686868'}}>{item.label}</span>
                <span>ELSEIF</span>
              </span>
                  ))
              )
          }
          <span key="case-else">ELSE</span>
        </div>

        <div>
          <div className="agent-node-footer">
            {data.description}
          </div>
          {
              data.parentId && (
                  <div style={{padding: '0 0 8px 12px'}}>
                    <Icon name={'agent_action_loop_item'} size={22} color={'#3366FF'}/>
                  </div>
              )
          }
        </div>

        <Handle
            type="target"
            position={Position.Left}
            className="agent-node-handle-left"
            style={{background: '#0062ff'}}
        />

        {/* IF输出连接点 */}
        <Handle
            key="case-if"
            id="case-if"
            type="source"
            position={Position.Right}
            className="agent-node-handle-output"
            style={{top: '60px', background: '#0062ff'}}
        />

        {/* ELSEIF输出连接点 */}
        {
            propItems?.conditionItems && propItems?.conditionItems?.length > 0 && (
                propItems?.conditionItems?.map((item: any, index: number) => (
                    <Handle
                        key={`handle-${item.id}`}
                        id={`case-${item.id}`}
                        type="source"
                        position={Position.Right}
                        className="agent-node-handle-output"
                        style={{top: `${80 + index * 20}px`, background: '#0062ff'}}
                    />
                ))
            )
        }

        {/* ELSE输出连接点 */}
        <Handle
            key="case-else"
            id="case-else"
            type="source"
            position={Position.Right}
            className="agent-node-handle-output"
            style={{top: `${80 + elseCount * 20}px`, background: '#0062ff'}}
        />
      </div>
  );
}

export default CaseNode;
