/**
 * Dialog 命令式对话框入口
 *
 * 调用 Dialog(props) 即在 #root 上挂载一个 ModalDialog，提供 title/content/message/onConfirm。
 * 底层为 Radix Dialog（经 ModalDialog），无障碍与焦点管理达标，无 AntD 依赖。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {createRoot} from 'react-dom/client'
import ModalDialog, {type ModalDialogHandle, type ModalDialogOnOkResult} from './ModalDialog'

interface DialogProps {
  title?: React.ReactNode
  content?: React.ReactNode
  message?: React.ReactNode
  width?: number | string
  height?: number | string
  okText?: string
  cancelText?: string
  onConfirm?: (ref: ModalDialogHandle | null) => ModalDialogOnOkResult
  onInit?: (ref: ModalDialogHandle | null) => void
  /** 确认按钮是否显示，默认 true */
  confirmable?: boolean
}

/**
 * 命令式渲染对话框：在 #root 下创建容器并挂载 ModalDialog。
 * 卸载由 ModalDialog.doCancel 负责（关闭时移除容器 DOM）。
 */
const Dialog = (props: DialogProps) => {
  const {title, content, message, width, height, okText, cancelText, onConfirm, onInit, confirmable} = props
  const domId = 'air-modal-dialog'

  const rootDiv = document.getElementById('root')
  if (!rootDiv) throw new Error('root DOM not found')

  // 若已存在同 id 容器，先移除避免重复
  const existing = rootDiv.querySelector(`#${domId}`)
  if (existing) rootDiv.removeChild(existing)

  const container = document.createElement('div')
  container.setAttribute('id', domId)
  rootDiv.appendChild(container)

  let modalHandle: ModalDialogHandle | null = null

  const dialogContent = (
    <ModalDialog
      visible={true}
      domId={domId}
      title={title}
      width={width}
      height={height}
      okText={okText}
      cancelText={cancelText}
      confirmable={confirmable}
      onInit={(ref) => {
        modalHandle = ref
        onInit?.(ref)
      }}
      onOk={() => onConfirm?.(modalHandle)}
    >
      {message}
      {content}
    </ModalDialog>
  )

  const root = createRoot(container)
  root.render(dialogContent)
}

export default Dialog
