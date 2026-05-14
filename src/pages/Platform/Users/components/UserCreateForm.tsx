import React from "react";
import {Form, Input} from 'antd';

const UserCreateForm: React.FC<any> = props => {

  const {
    form
  } = props;

  return (
      <Form
          form={form}
          layout="horizontal"
          labelCol={{span: 4}}
          wrapperCol={{span: 20}}
      >
        <Form.Item
            label={'ID'}
            name={'id'}
            rules={[{required: true, message: '请输入登录ID'}]}
        >
          <Input placeholder="输入登录ID"/>
        </Form.Item>
        <Form.Item
            label={'姓名'}
            name={'name'}
            rules={[{required: true, message: '请输入姓名'}]}
        >
          <Input placeholder="输入用户姓名"/>
        </Form.Item>
        <Form.Item
            label={'邮箱'}
            name={'email'}
            rules={[{required: false}]}
        >
          <Input placeholder="输入电子邮件（可选）"/>
        </Form.Item>
        <Form.Item
            label={'电话'}
            name={'phone'}
            rules={[{required: false}]}
        >
          <Input placeholder="输入电话号码（可选）"/>
        </Form.Item>
      </Form>
  )
}

export default UserCreateForm;
