/**
 * Form 表单组件 Demo
 *
 * 展示 Form / Form.Item 与 Input、Select、NumberInput、Checkbox、Radio 等字段组件的 antd 兼容用法。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {
  Button,
  Form,
  Input,
  PasswordInput,
  TextArea,
  NumberInput,
  Select,
  Checkbox,
  Radio,
  Switch,
  EditableLabel,
  Help,
  GroupSplitter,
  ColorPicker,
  Slider,
  Separator,
} from 'air-design'
import PageContainer from '../components/PageContainer'

interface DemoFormValues {
  email: string
  password: string
  age: number | null
  bio: string
  notify: boolean
  agree: boolean
  lang: string
  role: string
  interests: string[]
}

const LANG_OPTIONS = [
  {value: 'ts', label: 'TypeScript'},
  {value: 'js', label: 'JavaScript'},
  {value: 'py', label: 'Python'},
]

const ROLE_OPTIONS = [
  {value: 'dev', label: '开发'},
  {value: 'qa', label: '测试'},
  {value: 'pm', label: '产品'},
]

const INTEREST_OPTIONS = [
  {value: 'design', label: '界面设计'},
  {value: 'code', label: '前端开发'},
  {value: 'ai', label: '人工智能'},
]

const FormPage: React.FC = () => {
  const [form] = Form.useForm<DemoFormValues>()
  const [name, setName] = useState('可编辑标题')
  const [formSubmitted, setFormSubmitted] = useState('')
  const [themeColor, setThemeColor] = useState('#2563eb')
  const [volume, setVolume] = useState([60])

  return (
    <PageContainer
      title="表单组件"
      description="Form / Form.Item 与 Input、Select、NumberInput、Checkbox、Radio 等，API 对齐 antd，控件默认高度 38px。"
    >
      <div className="demo-block">
        <GroupSplitter title="Form 综合示例（antd 风格）"/>
        <Form<DemoFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            email: '',
            password: '',
            age: null,
            bio: '',
            notify: true,
            agree: false,
            lang: 'ts',
            role: 'dev',
            interests: ['code'],
          }}
          onFinish={(values) => setFormSubmitted(JSON.stringify(values, null, 2))}
          className="max-w-lg"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              {required: true, message: '请输入邮箱'},
              {type: 'email', message: '邮箱格式不正确'},
            ]}
          >
            <Input placeholder="name@example.com" allowClear prefix="@"/>
          </Form.Item>

          <Form.Item name="password" label="密码" rules={[{required: true}, {min: 8, message: '至少 8 位'}]}>
            <PasswordInput placeholder="请输入密码"/>
          </Form.Item>

          <Form.Item name="age" label="年龄" rules={[{type: 'integer'}, {min: 1}, {max: 120}]}>
            <NumberInput min={1} max={120} placeholder="年龄"/>
          </Form.Item>

          <Form.Item name="bio" label="简介">
            <TextArea rows={4} showCount maxLength={200} placeholder="选填"/>
          </Form.Item>

          <Form.Item name="lang" label="语言" rules={[{required: true}]}>
            <Select options={LANG_OPTIONS} placeholder="选择语言" allowClear/>
          </Form.Item>

          <Form.Item name="role" label="角色">
            <Radio.Group optionType="button" options={ROLE_OPTIONS}/>
          </Form.Item>

          <Form.Item name="interests" label="兴趣" valuePropName="value">
            <Checkbox.Group options={INTEREST_OPTIONS}/>
          </Form.Item>

          <Form.Item name="notify" label="消息通知" valuePropName="checked">
            <Switch/>
          </Form.Item>

          <Form.Item name="agree" valuePropName="checked" rules={[{required: true, message: '请同意协议'}]}>
            <Checkbox>我已阅读并同意用户协议</Checkbox>
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2">
              <Button type="primary" icon="check" onClick={() => form.submit()}>
                提交
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </div>
          </Form.Item>
        </Form>
        {formSubmitted ? <pre className="demo-code mt-4">{formSubmitted}</pre> : null}
      </div>

      <div className="demo-block">
        <GroupSplitter title="EditableLabel / Help"/>
        <div className="demo-row">
          <EditableLabel text={name} onSave={setName}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">带 Help</span>
          <div className="flex items-center gap-2">
            <Input placeholder="API Key" style={{maxWidth: 280}}/>
            <Help text="在控制台「设置 → 密钥」中创建，请勿泄露给他人。"/>
          </div>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Input / Password / NumberInput"/>
        <div className="demo-row">
          <span className="demo-label">文本</span>
          <Input placeholder="请输入内容" allowClear style={{maxWidth: 280}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">密码</span>
          <PasswordInput placeholder="请输入密码" style={{maxWidth: 280}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">数字</span>
          <NumberInput min={0} max={100} style={{maxWidth: 160}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Input disabled defaultValue="不可编辑" style={{maxWidth: 280}}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Select / Radio / Checkbox"/>
        <div className="demo-row">
          <span className="demo-label">Select</span>
          <Select options={LANG_OPTIONS} placeholder="选择语言" style={{width: 220}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">Radio</span>
          <Radio.Group options={ROLE_OPTIONS}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">Checkbox</span>
          <Checkbox.Group options={INTEREST_OPTIONS}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="ColorPicker / Slider"/>
        <div className="demo-row">
          <span className="demo-label">主题色</span>
          <ColorPicker value={themeColor} onChangeComplete={(c) => setThemeColor(c.toHexString())}>
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-border px-3 text-sm hover:bg-accent"
              style={{height: 38}}
            >
              <span className="size-5 rounded border border-border" style={{backgroundColor: themeColor}}/>
              选择颜色
            </button>
          </ColorPicker>
        </div>
        <div className="demo-row">
          <span className="demo-label">音量</span>
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} style={{maxWidth: 280, flex: 1}}/>
          <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">{volume[0]}</span>
        </div>
        <Separator style={{maxWidth: 400, marginTop: 8}}/>
      </div>
    </PageContainer>
  )
}

export default FormPage
