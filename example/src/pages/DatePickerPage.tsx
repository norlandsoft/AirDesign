/**
 * DatePicker 日期选择 Demo
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React, {useState} from 'react'
import {DatePicker, Form, Button} from 'air-design'
import type {RangeValue} from 'air-design'
import PageContainer from '../components/PageContainer'

interface DemoFormValues extends Record<string, unknown> {
  birthday: Date | null
  period: RangeValue
}

const DatePickerPage: React.FC = () => {
  const [single, setSingle] = useState<Date | null>(null)
  const [range, setRange] = useState<RangeValue>(null)
  const [form] = Form.useForm<DemoFormValues>()

  return (
    <PageContainer title="DatePicker 日期选择" description="单日选择与开始/结束日期范围选择，对齐 antd DatePicker API。">
      <div className="demo-block">
        <h3 className="demo-section-title">单日选择</h3>
        <div className="max-w-xs">
          <DatePicker
            value={single}
            onChange={(date) => setSingle(date)}
            placeholder="请选择日期"
          />
        </div>
        {single && (
          <div className="mt-2 text-sm text-muted-foreground">
            已选：{single.toLocaleDateString('zh-CN')}
          </div>
        )}
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">日期范围</h3>
        <div className="max-w-md">
          <DatePicker.RangePicker
            value={range}
            onChange={(dates) => setRange(dates)}
          />
        </div>
        {range?.[0] && range[1] && (
          <div className="mt-2 text-sm text-muted-foreground">
            范围：{range[0].toLocaleDateString('zh-CN')} — {range[1].toLocaleDateString('zh-CN')}
          </div>
        )}
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">Form 集成</h3>
        <Form
          form={form}
          layout="vertical"
          className="max-w-md"
          initialValues={{birthday: null, period: null}}
          onFinish={(values) => {
            window.alert(JSON.stringify({
              birthday: values.birthday?.toISOString().slice(0, 10) ?? null,
              period: values.period?.map((d: Date | null) => d?.toISOString().slice(0, 10) ?? null),
            }))
          }}
        >
          <Form.Item name="birthday" label="生日" rules={[{required: true, message: '请选择生日'}]}>
            <DatePicker/>
          </Form.Item>
          <Form.Item name="period" label="项目周期" rules={[{required: true, message: '请选择日期范围'}]}>
            <DatePicker.RangePicker/>
          </Form.Item>
          <Button type="primary" htmlType="submit">提交</Button>
        </Form>
      </div>
    </PageContainer>
  )
}

export default DatePickerPage
