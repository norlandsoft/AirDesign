import React from 'react'
import './index.less'

interface GroupSplitterProps {
  title: string
  height?: number
  paddingTop?: number
}

const GroupSplitter: React.FC<GroupSplitterProps> = (props) => {
  const {title, height = 32, paddingTop = 0} = props

  return (
      <div className="airGroupSplitterContainer" style={{height, marginTop: paddingTop}}>
        <span className="airGroupSplitterLeftHr"/>
        <span className="airGroupSplitterTitle">{title}</span>
      </div>
  )
}

export default GroupSplitter
