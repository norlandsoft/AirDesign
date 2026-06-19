/**
 * 表单组件 Demo：EditableLabel / Help / GroupSplitter 及 Input、Textarea、Switch、
 * Checkbox、Select、Slider、ColorPicker 等原语（primitives）示例。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {
  Button,
  EditableLabel,
  Help,
  GroupSplitter,
  ColorPicker,
  Input,
  Textarea,
  Switch,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  Slider,
  Separator,
} from 'air-design'
import PageContainer from '../components/PageContainer'

/** 兴趣选项，用于 Checkbox 组演示 */
const INTEREST_OPTIONS = [
  {value: 'design', label: '界面设计'},
  {value: 'code', label: '前端开发'},
  {value: 'ai', label: '人工智能'},
  {value: 'data', label: '数据分析'},
] as const

const FormPage: React.FC = () => {
  const [name, setName] = useState('可编辑标题')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [checked, setChecked] = useState(true)
  const [notify, setNotify] = useState(true)
  const [agree, setAgree] = useState(false)
  const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>(false)
  const [interests, setInterests] = useState<string[]>(['code'])
  const [lang, setLang] = useState('ts')
  const [framework, setFramework] = useState('')
  const [volume, setVolume] = useState([60])
  const [priceRange, setPriceRange] = useState([20, 80])
  const [themeColor, setThemeColor] = useState('#2563eb')
  const [formSubmitted, setFormSubmitted] = useState('')

  /** 同步「全选」与兴趣列表的半选/全选状态 */
  const syncSelectAll = (next: string[]) => {
    if (next.length === 0) setSelectAll(false)
    else if (next.length === INTEREST_OPTIONS.length) setSelectAll(true)
    else setSelectAll('indeterminate')
  }

  const handleSelectAll = (value: boolean | 'indeterminate') => {
    const checked = value === true
    setSelectAll(checked)
    setInterests(checked ? INTEREST_OPTIONS.map((o) => o.value) : [])
  }

  const toggleInterest = (value: string, checked: boolean) => {
    const next = checked ? [...interests, value] : interests.filter((v) => v !== value)
    setInterests(next)
    syncSelectAll(next)
  }

  const submitForm = () => {
    setFormSubmitted(
      JSON.stringify(
        {
          email,
          password: password ? '******' : '',
          age,
          bio,
          notify,
          agree,
          interests,
          lang,
          framework,
          volume: volume[0],
          priceRange,
          themeColor,
        },
        null,
        2
      )
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitForm()
  }

  return (
    <PageContainer
      title="表单组件"
      description="EditableLabel / Help 及 Input、Textarea、Switch、Checkbox、Select、Slider、ColorPicker 等原语示例。"
    >
      <div className="demo-block">
        <GroupSplitter title="EditableLabel 可编辑标签"/>
        <div className="demo-row">
          <EditableLabel text={name} onSave={setName}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Help 帮助提示"/>
        <div className="demo-row">
          <span className="text-sm">字段说明</span>
          <Help icon="help" text="这是一段帮助说明文字，悬浮显示"/>
        </div>
        <div className="demo-row">
          <span className="demo-label">带 Help</span>
          <div className="flex items-center gap-2">
            <Input placeholder="API Key" style={{maxWidth: 240}}/>
            <Help text="在控制台「设置 → 密钥」中创建，请勿泄露给他人。"/>
          </div>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Input 文本输入"/>
        <div className="demo-row">
          <span className="demo-label">文本</span>
          <Input
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{maxWidth: 280}}
          />
        </div>
        <div className="demo-row">
          <span className="demo-label">密码</span>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{maxWidth: 280}}
          />
        </div>
        <div className="demo-row">
          <span className="demo-label">数字</span>
          <Input
            type="number"
            placeholder="年龄"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{maxWidth: 120}}
          />
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Input disabled defaultValue="不可编辑的内容" style={{maxWidth: 280}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">只读</span>
          <Input readOnly defaultValue="只读字段" style={{maxWidth: 280}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">文件</span>
          <Input type="file" style={{maxWidth: 280}}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Textarea 多行文本"/>
        <div className="demo-row" style={{alignItems: 'flex-start'}}>
          <span className="demo-label" style={{paddingTop: 8}}>简介</span>
          <Textarea
            placeholder="介绍一下你自己…"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{maxWidth: 400, flex: 1}}
          />
        </div>
        <div className="demo-row" style={{alignItems: 'flex-start'}}>
          <span className="demo-label" style={{paddingTop: 8}}>禁用</span>
          <Textarea disabled defaultValue="禁用状态的多行文本" rows={3} style={{maxWidth: 400, flex: 1}}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Switch 开关"/>
        <div className="demo-row">
          <span className="demo-label">基础</span>
          <Switch checked={checked} onCheckedChange={setChecked}/>
          <span className="text-sm text-muted-foreground">{checked ? '已开启' : '已关闭'}</span>
        </div>
        <div className="demo-row">
          <span className="demo-label">消息通知</span>
          <Switch checked={notify} onCheckedChange={setNotify}/>
          <span className="text-sm text-muted-foreground">{notify ? '接收推送' : '不接收'}</span>
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Switch disabled defaultChecked/>
          <Switch disabled/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Checkbox 复选框"/>
        <div className="demo-row">
          <span className="demo-label">协议</span>
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)}/>
          <span className="text-sm text-muted-foreground">我已阅读并同意用户协议{agree ? ' ✓' : ''}</span>
        </div>
        <div className="demo-row" style={{alignItems: 'flex-start'}}>
          <span className="demo-label" style={{paddingTop: 2}}>兴趣</span>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll}/>
              全选
            </label>
            <Separator style={{maxWidth: 200}}/>
            {INTEREST_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={interests.includes(opt.value)}
                  onCheckedChange={(v) => toggleInterest(opt.value, !!v)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Checkbox disabled defaultChecked/>
          <Checkbox disabled/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Select 下拉选择"/>
        <div className="demo-row">
          <span className="demo-label">语言</span>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger style={{width: 200}}>
              <SelectValue placeholder="选择语言"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="py">Python</SelectItem>
              <SelectItem value="go">Go</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="demo-row">
          <span className="demo-label">分组</span>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger style={{width: 220}}>
              <SelectValue placeholder="选择框架"/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>前端</SelectLabel>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
              </SelectGroup>
              <SelectSeparator/>
              <SelectGroup>
                <SelectLabel>后端</SelectLabel>
                <SelectItem value="spring">Spring Boot</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="fastapi" disabled>FastAPI（即将支持）</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Select disabled defaultValue="ts">
            <SelectTrigger style={{width: 200}}>
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ts">TypeScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="Slider 滑块"/>
        <div className="demo-row">
          <span className="demo-label">音量</span>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            style={{maxWidth: 280, flex: 1}}
          />
          <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">{volume[0]}</span>
        </div>
        <div className="demo-row">
          <span className="demo-label">价格区间</span>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={100}
            step={5}
            style={{maxWidth: 280, flex: 1}}
          />
          <span className="text-sm tabular-nums text-muted-foreground">
            {priceRange[0]} – {priceRange[1]}
          </span>
        </div>
        <div className="demo-row">
          <span className="demo-label">禁用</span>
          <Slider defaultValue={[40]} disabled style={{maxWidth: 280, flex: 1}}/>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="ColorPicker 取色"/>
        <div className="demo-row">
          <span className="demo-label">主题色</span>
          <ColorPicker value={themeColor} onChangeComplete={(c) => setThemeColor(c.toHexString())}>
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <span className="size-5 rounded border border-border" style={{backgroundColor: themeColor}}/>
              选择颜色
            </button>
          </ColorPicker>
          <span className="font-mono text-sm text-muted-foreground">{themeColor}</span>
        </div>
      </div>

      <div className="demo-block">
        <GroupSplitter title="综合表单"/>
        <form onSubmit={handleFormSubmit} className="flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-sm font-medium">
              邮箱
              <Help text="用于登录与找回密码"/>
            </label>
            <Input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">密码</label>
            <Input
              type="password"
              required
              placeholder="至少 8 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">个人简介</label>
            <Textarea placeholder="选填" rows={3} value={bio} onChange={(e) => setBio(e.target.value)}/>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">接收邮件通知</span>
            <Switch checked={notify} onCheckedChange={setNotify}/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">首选语言</label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ts">TypeScript</SelectItem>
                <SelectItem value="js">JavaScript</SelectItem>
                <SelectItem value="py">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)}/>
            同意用户协议
          </label>
          <Button type="primary" icon="check" onClick={submitForm}>
            提交
          </Button>
        </form>
        {formSubmitted && (
          <pre className="demo-code">{formSubmitted}</pre>
        )}
      </div>
    </PageContainer>
  )
}

export default FormPage
