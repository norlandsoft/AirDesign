import React, {useEffect} from "react";
import {connect} from "umi";
import {Form, Input, Select, Switch} from "antd";
import CodeEditor from '@/components/CodeEditor';

const AgentActionPanel: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  const [agentList, setAgentList] = React.useState([]);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(action);

    // 获取智能体列表
    dispatch({
      type: 'openclaw/fetchOpenclawAgents',
      callback: (resp: any) => {
        if (resp?.success) {
          const list = (resp.data || []).map((item: any) => ({
            value: item.id,
            label: item.name || item.id,
          }));
          setAgentList(list);
          // 缺省选择main智能体
          if (!extraProps.agentId) {
            const mainAgent = list.find((item: any) => item.value === 'main');
            setExtraProps({...extraProps, agentId: 'main', agentName: mainAgent?.label || 'main'});
            form.setFieldValue('agentId', 'main');
          }
        }
      }
    });
  }, []);

  return (
      <Form
          form={form}
          layout={'horizontal'}
          labelCol={{span: 2}}
          wrapperCol={{span: 22}}
          labelAlign={"left"}
      >
        <Form.Item
            name={'action'}
            hidden={true}
        >
          <Input/>
        </Form.Item>

        <Form.Item
            label={'名称'}
            name={'name'}
            rules={[{required: true, message: '请输入名称'}]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
            label={'描述'}
            name={'description'}
        >
          <Input.TextArea rows={2} style={{resize: 'none'}}/>
        </Form.Item>
        <Form.Item
            label={'智能体'}
            name={'agentId'}
            initialValue={extraProps.agentId || 'main'}
        >
          <Select
              placeholder={'请选择智能体'}
              options={agentList}
              onChange={(_: any, data: any) => {
                setExtraProps({
                  ...extraProps,
                  agentId: data.value,
                  agentName: data.label
                })
              }}
          />
        </Form.Item>

        <Form.Item
            label={'新会话'}
            valuePropName={'checked'}
            initialValue={extraProps.createNewSession || false}
        >
          <Switch
              checked={extraProps.createNewSession || false}
              onChange={(checked: boolean) => {
                setExtraProps({
                  ...extraProps,
                  createNewSession: checked
                })
              }}
          />
        </Form.Item>

        <Form.Item
            label={'任务'}
        >
          <CodeEditor
              width={'100%'}
              height={frameSize.height - 335}
              border={true}
              language={'markdown'}
              content={extraProps.prompt}
              showMap={false}
              onChange={(content: string) => {
                setExtraProps({
                  ...extraProps,
                  prompt: content
                })
              }}
          />
        </Form.Item>

        <Form.Item
            label={'输出'}
            name={'outputKey'}
        >
          <Input/>
        </Form.Item>

        <Form.Item
            name={'prompt'}
            hidden={true}
            initialValue={extraProps.prompt}
        >
          <Input/>
        </Form.Item>
      </Form>
  );
}

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(AgentActionPanel);
