import { useState } from 'react';
import {
  Button,
  IconButton,
  ToggleButton,
  MenuButton,
  EditableLabel,
  ColorPicker,
  Dialog,
  Message,
  success,
  warn,
  error,
  info,
  Help,
  LoadingPanel,
} from '@/components/AirDesign';

export default function FormDemoPage() {
  const [labelText, setLabelText] = useState('点击编辑此标签');
  const [color, setColor] = useState<string | null>('#123f68');
  const [loading, setLoading] = useState(false);
  const [toggleA, setToggleA] = useState(false);
  const [toggleB, setToggleB] = useState(true);

  const menuItems = [
    { label: '选项一', onClick: () => Message.info('选项一') },
    { label: '选项二', onClick: () => Message.info('选项二') },
    { type: 'split' as const },
    { label: '选项三（禁用）', disabled: true, onClick: () => {} },
  ];

  const handleDialog = () => {
    Dialog({
      title: '示例对话框',
      content: '这是一个由 Dialog 命令式调用的对话框，支持拖拽标题栏移动。',
      width: 480,
      onConfirm: (ref) => {
        Message.success('确认操作');
        ref.doCancel();
      },
    });
  };

  return (
    <div style={{ padding: 24, position: 'relative' }}>
      <LoadingPanel loading={loading} message="加载中..." />
      <h2 style={{ margin: '0 0 16px' }}>表单场景</h2>
      <p style={{ color: '#666', margin: '0 0 24px' }}>
        Button + EditableLabel + ColorPicker + Dialog + Notification，模拟编辑表单
      </p>

      {/* Button 组 */}
      <section style={{ marginBottom: 24 }}>
        <h3>按钮系</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button type="default" onClick={() => Message.info('Default')}>Default</Button>
          <Button type="primary" onClick={() => Message.success('Primary')}>Primary</Button>
          <Button type="danger" onClick={() => Message.error('Danger')}>Danger</Button>
          <Button type="text" onClick={() => Message.info('Text')}>Text</Button>
          <Button type="link" onClick={() => Message.info('Link')}>Link</Button>
          <Button type="primary" loading>加载中</Button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <IconButton icon="add" tooltip="添加" onClick={() => Message.info('添加')} />
          <IconButton icon="edit" tooltip="编辑" onClick={() => Message.info('编辑')} />
          <IconButton icon="delete" tooltip="删除" onClick={() => Message.warning('删除')} />
          <MenuButton items={menuItems} />
          <ToggleButton icon="list" selected={toggleA} onClick={() => setToggleA(!toggleA)} border />
          <ToggleButton icon="grid" selected={toggleB} onClick={() => setToggleB(!toggleB)} border />
        </div>
      </section>

      {/* EditableLabel */}
      <section style={{ marginBottom: 24 }}>
        <h3>可编辑标签</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EditableLabel text={labelText} onSave={(val) => setLabelText(val)} />
          <Help text="点击铅笔图标进入编辑模式，Enter 确认，Esc 取消" />
        </div>
      </section>

      {/* ColorPicker */}
      <section style={{ marginBottom: 24 }}>
        <h3>颜色选择器</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ColorPicker value={color} onChangeComplete={(c) => setColor(c?.toHexString?.() || null)} />
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            当前颜色: <span style={{ color: color || '#000', fontWeight: 600 }}>{color || '无'}</span>
          </span>
        </div>
      </section>

      {/* Dialog */}
      <section style={{ marginBottom: 24 }}>
        <h3>对话框</h3>
        <Button type="primary" onClick={handleDialog}>打开对话框</Button>
      </section>

      {/* Notification */}
      <section style={{ marginBottom: 24 }}>
        <h3>通知</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => success({ title: '成功', message: '操作成功完成' })}>Success</Button>
          <Button onClick={() => info({ title: '信息', message: '这是一条信息通知' })}>Info</Button>
          <Button onClick={() => warn({ title: '警告', message: '请注意此操作' })}>Warn</Button>
          <Button type="danger" onClick={() => error({ title: '错误', message: '操作失败' })}>Error</Button>
        </div>
      </section>

      {/* LoadingPanel */}
      <section>
        <h3>加载面板</h3>
        <Button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
          显示加载 (2秒)
        </Button>
      </section>
    </div>
  );
}
