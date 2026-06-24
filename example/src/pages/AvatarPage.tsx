/**
 * Avatar 头像 Demo
 *
 * 展示图片、字符、图标头像及 Avatar.Group 堆叠用法，API 对齐 antd。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React from 'react'
import {Avatar, GroupSplitter} from 'air-design'
import PageContainer from '../components/PageContainer'

const DEMO_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#2563eb"/><text x="40" y="48" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">A</text></svg>'
  )

const AvatarPage: React.FC = () => (
  <PageContainer title="Avatar 头像" description="图片 / 字符 / 图标头像，支持 size、shape 与 Avatar.Group 堆叠，API 对齐 antd。">
    <div className="demo-block">
      <GroupSplitter title="图片头像（/icons/avatar）"/>
      <div className="demo-row items-end">
        {['u01', 'u02', 'u03', 'u04', 'u05', 'u06'].map((id) => (
          <div key={id} className="flex flex-col items-center gap-2">
            <Avatar src={`/icons/avatar/${id}.svg`} alt={id} size={40}/>
            <span className="text-xs text-muted-foreground">{id}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="demo-block">
      <GroupSplitter title="基础类型"/>
      <div className="demo-row items-end">
        <div className="flex flex-col items-center gap-2">
          <Avatar src={DEMO_IMG} alt="图片头像" onClick={() => alert('点击头像')}/>
          <span className="text-xs text-muted-foreground">图片 src（可点击）</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar>Chai</Avatar>
          <span className="text-xs text-muted-foreground">字符 children</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar icon="user"/>
          <span className="text-xs text-muted-foreground">图标 icon</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar/>
          <span className="text-xs text-muted-foreground">默认占位</span>
        </div>
      </div>
    </div>

    <div className="demo-block">
      <GroupSplitter title="尺寸 size"/>
      <div className="demo-row items-end">
        <Avatar size="small">S</Avatar>
        <Avatar size="default">M</Avatar>
        <Avatar size="large">L</Avatar>
        <Avatar size={48}>48</Avatar>
      </div>
    </div>

    <div className="demo-block">
      <GroupSplitter title="形状 shape"/>
      <div className="demo-row items-end">
        <Avatar shape="circle" src={DEMO_IMG}/>
        <Avatar shape="square" src={DEMO_IMG}/>
        <Avatar shape="square">方</Avatar>
      </div>
    </div>

    <div className="demo-block">
      <GroupSplitter title="Avatar.Group 堆叠"/>
      <Avatar.Group max={{count: 3}}>
        <Avatar>张三</Avatar>
        <Avatar>李四</Avatar>
        <Avatar>王五</Avatar>
        <Avatar>赵六</Avatar>
        <Avatar>钱七</Avatar>
      </Avatar.Group>
    </div>
  </PageContainer>
)

export default AvatarPage
