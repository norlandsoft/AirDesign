import { useState } from 'react';
import { Splitter, Pane, SlidePanel, TabPanel, GroupSplitter, Button, Message } from '@/components/AirDesign';

const tabItems = [
  { key: 'tab1', label: '概览', children: <div style={{ padding: 16 }}>概览内容 — 模拟项目信息展示</div> },
  { key: 'tab2', label: '配置', children: <div style={{ padding: 16 }}>配置内容 — 模拟设置面板</div> },
  { key: 'tab3', label: '日志', children: <div style={{ padding: 16 }}>日志内容 — 模拟运行日志</div> },
];

export default function LayoutDemoPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabItems[0]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 24px 16px' }}>
        <h2 style={{ margin: '0 0 8px' }}>布局场景</h2>
        <p style={{ color: '#666', margin: 0 }}>
          Splitter + SlidePanel + TabPanel + GroupSplitter，模拟多面板工作区
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 24px 24px' }}>
        <Splitter split="horizontal" defaultSize="50%">
          {/* 上半区：水平分割 */}
          <Pane>
            <Splitter split="vertical" defaultSize="260px" minSize={180}>
              <Pane>
                <div style={{ height: '100%', background: '#fafafa', padding: 12 }}>
                  <GroupSplitter title="文件浏览器" />
                  <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#666', lineHeight: 1.8 }}>
                    <div>📁 src/</div>
                    <div style={{ paddingLeft: 16 }}>📁 components/</div>
                    <div style={{ paddingLeft: 32 }}>📄 Button.tsx</div>
                    <div style={{ paddingLeft: 32 }}>📄 Table.tsx</div>
                    <div style={{ paddingLeft: 16 }}>📁 pages/</div>
                    <div style={{ paddingLeft: 32 }}>📄 index.tsx</div>
                    <div>📁 public/</div>
                    <div>📄 package.json</div>
                  </div>
                </div>
              </Pane>
              <Pane>
                <TabPanel
                  height={300}
                  items={tabItems}
                  currentTab={currentTab}
                  onChangeTab={(tab) => setCurrentTab(tab)}
                />
              </Pane>
            </Splitter>
          </Pane>

          {/* 下半区：操作面板 */}
          <Pane>
            <div style={{ height: '100%', background: '#fafafa', padding: 16, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <GroupSplitter title="属性面板" />
                <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
                  <div style={{ marginBottom: 4 }}><strong>名称:</strong> AirDesign</div>
                  <div style={{ marginBottom: 4 }}><strong>版本:</strong> 1.0.0</div>
                  <div style={{ marginBottom: 4 }}><strong>框架:</strong> UmiJS Max</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <GroupSplitter title="操作" />
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button type="primary" onClick={() => setPanelOpen(true)}>打开侧面板</Button>
                  <Button onClick={() => Message.info('刷新')}>刷新</Button>
                  <Button type="danger" onClick={() => Message.warning('清空操作')}>清空</Button>
                </div>
              </div>
            </div>
          </Pane>
        </Splitter>
      </div>

      <SlidePanel
        open={panelOpen}
        title="侧面板演示"
        type="default"
        onClose={() => setPanelOpen(false)}
        onConfirm={() => { Message.success('确认'); setPanelOpen(false); }}
      >
        <div style={{ padding: 16 }}>
          <p>这是一个 SlidePanel 侧面板组件。</p>
          <p>支持不同宽度: small / default / large / huge / full</p>
          <p>底部有确认和取消按钮。</p>
        </div>
      </SlidePanel>
    </div>
  );
}
