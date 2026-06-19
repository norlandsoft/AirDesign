/**
 * UploadDialog 命令式上传对话框
 *
 * 调用 UploadDialog(props) 即在 #root 上挂载一个 ModalDialog，内部提供拖拽上传区域，
 * 确认后以 FormData 上传到指定 url。上传结果通过 onFileSaved 回调返回。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import ModalDialog, {type ModalDialogHandle} from './ModalDialog'
import Notice from '@/components/Notice'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface UploadDialogProps {
  url?: string
  onFileSaved?: (resp: any) => void
  multiple?: boolean
  bucket?: string
  ownerType?: string
  ownerId?: string
}

function UploadContent({url = '/upload', onFileSaved, multiple = true, bucket = '', ownerType = 'file', ownerId = ''}: UploadDialogProps) {
  const dialogRef = useRef<ModalDialogHandle>(null)
  const [fileList, setFileList] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const confirmUpload = () => {
    if (fileList.length === 0) {
      Notice.info('', '请选择要上传的文件')
      return
    }
    const formData = new FormData()
    fileList.forEach((file) => formData.append('files', file))
    formData.append('bucket', bucket)
    formData.append('ownerType', ownerType)
    formData.append('ownerId', ownerId)

    setUploading(true)
    fetch(url, {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + (sessionStorage.getItem('air-machine-token') ?? '')},
      body: formData,
    })
      .then((response) => response.json())
      .then((resp) => {
        if (resp.success) {
          setFileList([])
          setUploading(false)
          Notice.success('', '文件上传成功')
          onFileSaved?.(resp)
          dialogRef.current?.doCancel()
        } else {
          setUploading(false)
          Notice.error('无法上传文件', resp.message)
        }
      })
      .catch(() => {
        setUploading(false)
        Notice.error('', '文件上传失败')
      })
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files)
    setFileList((list) => (multiple ? [...list, ...incoming] : incoming.slice(0, 1)))
  }

  return (
    <ModalDialog ref={dialogRef} visible={true} title="文件上传" width={600} onOk={confirmUpload} domId="air-upload-dialog" mask={true} loading={uploading}>
      {/* 拖拽上传区域 */}
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed py-10 text-center transition-colors',
          dragOver ? 'border-primary bg-accent' : 'border-border'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <Icon name="upload" size={22} color="var(--color-primary)"/>
        <p className="text-sm text-muted-foreground">点击或将文件拖拽到此处上传</p>
        <label className="mt-2 cursor-pointer text-sm text-primary underline-offset-4 hover:underline">
          选择文件
          <input
            type="file"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* 已选文件列表 */}
      {fileList.length > 0 && (
        <ul className="mt-3 space-y-1">
          {fileList.map((file, index) => (
            <li key={index} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                className="ml-2 text-muted-foreground hover:text-destructive"
                onClick={() => setFileList((list) => list.filter((_, i) => i !== index))}
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModalDialog>
  )
}

/** 命令式调用：在 #root 挂载并渲染上传对话框 */
const UploadDialog = (props: UploadDialogProps) => {
  const domId = 'air-upload-dialog'
  const rootDiv = document.getElementById('root')
  if (!rootDiv) throw new Error('root DOM not found')

  const container = document.createElement('div')
  container.setAttribute('id', domId)
  rootDiv.appendChild(container)

  const root = createRoot(container)
  root.render(<UploadContent {...props} />)
}

export default UploadDialog
