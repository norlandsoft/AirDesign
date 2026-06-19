/**
 * Button 系列 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {Button, IconButton, MenuButton, ToggleButton} from 'air-design'
import PageContainer from '../components/PageContainer'

const ButtonPage: React.FC = () => {
  const [toggled, setToggled] = useState(false)

  return (
    <PageContainer title="Button 按钮" description="Button / IconButton / MenuButton / ToggleButton，支持五种类型与图标。">
      <div className="demo-block">
        <h3 className="demo-section-title">按钮类型</h3>
        <div className="demo-row">
          <Button>默认</Button>
          <Button type="primary">主要</Button>
          <Button type="danger">危险</Button>
          <Button type="text">文本</Button>
          <Button type="link">链接</Button>
        </div>
        <div className="demo-row">
          <Button danger>danger 属性</Button>
          <Button type="primary" loading>加载中</Button>
          <Button disabled>禁用</Button>
          <Button type="primary" block style={{maxWidth: 200}}>撑满</Button>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">带图标按钮</h3>
        <div className="demo-row">
          <Button type="primary" icon="add">新增</Button>
          <Button icon="edit">编辑</Button>
          <Button type="danger" icon="delete">删除</Button>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">IconButton 图标按钮</h3>
        <div className="demo-row">
          <IconButton icon="add" tooltip="新增" onClick={() => alert('点击新增')}/>
          <IconButton icon="edit" tooltip="编辑" bordered/>
          <IconButton icon="refresh" tooltip="刷新" shape="circle"/>
          <IconButton
            icon="more"
            tooltip="更多操作"
            items={[
              {label: '复制', icon: 'copy', onClick: () => alert('复制')},
              {label: '导出', icon: 'export', onClick: () => alert('导出')},
            ]}
          />
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">MenuButton 菜单按钮</h3>
        <div className="demo-row">
          <MenuButton
            items={[
              {label: '操作一', onClick: () => alert('操作一')},
              {label: '操作二', onClick: () => alert('操作二')},
            ]}
          />
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">ToggleButton 切换按钮</h3>
        <div className="demo-row">
          <ToggleButton icon="star" selected={toggled} onClick={() => setToggled(!toggled)}/>
          <span className="text-sm text-muted-foreground">当前状态：{toggled ? '已选中' : '未选中'}</span>
        </div>
      </div>
    </PageContainer>
  )
}

export default ButtonPage
