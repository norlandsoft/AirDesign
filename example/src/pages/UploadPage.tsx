/**
 * 文件上传 Demo
 *
 * @author ChaiMingXu, 2026/06/20
 */
import React, {useRef, useState} from 'react'
import PageContainer from '../components/PageContainer'

const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((f) => [...f, ...Array.from(list).map((x) => x.name)])
  }

  return (
    <PageContainer title="文件上传" description="拖拽区上传：支持点击选择与拖拽，已选文件可移除。">
      <div className="demo-block">
        <div
          className={`flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
          onDragOver={(e) => {e.preventDefault(); setDragOver(true)}}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files)}}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
          <label className="mt-1 cursor-pointer text-sm font-medium text-primary hover:underline">
            选择文件
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-1">
            {files.map((name, i) => (
              <li key={i} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent">
                <span className="truncate">{name}</span>
                <button className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => setFiles((f) => f.filter((_, idx) => idx !== i))}>
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  )
}

export default UploadPage
