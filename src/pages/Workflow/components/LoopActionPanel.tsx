import React, {useEffect} from 'react';
import {Form, InputNumber} from 'antd';

const LoopActionPanel: React.FC<any> = props => {

  const {
    form,
    action,
    extraProps,
    setExtraProps
  } = props;

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(action);

    if (!extraProps.loops) {
      setExtraProps({
        ...extraProps,
        loops: 5
      })
    }
  }, []);

  return (
      <div>
        <Form form={form} layout={'horizontal'}>
          <Form.Item
              label={'循环次数'}
              name={'loops'}
              rules={[{required: true, message: '请输入循环次数'}]}
              initialValue={extraProps.loops ? extraProps.loops : 5}
          >
            <InputNumber
                min={1}
                max={65535}
                onChange={(value: any) => {
                  setExtraProps({
                    ...extraProps,
                    loops: value
                  })
                }}
            />
          </Form.Item>
        </Form>
      </div>
  );
}

export default LoopActionPanel;
