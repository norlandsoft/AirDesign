/**
 * Form 表单组件 Demo
 *
 * 分区块展示 Form 三种布局、全部字段组件、校验规则、Form.List 动态列表及 FormInstance API。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {
  Button,
  Form,
  FormListField,
  Input,
  PasswordInput,
  TextArea,
  NumberInput,
  Select,
  Checkbox,
  Radio,
  Switch,
  GroupSplitter,
  Separator,
} from 'air-design'
import PageContainer from '../components/PageContainer'

/** 下拉选项：编程语言 */
const LANG_OPTIONS = [
  {value: 'ts', label: 'TypeScript'},
  {value: 'js', label: 'JavaScript'},
  {value: 'py', label: 'Python'},
  {value: 'go', label: 'Go'},
]

/** 下拉选项：角色 */
const ROLE_OPTIONS = [
  {value: 'dev', label: '开发'},
  {value: 'qa', label: '测试'},
  {value: 'pm', label: '产品'},
  {value: 'design', label: '设计'},
]

/** 多选：兴趣标签 */
const INTEREST_OPTIONS = [
  {value: 'design', label: '界面设计'},
  {value: 'code', label: '前端开发'},
  {value: 'ai', label: '人工智能'},
  {value: 'ops', label: '运维部署'},
]

/** 综合表单字段类型 */
interface RegisterFormValues extends Record<string, unknown> {
  username: string
  email: string
  password: string
  age: number | null
  bio: string
  lang: string
  role: string
  interests: string[]
  notify: boolean
  agree: boolean
}

/** 校验演示表单 */
interface ValidateFormValues extends Record<string, unknown> {
  username: string
  phone: string
  website: string
  confirmPassword: string
  password: string
}

/** Form.List 联系人条目 */
interface ContactItem {
  name: string
  phone: string
}

interface ListFormValues extends Record<string, unknown> {
  contacts: ContactItem[]
}

/** 实例方法演示表单 */
interface InstanceFormValues extends Record<string, unknown> {
  title: string
  category: string
  priority: number | null
}

/** JSON 结果展示 */
const ResultBlock: React.FC<{value: string}> = ({value}) =>
  value ? <pre className="demo-code">{value}</pre> : null

