/**
 * 表单组件 Demo：EditableLabel / Help / GroupSplitter
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {EditableLabel, Help, GroupSplitter, Input, Switch, Checkbox, Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from 'air-design'
import PageContainer from '../components/PageContainer'

const FormPage: React.FC = () => {
  const [name, setName] = useState('可编辑标题')
  const [checked, setChecked] = useState(true)
  const [agree, setAgree] = useState(false)
  const [lang, setLang] = useState('ts')

  return (
    <PageContainer title="表单组件" description="EditableLabel / Help / Input / Switch / Checkbox / Select 原语（primitives）。">
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
      </div>

      <div className="demo-block">
        <GroupSplitter title="Input / Switch / Checkbox / Select"/>
        <div className="demo-row">
          <span className="demo-label">Input</span>
          <Input placeholder="请输入" style={{maxWidth: 240}}/>
        </div>
        <div className="demo-row">
          <span className="demo-label">Switch</span>
          <Switch checked={checked} onCheckedChange={setChecked}/>
          <span className="text-sm text-muted-foreground">{checked ? '开启' : '关闭'}</span>
        </div>
        <div className="demo-row">
          <span className="demo-label">Checkbox</span>
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)}/>
          <span className="text-sm text-muted-foreground">我已阅读并同意{agree ? ' ✓' : ''}</span>
        </div>
        <div className="demo-row">
          <span className="demo-label">Select</span>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger style={{width: 200}}>
              <SelectValue placeholder="选择语言"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="py">Python</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </PageContainer>
  )
}

export default FormPage
