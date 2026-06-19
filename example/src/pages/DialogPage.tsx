/**
 * Dialog 对话框 Demo
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useState} from 'react'
import {Dialog} from 'air-design'
import PageContainer from '../components/PageContainer'

const DialogPage: React.FC = () => {
  const [log, setLog] = useState<string[]>([])

  const addLog = (msg: string) => setLog((l) => [...l, msg])

  return (
    <PageContainer title="Dialog 对话框" description="命令式 Dialog，可拖拽、loading 遮罩、确认/取消回调。">
      <div className="demo-block">
        <h3 className="demo-section-title">命令式调用</h3>
        <div className="demo-row">
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() =>
              Dialog({
                title: '确认操作',
                message: '确定要执行此操作吗？此操作不可撤销。',
                onConfirm: () => addLog('已确认'),
              })
            }
          >
            打开确认对话框
          </button>
          <button
            className="rounded border border-border px-4 py-2 text-sm hover:bg-accent"
            onClick={() =>
              Dialog({
                title: '提示',
                content: <div className="text-sm">这是一个带自定义内容的对话框。</div>,
                confirmable: true,
                onConfirm: () => addLog('自定义内容已确认'),
              })
            }
          >
            自定义内容
          </button>
        </div>
        {log.length > 0 && (
          <div className="demo-code">
            {log.map((m, i) => (
              <div key={i}>• {m}</div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default DialogPage
