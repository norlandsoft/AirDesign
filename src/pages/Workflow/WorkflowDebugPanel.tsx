import React, {useEffect} from 'react';
import {Form, Input} from 'antd';

const WorkflowDebugPanel: React.FC<any> = props => {

  const {
    form,
    extraProps
  } = props;

  // 对话框打开时，清除上次的任务描述
  useEffect(() => {
    form.setFieldsValue({
      description: ''
    });
  }, []);

  return (
      <Form form={form}>
        <Form.Item
            label="描述"
            name="description"
        >
          <Input
              placeholder="请输入任务描述（可选）"
          />
        </Form.Item>
      </Form>
  );
}

export default WorkflowDebugPanel;
