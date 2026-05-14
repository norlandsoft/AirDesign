import React, {useEffect, useState} from 'react';
import {connect} from 'umi';
import {Button, IconButton, SlidePanel} from 'air-design';
import {DatePicker, Form, Input, InputNumber, message, Select, Spin} from 'antd';
import './CronPanel.less';

/**
 * 从 job.schedule 推导展示文案。
 * kind every -> 每 N 分钟/秒/小时/天；at -> 日期时间；cron -> expression。
 */
function scheduleTextFromJob(job: any): string {
  const schedule = job?.schedule;
  if (!schedule || typeof schedule !== 'object') return job?.scheduleText ?? '—';
  const kind = schedule.kind || '';
  if (kind === 'every' && typeof schedule.everyMs === 'number') {
    const ms = schedule.everyMs;
    if (ms >= 86400000) return `每 ${Math.round(ms / 86400000)} 天`;
    if (ms >= 3600000) return `每 ${Math.round(ms / 3600000)} 小时`;
    if (ms >= 60000) return `每 ${Math.round(ms / 60000)} 分钟`;
    return `每 ${Math.round(ms / 1000)} 秒`;
  }
  if (kind === 'at') {
    const atMs = typeof schedule.atMs === 'number' ? schedule.atMs : null;
    const atStr = typeof schedule.at === 'string' ? schedule.at : null;
    const ms = atMs ?? (atStr ? new Date(atStr).getTime() : NaN);
    if (!Number.isNaN(ms)) {
      try {
        const d = new Date(ms);
        return d.toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        });
      } catch { return atStr ?? String(ms); }
    }
  }
  if (kind === 'cron') {
    const expr = schedule.expr || schedule.expression;
    if (expr) return expr;
  }
  return '—';
}

