import React from "react";
import {Form, Input} from 'antd';

const FormItem = Form.Item;
const {TextArea} = Input;

const UserInfoForm = props => {

  const {
    form,
    team,
    type
  } = props;

  const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 21}
  };

  return (
      <Form
          form={form}
          layout="horizontal"
          {...formItemLayout}
      >
        {/*<FormItem*/}
        {/*  name='dept'*/}
        {/*  initialValue={team.key}*/}
        {/*  hidden={true}*/}
        {/*>*/}
        {/*  <Input/>*/}
        {/*</FormItem>*/}
        <FormItem
            label='ID'
            name='id'
            rules={[{required: true, message: '请输入登录ID'}]}
        >
          <Input disabled={type === 'edit'} placeholder='输入登录ID'/>
        </FormItem>
        <FormItem
            label='姓名'
            name='name'
            rules={[{required: true, message: '请输入姓名'}]}
        >
          <Input placeholder='输入用户姓名'/>
        </FormItem>
        <FormItem name='avatar' initialValue='u01' hidden={true}>
          <Input hidden/>
        </FormItem>
        <FormItem
            label='邮件'
            name='email'
            rules={[{required: false, message: '请输入电子邮件'}]}
        >
          <Input placeholder='输入电子邮件'/>
        </FormItem>
        <FormItem
            label='电话'
            name='phone'
            rules={[{required: false, message: '请输入电话号码'}]}
        >
          <Input placeholder='输入电话号码'/>
        </FormItem>
      </Form>
  );
}

export default UserInfoForm;
