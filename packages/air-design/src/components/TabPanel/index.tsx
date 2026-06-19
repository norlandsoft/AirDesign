/**
 * TabPanel 可关闭标签页面板
 *
 * 顶部可关闭标签 + 内容区。标签文字过长时截断并以 tooltip 显示完整名称，
 * 关闭按钮在 hover 时出现。底层基于 primitives/tabs（Radix Tabs），无 AntD 依赖。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React from 'react'
import {Tabs, TabsList, TabsTrigger} from '@/primitives/tabs'
import {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from '@/primitives/tooltip'
import Icon from '@/components/Icon'
import {cn} from '@/lib/cn'

interface TabItemProps {
  key: string
  label: string
  icon?: string
  closable: boolean
  children: React.ReactNode
}

interface TabPanelProps {
  height: number
  width: number
  items: TabItemProps[]
  currentTab: TabItemProps
  onChangeTab?: (tab: TabItemProps | undefined) => void
  onRemoveTab?: (tab: TabItemProps | undefined) => void
  tabHeight?: number
}

const MAX_TAB_LENGTH = 16

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const {height, width, items = [], currentTab, onChangeTab, onRemoveTab, tabHeight = 40} = props

  const [currentKey, setCurrentKey] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    setCurrentKey(currentTab?.key ?? items[0]?.key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab])

  const handleChange = (key: string) => {
    const tab = items.find((t) => t.key === key)
    setCurrentKey(tab?.key)
    onChangeTab?.(tab)
  }

  const handleRemove = (tab: TabItemProps) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveTab?.(tab)
  }

  const currentChildren = items.find((item) => item.key === currentKey)?.children

  return (
    <div className="flex flex-col" style={{height, width}}>
      <div style={{height: tabHeight, boxSizing: 'border-box'}}>
        <Tabs value={currentKey} onValueChange={handleChange}>
          <TabsList className="h-full w-full justify-start rounded-none bg-transparent p-0">
            {items.map((tab) => {
              const truncated = tab.label.length > MAX_TAB_LENGTH
              const display = truncated ? `${tab.label.substring(0, MAX_TAB_LENGTH)}...` : tab.label
              return (
                <TooltipProvider key={tab.key} delayDuration={400}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <TabsTrigger
                          value={tab.key}
                          className={cn(
                            'group relative h-full gap-1.5 rounded-none px-3 text-sm',
                            'data-[state=active]:bg-background'
                          )}
                          style={{height: tabHeight}}
                        >
                          {tab.icon && <Icon name={tab.icon} size={16}/>}
                          <span className="max-w-[180px] truncate">{display}</span>
                          {tab.closable && (
                            <button
                              type="button"
                              onClick={handleRemove(tab)}
                              className="ml-1 inline-flex size-4 items-center justify-center rounded opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                            >
                              <Icon name="close" size={10}/>
                            </button>
                          )}
                        </TabsTrigger>
                      </div>
                    </TooltipTrigger>
                    {truncated && <TooltipContent side="top">{tab.label}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden" style={{height: height - tabHeight, boxSizing: 'border-box'}}>
        {currentChildren}
      </div>
    </div>
  )
}

export default TabPanel