/** 一、三种布局对比（每种布局独立 Form 实例） */
const LayoutFormDemo: React.FC<{
  layout: 'vertical' | 'horizontal' | 'inline'
  title: string
  horizontalCols?: boolean
}> = ({layout, title, horizontalCols}) => {
  const [form] = Form.useForm()

  return (
    <div className="demo-form-layout-card">
      <h4>{title}</h4>
      <Form
        form={form}
        layout={layout}
        labelCol={horizontalCols ? {span: 6} : undefined}
        wrapperCol={horizontalCols ? {span: 18} : undefined}
        onFinish={(v) => console.log(layout, v)}
      >
        <Form.Item name="keyword" label="关键词" rules={[{required: true, message: '请输入关键词'}]}>
          <Input
            placeholder="搜索内容"
            allowClear
            style={layout === 'inline' ? {width: 140} : undefined}
          />
        </Form.Item>
        <Form.Item name="category" label="分类">
          <Select
            options={ROLE_OPTIONS}
            placeholder={layout === 'inline' ? '分类' : '选择分类'}
            allowClear
            style={{width: layout === 'inline' ? 120 : '100%'}}
          />
        </Form.Item>
        <Form.Item label={horizontalCols ? ' ' : undefined} colon={false}>
          <Button type="primary" icon="search" onClick={() => form.submit()}>
            查询
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

const LayoutSection: React.FC = () => (
  <div className="demo-block">
    <GroupSplitter title="Form 布局（vertical / horizontal / inline）"/>
    <p className="mb-4 text-sm text-muted-foreground">
      同一组字段分别采用垂直、水平（labelCol 6 / wrapperCol 18）与行内三种布局。
    </p>
    <div className="demo-form-layouts">
      <LayoutFormDemo layout="vertical" title='layout="vertical"'/>
      <LayoutFormDemo layout="horizontal" title='layout="horizontal"' horizontalCols/>
      <LayoutFormDemo layout="inline" title='layout="inline"'/>
    </div>
  </div>
)

/** 二、字段组件独立展示（非 Form 绑定） */
const FieldsSection: React.FC = () => (
  <div className="demo-block">
    <GroupSplitter title="字段组件（Input / Select / Checkbox / Radio / Switch 等）"/>
    <p className="mb-4 text-sm text-muted-foreground">
      以下控件可单独使用，也可放入 Form.Item；默认高度 40px（--control-height）。
    </p>
    <div className="demo-form-fields-grid">
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Input（prefix / suffix / allowClear）</span>
        <Input prefix="@" suffix=".com" allowClear placeholder="用户名"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Input disabled</span>
        <Input disabled defaultValue="不可编辑"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Input status=&quot;error&quot;</span>
        <Input status="error" defaultValue="格式错误示例"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">PasswordInput</span>
        <PasswordInput placeholder="请输入密码"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">NumberInput（min / max / step）</span>
        <NumberInput min={0} max={100} step={5} defaultValue={10}/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">TextArea（showCount / maxLength）</span>
        <TextArea rows={3} showCount maxLength={120} placeholder="多行文本"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Select 单选（allowClear）</span>
        <Select options={LANG_OPTIONS} placeholder="选择语言" allowClear/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Select 多选 mode=&quot;multiple&quot;</span>
        <Select mode="multiple" options={INTEREST_OPTIONS} placeholder="选择兴趣" allowClear/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Checkbox 单个</span>
        <Checkbox defaultChecked>接收邮件通知</Checkbox>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Checkbox.Group</span>
        <Checkbox.Group options={INTEREST_OPTIONS} defaultValue={['code']}/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Radio.Group（default）</span>
        <Radio.Group options={ROLE_OPTIONS} defaultValue="dev"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Radio.Group（optionType=&quot;button&quot;）</span>
        <Radio.Group optionType="button" options={ROLE_OPTIONS} defaultValue="dev"/>
      </div>
      <div className="demo-form-field-cell">
        <span className="demo-field-label">Switch</span>
        <Switch defaultChecked/>
      </div>
    </div>
  </div>
)

/** 三、Form.Item 元信息（help / extra / requiredMark） */
const ItemMetaSection: React.FC = () => (
  <div className="demo-block">
    <GroupSplitter title="Form.Item 元信息（help / extra / requiredMark）"/>
    <Form
      layout="vertical"
      requiredMark="optional"
      initialValues={{apiKey: ''}}
      className="max-w-lg"
    >
      <Form.Item
        name="apiKey"
        label="API Key"
        rules={[{required: true, message: '请输入 API Key'}]}
        help="在控制台「设置 → 密钥」中创建，请勿泄露。"
        extra="密钥创建后仅展示一次，请妥善保存。"
      >
        <Input placeholder="sk-xxxxxxxx" allowClear/>
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <TextArea rows={2} placeholder="选填，最多 200 字"/>
      </Form.Item>
    </Form>
  </div>
)

/** 四、校验规则与 onFinishFailed */
const ValidationSection: React.FC = () => {
  const [form] = Form.useForm<ValidateFormValues>()
  const [failedInfo, setFailedInfo] = useState('')
  const [successValues, setSuccessValues] = useState('')

  return (
    <div className="demo-block">
      <GroupSplitter title="校验规则（rules / validator / onFinishFailed）"/>
      <Form<ValidateFormValues>
        form={form}
        layout="vertical"
        className="max-w-lg"
        onFinish={(values) => {
          setSuccessValues(JSON.stringify(values, null, 2))
          setFailedInfo('')
        }}
        onFinishFailed={({errorFields}) => {
          setSuccessValues('')
          setFailedInfo(
            JSON.stringify(
              errorFields.map((f) => ({name: f.name, errors: f.errors})),
              null,
              2
            )
          )
        }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            {required: true, message: '请输入用户名'},
            {min: 3, max: 16, message: '长度 3–16 个字符'},
            {pattern: /^[a-zA-Z0-9_]+$/, message: '仅允许字母、数字与下划线'},
          ]}
        >
          <Input placeholder="user_name" allowClear/>
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            {required: true, message: '请输入手机号'},
            {pattern: /^1\d{10}$/, message: '请输入 11 位手机号'},
          ]}
        >
          <Input placeholder="13800138000"/>
        </Form.Item>

        <Form.Item name="website" label="个人网站" rules={[{type: 'url', message: '请输入合法 URL'}]}>
          <Input placeholder="https://example.com"/>
        </Form.Item>

        <Form.Item name="password" label="密码" rules={[{required: true}, {min: 8, message: '至少 8 位'}]}>
          <PasswordInput placeholder="设置密码"/>
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          rules={[
            {required: true, message: '请再次输入密码'},
            {
              validator: async (_rule, value) => {
                if (!value || form.getFieldValue('password') === value) return
                return '两次密码不一致'
              },
            },
          ]}
        >
          <PasswordInput placeholder="再次输入密码"/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" icon="check" onClick={() => form.submit()}>
            校验并提交
          </Button>
        </Form.Item>
      </Form>
      {failedInfo ? (
        <>
          <p className="mt-4 text-sm text-destructive">onFinishFailed 错误字段：</p>
          <ResultBlock value={failedInfo}/>
        </>
      ) : null}
      <ResultBlock value={successValues}/>
    </div>
  )
}