/** 从 job.state.nextRunAtMs 推导展示文案 */
function nextRunTextFromJob(job: any): string {
  const nextMs = job?.state?.nextRunAtMs;
  if (nextMs == null || typeof nextMs !== 'number' || nextMs === 0) return 'n/a';
  const now = Date.now();
  const diff = nextMs - now;
  if (diff <= 0) return '已过期';
  if (diff < 60000) return `${Math.round(diff / 1000)} 秒后`;
  if (diff < 3600000) return `${Math.round(diff / 60000)} 分钟后`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)} 小时后`;
  try {
    const d = new Date(nextMs);
    return d.toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});
  } catch { return String(nextMs); }
}

/** 从 job.state.lastRunAtMs 推导展示文案 */
function lastRunTextFromJob(job: any): string {
  const lastMs = job?.state?.lastRunAtMs;
  if (lastMs == null || typeof lastMs !== 'number' || lastMs === 0) return 'n/a';
  const now = Date.now();
  const diff = now - lastMs;
  if (diff < 0) return 'n/a';
  if (diff < 60000) return `${Math.round(diff / 1000)} 秒前`;
  if (diff < 3600000) return `${Math.round(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)} 小时前`;
  try {
    const d = new Date(lastMs);
    return d.toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});
  } catch { return String(lastMs); }
}

/** 获取任务状态文案 */
function statusTextFromJob(job: any): string {
  return job?.state?.lastStatus || 'n/a';
}

/** 根据状态返回样式类名 */
function statusClassFromJob(job: any): string {
  const status = (job?.state?.lastStatus || '').toLowerCase();
  if (status === 'ok' || status === 'success') return 'air-cron-meta-pill-success';
  if (status === 'error' || status === 'failed') return 'air-cron-meta-pill-error';
  return '';
}

/**
 * 根据调度类型显示不同表单字段
 */
const CronScheduleFields: React.FC<{ form: any }> = ({form}) => {
  const schedule = Form.useWatch('schedule', form);
  if (schedule === 'Every') {
    return (
      <div className="air-cron-form-row air-cron-form-row-2">
        <Form.Item name="every" label="每">
          <InputNumber min={1} style={{width: '100%'}} placeholder="30"/>
        </Form.Item>
        <Form.Item name="unit" label="单位" style={{marginTop: '0'}}>
          <Select options={[
            {value: 'Seconds', label: 'Seconds'},
            {value: 'Minutes', label: 'Minutes'},
            {value: 'Hours', label: 'Hours'},
            {value: 'Days', label: 'Days'},
          ]}/>
        </Form.Item>
      </div>
    );
  }
  if (schedule === 'At') {
    return (
      <div className="air-cron-form-row air-cron-form-row-1">
        <Form.Item name="runAt" label="运行时间">
          <DatePicker showTime format="YYYY/MM/DD HH:mm" style={{width: '100%'}} placeholder="年/月/日 --:--"/>
        </Form.Item>
      </div>
    );
  }
  if (schedule === 'Cron') {
    return (
      <div className="air-cron-form-row air-cron-form-row-2">
        <Form.Item name="cronExpression" label="表达式">
          <Input placeholder="0 7 * * *"/>
        </Form.Item>
        <Form.Item name="timezone" label="时区" style={{marginTop: '0'}}>
          <Select options={[
            {value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)'},
            {value: 'UTC', label: 'UTC'},
            {value: 'America/New_York', label: 'America/New_York (EST)'},
            {value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)'},
            {value: 'Europe/London', label: 'Europe/London (GMT)'},
          ]}/>
        </Form.Item>
      </div>
    );
  }
  return null;
};

/**
 * 平台管理 - 定时任务面板
 *
 * 从智能工作室 Studio/cron 迁移，使用 platform DVA model 调用 /api/studio/cron/* 接口。
 * 卡片式任务列表展示，SlidePanel 侧边栏创建新任务，支持 Every/At/Cron 三种调度模式。
 *
 * Created by ChaiMingXu, on 2026/04/30
 */
interface CronPanelProps {
  frameSize?: { width: number; height: number };
  dispatch?: any;
}

const CronPanel: React.FC<CronPanelProps> = ({frameSize, dispatch}) => {
  const [cronJobList, setCronJobList] = useState<any[]>([]);
  const [cronSidebarOpen, setCronSidebarOpen] = useState(false);
  const [cronForm] = Form.useForm();
  const [cronLoading, setCronLoading] = useState(false);

  /** 加载定时任务列表 */
  const loadCronList = () => {
    if (!dispatch) return;
    setCronLoading(true);
    dispatch({
      type: 'openclaw/cronList',
      payload: {},
      callback: (r: any) => {
        setCronLoading(false);
        if (r?.success && Array.isArray(r?.data?.jobs)) setCronJobList(r.data.jobs);
      },
    });
  };

  useEffect(() => { loadCronList(); }, [dispatch]);

  const HEADER_H = 52;
  const contentH = frameSize ? Math.max(300, frameSize.height - HEADER_H) : 400;

  return (
    <div className="air-cron-panel">
      <div className="air-cron-header">
        <div className="air-cron-title">定时任务</div>
        <div className="air-cron-toolbar">
          <Button type="primary" onClick={() => setCronSidebarOpen(true)}>新增</Button>
          <IconButton icon="reload" tooltip="刷新" size={30} bordered onClick={loadCronList} disabled={cronLoading}/>
        </div>
      </div>
      <div className="air-cron-content" style={{height: contentH}}>
        {cronLoading && cronJobList.length === 0 ? (
          <div className="air-cron-empty">加载中...</div>
        ) : cronJobList.length === 0 ? (
          <div className="air-cron-empty">暂无定时任务，点击「新增」创建</div>
        ) : (
          <div className="air-cron-job-list">
            {cronJobList.map((job, i) => (
              <div key={job.id ?? i} className="air-cron-job-item">
                <div className="air-cron-job-header">
                  <span className="air-cron-job-name">{job.name || '未命名'}</span>
                  <span className="air-cron-job-schedule">{scheduleTextFromJob(job)}</span>
                </div>
                <div className="air-cron-job-body">
                  <div className="air-cron-job-prompt">
                    <span className="air-cron-job-label">PROMPT</span>
                    <span className="air-cron-job-desc">{job.payload?.message || '—'}</span>
                  </div>
                  <table className="air-cron-job-meta-table">
                    <tbody>
                    <tr>
                      <td className="air-cron-meta-label">STATUS</td>
                      <td><span className={`air-cron-meta-pill ${statusClassFromJob(job)}`}>{statusTextFromJob(job)}</span></td>
                    </tr>
                    <tr>
                      <td className="air-cron-meta-label">NEXT</td>
                      <td className="air-cron-meta-value">{nextRunTextFromJob(job)}</td>
                    </tr>
                    <tr>
                      <td className="air-cron-meta-label">LAST</td>
                      <td className="air-cron-meta-value">{lastRunTextFromJob(job)}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div className="air-cron-job-footer">
                  <div className="air-cron-job-tags">
                    <span className={`air-cron-tag ${job.enabled !== false ? 'air-cron-tag-enabled' : 'air-cron-tag-disabled'}`}>
                      {job.enabled !== false ? 'enabled' : 'disabled'}
                    </span>
                    <span className="air-cron-tag air-cron-tag-default">{job.sessionTarget ?? 'isolated'}</span>
                    <span className="air-cron-tag air-cron-tag-default">{job.wakeMode ?? 'now'}</span>
                  </div>
                  <div className="air-cron-job-actions">
                    <Button type="default" size="small" onClick={() => {
                      const isCurrentlyEnabled = job.enabled !== false;
                      const newEnabled = !isCurrentlyEnabled;
                      if (dispatch) {
                        setCronLoading(true);
                        dispatch({
                          type: 'openclaw/cronUpdate',
                          payload: {id: job.id, enabled: newEnabled},
                          callback: (r: any) => {
                            setCronLoading(false);
                            if (r?.success) {
                              message.success(newEnabled ? '已启用' : '已禁用');
                              loadCronList();
                            } else { message.error(r?.message || '操作失败'); }
                          },
                        });
                      }
                    }}>
                      {job.enabled !== false ? '禁用' : '启用'}
                    </Button>
                    <Button type="default" size="small">运行</Button>
                    <Button type="default" size="small">历史</Button>
                    <Button type="danger" onClick={() => {
                      if (dispatch) {
                        setCronLoading(true);
                        dispatch({
                          type: 'openclaw/cronDelete',
                          payload: {id: job.id},
                          callback: (r: any) => {
                            setCronLoading(false);
                            if (r?.success) { message.success('已删除'); loadCronList(); }
                            else { message.error(r?.message || '删除失败'); }
                          },
                        });
                      }
                    }}>
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建任务侧边栏 */}
      <SlidePanel
        title="新建任务" type="medium" open={cronSidebarOpen}
        hasCloseButton hasButtonBar
        confirmButtonText="添加任务" closeButtonText="取消"
        onConfirm={() => cronForm.submit()}
        onClose={() => { setCronSidebarOpen(false); cronForm.resetFields(); }}
      >
        <div className="air-cron-form-drawer" style={{position: 'relative'}}>
          {cronLoading && (
            <div className="air-cron-form-loading-mask"><Spin size="large"/></div>
          )}
          <Form
            form={cronForm} layout="vertical" className="air-cron-form"
            initialValues={{
              schedule: 'Every', every: 30, unit: 'Minutes',
              cronExpression: '0 7 * * *', timezone: 'Asia/Shanghai', timeout: 120,
            }}
            onFinish={(values: any) => {
              const payload: Record<string, any> = {
                name: values.name, description: values.description,
                agentId: values.agentId || '', agentMessage: values.agentMessage,
                timeout: values.timeout,
              };
              if (values.schedule === 'Every') {
                payload.schedule = values.schedule;
                payload.every = values.every;
                payload.unit = values.unit;
                if (values.runAt && (typeof values.runAt.toISOString === 'function' || typeof values.runAt?.format === 'function')) {
                  payload.runAt = typeof values.runAt.toISOString === 'function' ? values.runAt.toISOString() : values.runAt.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                }
              } else if (values.schedule === 'At') {
                const atISO = values.runAt && typeof values.runAt.toISOString === 'function'
                  ? values.runAt.toISOString()
                  : values.runAt && typeof values.runAt?.format === 'function'
                    ? values.runAt.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null;
                payload.schedule = atISO ? {kind: 'at', at: atISO} : {kind: 'at', at: new Date().toISOString()};
              } else {
                payload.schedule = {kind: 'cron', expr: values.cronExpression || ''};
                if (values.timezone) payload.schedule.tz = values.timezone;
              }
              if (!dispatch) return;
              setCronLoading(true);
              dispatch({
                type: 'openclaw/cronCreate', payload,
                callback: (r: any) => {
                  setCronLoading(false);
                  if (r?.success) {
                    setCronSidebarOpen(false); cronForm.resetFields();
                    message.success('任务已添加'); loadCronList();
                  } else { message.error(r?.message || '添加失败'); }
                },
              });
            }}
          >
            <div className="air-cron-form-row air-cron-form-row-1">
              <Form.Item name="name" label="名称"><Input placeholder="名称"/></Form.Item>
            </div>
            <div className="air-cron-form-row air-cron-form-row-1">
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={2} placeholder="描述" style={{resize: 'none'}}/>
              </Form.Item>
            </div>
            <div className="air-cron-form-row air-cron-form-row-1">
              <Form.Item name="schedule" label="调度">
                <Select options={[
                  {value: 'Every', label: 'Every'},
                  {value: 'At', label: 'At'},
                  {value: 'Cron', label: 'Cron'},
                ]}/>
              </Form.Item>
            </div>
            <CronScheduleFields form={cronForm}/>
            <Form.Item name="agentMessage" label="消息">
              <Input.TextArea rows={4} placeholder="Agent 消息"/>
            </Form.Item>
            <div className="air-cron-form-row air-cron-form-row-1">
              <Form.Item name="timeout" label="超时(秒)">
                <InputNumber min={0} style={{width: '100%'}} placeholder="超时"/>
              </Form.Item>
            </div>
          </Form>
        </div>
      </SlidePanel>
    </div>
  );
};

export default connect(({global}: any) => ({
  frameSize: global.frameSize,
}))(CronPanel);
