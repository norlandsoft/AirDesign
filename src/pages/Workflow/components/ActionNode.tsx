import React from 'react';
import {Dropdown} from 'antd';
import {Icon} from 'air-design';
import {Handle, Position} from '@xyflow/react';

import './NodeStyle.less';

interface ActionNodeProps {
  data: any;
  selected?: any;
}

const ActionNode: React.FC<ActionNodeProps> = ({data, selected}) => {

  const color = {
    http: '#607080',
    llm: '#123F68',
    loop: '#0062ff',
    agent: '#00AAFF',
  }[data.action];

  const isDisabled = data.enabled === false;

  return (
      <div className={`agent-node ${selected ? 'selected' : ''} ${isDisabled ? 'node-disabled' : ''}`} style={{border: `1px solid ${isDisabled ? '#bbb' : color}`}}>
        <div className="agent-node-header">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Icon name={`agent_action_${data.action}`} size={22} color={color}/>
          </div>
          <div className="agent-node-label">{data.name}</div>
          <div style={{display: 'flex', marginLeft: 'auto', gap: 2}}>
            <div className="agent-node-button" onClick={() => {
              if (data.onDetail) data.onDetail(data);
            }}>
              <Icon name="detail" size={18}/>
            </div>

            {/*更多选项*/}
            {
                data.toolMenuItems && (
                    <Dropdown menu={{items: data.toolMenuItems}} trigger={['click']} destroyOnHidden={true}>
                      <div className="agent-node-button">
                        <Icon name="more" size={18}/>
                      </div>
                    </Dropdown>
                )
            }
          </div>
        </div>

        {/*节点设置内容*/}
        {
            data.action && (
                <div className="agent-node-content">
                  {data.action === 'llm' && <LLMContent action={data}/>}
                  {data.action === 'http' && <HttpRequestContent action={data}/>}
                  {data.action === 'agent' && <AgentContent action={data}/>}
                </div>
            )
        }

        {/*节点说明*/}
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

        {/*节点连接点*/}
        {
            data.action && (
                <div>
                  <Handle
                      type="target"
                      position={Position.Left}
                      className={'agent-node-handle-left'}
                      style={{background: color}}
                  />
                  <Handle
                      type="source"
                      position={Position.Right}
                      className={'agent-node-handle-right'}
                      style={{background: color}}
                  />
                </div>
            )
        }
      </div>
  );
}

const rowStyle: React.CSSProperties = {display: 'flex', alignItems: 'center', gap: 8};
const labelStyle: React.CSSProperties = {display: 'inline-block', width: '3.5em', textAlign: 'left'};

const LLMContent = props => {
  const {action} = props;
  if (!action.props) {
    action.props = '{}';
  }
  const llmProps = JSON.parse(action.props);
  return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={rowStyle}><b style={labelStyle}>模型:</b>{llmProps.modelName}</div>
        <div style={rowStyle}><b style={labelStyle}>输出:</b>{action.outputKey}</div>
      </div>
  );
}

const HttpRequestContent = props => {
  const {action} = props;
  if (!action.props) {
    action.props = '{}';
  }
  const httpProps = JSON.parse(action.props);
  return (
      <div className="agent-node-content-info" style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={rowStyle}><b style={labelStyle}>方法:</b>{httpProps.method}</div>
        <div style={rowStyle}><b style={labelStyle}>接口:</b>{httpProps.url}</div>
      </div>
  );
}

const AgentContent = props => {
  const {action} = props;
  const agentProps = action.props ? JSON.parse(action.props) : {};
  const display = agentProps.agentName || 'ROOT';

  return (
      <div className="agent-node-content-info" style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={rowStyle}>
          <b style={labelStyle}>智能体:</b>{display}
          {agentProps.createNewSession && <span style={{
            color: '#fff',
            background: '#00AAFF',
            marginLeft: 6,
            padding: '0 4px',
            borderRadius: 3,
            fontSize: 11,
            lineHeight: '16px'
          }}>N</span>}
        </div>
        <div style={rowStyle}><b style={labelStyle}>输出:</b>{action.outputKey || ''}</div>
      </div>
  );
}

export default ActionNode;