/** 五、Form.List 动态增删 */
const ListSection: React.FC = () => {
  const [form] = Form.useForm<ListFormValues>()
  const [listResult, setListResult] = useState('')

  return (
    <div className="demo-block">
      <GroupSplitter title="Form.List 动态列表"/>
      <Form<ListFormValues>
        form={form}
        layout="vertical"
        initialValues={{contacts: [{name: '张三', phone: '13800138001'}]}}
        onFinish={(values) => setListResult(JSON.stringify(values, null, 2))}
        className="max-w-2xl"
      >
        <Form.List name="contacts">
          {(fields, {add, remove, move}) => (
            <>
              {fields.map((field, index) => (
                <FormListField key={field.key} fieldName={field.name} listName={['contacts']}>
                  <div className="demo-form-list-row">
                    <Form.Item
                      name="name"
                      label={`联系人 ${index + 1}`}
                      rules={[{required: true, message: '请输入姓名'}]}
                      className="mb-0 min-w-[10rem] flex-1"
                    >
                      <Input placeholder="姓名"/>
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label="电话"
                      rules={[
                        {required: true, message: '请输入电话'},
                        {pattern: /^1\d{10}$/, message: '手机号格式不正确'},
                      ]}
                      className="mb-0 min-w-[11.25rem] flex-1"
                    >
                      <Input placeholder="手机号"/>
                    </Form.Item>
                    <div className="flex shrink-0 gap-2 pt-7">
                      {index > 0 ? (
                        <Button size="sm" onClick={() => move(index, index - 1)}>
                          上移
                        </Button>
                      ) : null}
                      {index < fields.length - 1 ? (
                        <Button size="sm" onClick={() => move(index, index + 1)}>
                          下移
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        type="danger"
                        disabled={fields.length <= 1}
                        onClick={() => remove(field.name)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </FormListField>
              ))}
              <Form.Item>
                <Button icon="add" onClick={() => add({name: '', phone: ''})}>
                  添加联系人
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" icon="check" onClick={() => form.submit()}>
            提交列表
          </Button>
        </Form.Item>
      </Form>
      <ResultBlock value={listResult}/>
    </div>
  )
}

/** 六、FormInstance API 演示 */
const InstanceSection: React.FC = () => {
  const [form] = Form.useForm<InstanceFormValues>()
  const [apiLog, setApiLog] = useState('')

  const log = (label: string, data: unknown) => {
    setApiLog(`${label}:\n${JSON.stringify(data, null, 2)}`)
  }

  return (
    <div className="demo-block">
      <GroupSplitter title="FormInstance 方法（getFieldsValue / setFieldsValue / validateFields / resetFields）"/>
      <Form<InstanceFormValues>
        form={form}
        layout="vertical"
        initialValues={{title: '', category: 'dev', priority: 3}}
        className="max-w-lg"
        onFinish={(values) => log('onFinish', values)}
      >
        <Form.Item name="title" label="标题" rules={[{required: true, message: '请输入标题'}]}>
          <Input placeholder="任务标题" allowClear/>
        </Form.Item>
        <Form.Item name="category" label="分类">
          <Select options={ROLE_OPTIONS} style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item name="priority" label="优先级（1–5）" rules={[{type: 'integer'}, {min: 1}, {max: 5}]}>
          <NumberInput min={1} max={5}/>
        </Form.Item>
        <Form.Item>
          <div className="flex flex-wrap gap-2">
            <Button type="primary" onClick={() => form.submit()} icon="check">
              form.submit()
            </Button>
            <Button onClick={() => log('getFieldsValue()', form.getFieldsValue())}>getFieldsValue</Button>
            <Button
              onClick={() => {
                form.setFieldsValue({title: '预设标题', priority: 5})
                log('setFieldsValue', form.getFieldsValue())
              }}
            >
              setFieldsValue
            </Button>
            <Button
              onClick={() => {
                void form.validateFields().then(
                  (values) => log('validateFields 成功', values),
                  (err: {errorFields?: unknown}) => log('validateFields 失败', err?.errorFields ?? err)
                )
              }}
            >
              validateFields
            </Button>
            <Button onClick={() => { form.resetFields(); log('resetFields 后', form.getFieldsValue()) }}>
              resetFields
            </Button>
          </div>
        </Form.Item>
      </Form>
      <ResultBlock value={apiLog}/>
    </div>
  )
}

/** 七、综合注册表单 */
const ComprehensiveSection: React.FC = () => {
  const [form] = Form.useForm<RegisterFormValues>()
  const [submitted, setSubmitted] = useState('')

  return (
    <div className="demo-block">
      <GroupSplitter title="综合表单（全部字段 + form.submit / resetFields）"/>
      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          username: '',
          email: '',
          password: '',
          age: null,
          bio: '',
          lang: 'ts',
          role: 'dev',
          interests: ['code'],
          notify: true,
          agree: false,
        }}
        onFinish={(values) => setSubmitted(JSON.stringify(values, null, 2))}
        className="max-w-lg"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{required: true}, {min: 3, message: '至少 3 个字符'}]}
        >
          <Input placeholder="用户名" allowClear prefix={<span className="text-muted-foreground">@</span>}/>
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[{required: true, message: '请输入邮箱'}, {type: 'email', message: '邮箱格式不正确'}]}
        >
          <Input placeholder="name@example.com" allowClear/>
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

        <Form.Item name="lang" label="语言" rules={[{required: true, message: '请选择语言'}]}>
          <Select options={LANG_OPTIONS} placeholder="选择语言" allowClear/>
        </Form.Item>

        <Form.Item name="role" label="角色">
          <Radio.Group optionType="button" options={ROLE_OPTIONS}/>
        </Form.Item>

        <Form.Item name="interests" label="兴趣">
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
            <Button onClick={() => { form.resetFields(); setSubmitted('') }}>
              重置
            </Button>
          </div>
        </Form.Item>
      </Form>
      <ResultBlock value={submitted}/>
    </div>
  )
}

/** Separator 分割线演示：纯线条、带标题（left/center）、垂直方向 */
const SeparatorSection: React.FC = () => (
  <div className="demo-block">
    <GroupSplitter title="Separator 分割线（纯线条 / 带标题 / 垂直）"/>
    <div className="max-w-lg space-y-4 py-2">
      <Separator/>
      <Separator title="基本信息"/>
      <Separator title="联系方式" titleAlign="center"/>
      <div className="flex h-10 items-center gap-4">
        <span>左侧</span>
        <Separator orientation="vertical"/>
        <span>右侧</span>
      </div>
    </div>
  </div>
)

const FormPage: React.FC = () => (
  <PageContainer
    className="max-w-6xl"
    title="表单组件"
    description="Form / Form.Item / Form.List 与 Input、Select、NumberInput、Checkbox、Radio、Switch 等字段组件，API 对齐 antd，控件默认高度 40px。"
  >
    <LayoutSection/>
    <SeparatorSection/>
    <FieldsSection/>
    <ItemMetaSection/>
    <ValidationSection/>
    <ListSection/>
    <InstanceSection/>
    <ComprehensiveSection/>
  </PageContainer>
)

export default FormPage
