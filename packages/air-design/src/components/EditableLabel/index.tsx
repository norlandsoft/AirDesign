/**
 * EditableLabel 可编辑标签
 *
 * 鼠标悬停显示编辑按钮，点击进入编辑态（输入框 + 确定/取消），Enter 保存、Esc 取消。
 * 底层输入框改用 primitives/input（无 AntD 依赖），交互逻辑与旧版一致。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useRef, useState} from 'react'
import {Input} from '@/primitives/input'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface EditableLabelProps {
  text: string
  onSave?: (value: string) => void
  className?: string
  style?: React.CSSProperties
}

const EditableLabel: React.FC<EditableLabelProps> = (props) => {
  const {text, onSave, className, style} = props

  const [editing, setEditing] = useState(false)
  const [currentText, setCurrentText] = useState(text)
  const [inputValue, setInputValue] = useState(text)
  const inputRef = useRef<HTMLInputElement>(null)
  const isClickingButton = useRef(false)

  useEffect(() => {
    setCurrentText(text)
    setInputValue(text)
    if (editing) setEditing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [editing])

  const handleEditClick = () => {
    setInputValue(currentText)
    setEditing(true)
  }

  const handleConfirm = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (trimmed === currentText) {
      setEditing(false)
      return
    }
    setCurrentText(trimmed)
    onSave?.(trimmed)
    setEditing(false)
  }

  const handleCancel = () => {
    setInputValue(currentText)
    setEditing(false)
  }

  const handleInputBlur = () => {
    if (isClickingButton.current) {
      isClickingButton.current = false
      return
    }
    handleCancel()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <div className={cn('inline-flex items-center', className)} style={style}>
      {editing ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="h-7 w-32"
          />
          <button
            type="button"
            title="确定"
            onMouseDown={(e) => {
              e.preventDefault()
              isClickingButton.current = true
            }}
            onClick={handleConfirm}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
          >
            <Icon name="yes" size={14} color="var(--color-primary)"/>
          </button>
          <button
            type="button"
            title="取消"
            onMouseDown={(e) => {
              e.preventDefault()
              isClickingButton.current = true
            }}
            onClick={handleCancel}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
          >
            <Icon name="no" size={12} color="var(--color-destructive)"/>
          </button>
        </div>
      ) : (
        <div className="group flex items-center gap-1">
          <span>{currentText}</span>
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center justify-center rounded opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
            style={{width: 16, height: 16}}
          >
            <Icon name="edit" size={16}/>
          </button>
        </div>
      )}
    </div>
  )
}

export default EditableLabel
