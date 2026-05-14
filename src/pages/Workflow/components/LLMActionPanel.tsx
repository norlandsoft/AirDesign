import React, {useEffect} from "react";
import {connect} from "umi";
import {Form, Input, Select} from "antd";
import CodeEditor from '@/components/CodeEditor';

const LLMActionPanel: React.FC<any> = props => {

  const {
    dispatch,
    frameSize,
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  const [modelList, setModelList] = React.useState([]);

  useEffect(() => {
    form.resetFields();
    // 获取模型列表
    dispatch({
      type: 'llm/fetchActiveModels',
      payload: {},
      callback: (resp) => {
        if (resp.success) {
          // 不选 type 为 embedding 的模型；resp.data 中每一项的 id 和 name 转为 value 和 label
          setModelList((resp.data || []).filter((item: any) => item.type !== 'embedding').map((item: any) => ({
            value: item.id,
            label: item.name
          })));
        }
      }
    });

    form.setFieldsValue(action);
  }, []);

  return (
      <Form form={form}
            layout={'horizontal'}
            labelCol={{span: 2}}
            wrapperCol={{span: 22}}
            labelAlign={"right"}
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
            label={'模型'}
            name={'modelId'}
            initialValue={extraProps.modelId}
        >
          <Select
              placeholder={'请选择模型'}
              options={modelList}
              onChange={(_, data: any) => {
                setExtraProps({
                  ...extraProps,
                  modelId: data.value,
                  modelName: data.label
                })
              }}
          />
        </Form.Item>

        <Form.Item
            name={'prompt'}
            hidden={true}
            initialValue={extraProps.prompt}
        >
          <Input/>
        </Form.Item>

        <Form.Item
            label={'提示词'}
        >
          <CodeEditor
              width={'100%'}
              height={frameSize.height - 300}
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
      </Form>
  );
}

export default connect(({global, llm}) => ({
  frameSize: global.frameSize,
  llm
}))(LLMActionPanel);
