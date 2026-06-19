/**
 * Tag 标签 Demo
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React, {useState} from 'react'
import {Tag} from 'air-design'
import PageContainer from '../components/PageContainer'

const TagPage: React.FC = () => {
  const [tags, setTags] = useState(['前端开发', 'TypeScript', 'React', 'Node.js'])
  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag))

  return (
    <PageContainer title="Tag 标签" description="胶囊状标签，五种语义色 + 自定义色点 + 可关闭。">
      <div className="demo-block">
        <h3 className="demo-section-title">语义色</h3>
        <div className="demo-row">
          <Tag>默认</Tag>
          <Tag variant="primary">主要</Tag>
          <Tag variant="success">成功</Tag>
          <Tag variant="warning">警告</Tag>
          <Tag variant="danger">危险</Tag>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">自定义色点</h3>
        <div className="demo-row">
          <Tag dotColor="#7c3aed">紫色</Tag>
          <Tag dotColor="#0ea5e9">天蓝</Tag>
          <Tag dotColor="#f43f5e">玫红</Tag>
          <Tag dotColor="#22c55e">翠绿</Tag>
        </div>
      </div>

      <div className="demo-block">
        <h3 className="demo-section-title">可关闭</h3>
        <div className="demo-row">
          {tags.map((tag) => (
            <Tag key={tag} variant="primary" closable onClose={() => removeTag(tag)}>{tag}</Tag>
          ))}
          {tags.length === 0 && <span className="text-sm text-muted-foreground">已全部移除</span>}
        </div>
      </div>
    </PageContainer>
  )
}

export default TagPage
