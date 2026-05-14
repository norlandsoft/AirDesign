import React, {useEffect} from 'react';
import {connect} from 'umi';
import {Form, Input} from 'antd';
import CodeEditor from '@/components/CodeEditor';

const StartActionPanel: React.FC<any> = props => {

  const {
    frameSize,
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(action);
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
            label={'初始内容 [task.input] :'}
            layout={'vertical'}
            labelCol={{span: 24}}
            wrapperCol={{span: 24}}
        >
          <CodeEditor
              width={'100%'}
              height={frameSize.height - 320}
              border={true}
              language={'markdown'}
              content={extraProps.initContent}
              showMap={false}
              lineNumbers={false}
              onChange={(content: string) => {
                setExtraProps({
                  ...extraProps,
                  initContent: content
                })
              }}
          />
        </Form.Item>
      </Form>
  );
}

export default connect(({global}) => ({
  frameSize: global.frameSize
}))(StartActionPanel);
