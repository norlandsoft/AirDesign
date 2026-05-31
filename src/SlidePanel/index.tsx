import React from 'react'
import {Drawer} from 'antd'
import Button from '../Button'
import Icon from '../Icon'
import './index.less'

const SlidePanel = (props) => {
  const {
    children,
    maskClosable = false,
    buttonStyles,
    hasCloseButton = false,
    hasButtonBar = true,
    onConfirm,
    onClose,
    confirmButtonText = '确定',
    closeButtonText = '取消',
    open,
    placement = 'right',
    title,
    bodyPadding = '16',
    bodyBackgroundColor = '#fff',
    type = 'default' /* small, default, large, huge, custom */,
    width = 378,
    onOpenChange = (opened: boolean) => {
    },
    /* custom footer components */
    footerExtra,
    /* inner drawer */
    innerDrawer = undefined, // 内嵌抽屉的内容
    innerDrawerWidth = 600, // 内嵌抽屉宽度
    showInnerDrawer = false, // 内嵌抽屉是否打开
    onInnerClose = () => {
    }, // 内嵌抽屉关闭回调
  } = props

  const footerContent = (
      <div className={'air-slide-footer'}>
      <span>
        {onConfirm ? (
            <Button
                type={'primary'}
                onClick={onConfirm}
                style={{marginRight: '12px', ...buttonStyles}}
            >
              {confirmButtonText}
            </Button>
        ) : null}
        {onClose ? (
            <Button type={'default'} onClick={onClose}>
              {closeButtonText}
            </Button>
        ) : null}
      </span>
        <span>{footerExtra && <div>{footerExtra}</div>}</span>
      </div>
  )

  const getPanelWidth = () => {
    switch (type) {
      case 'small':
        return 290
      case 'medium':
        return 520
      case 'large':
        return 850
      case 'huge':
        return 1280
      case 'full':
        return '100%'
      case 'custom':
        return width
      case 'default':
      default:
        return 378
    }
  }

  return (
      <Drawer
          closable={hasCloseButton}
          closeIcon={hasCloseButton ? <Icon name={'close'} size={16}/> : undefined}
          maskClosable={maskClosable}
          onClose={onClose}
          open={open}
          afterOpenChange={onOpenChange}
          size={type === 'full' ? '100%' : getPanelWidth()}
          placement={type === 'full' ? 'top' : placement}
          footer={hasButtonBar ? footerContent : null}
          title={title || null}
          styles={{
            section: {
              display: 'flex',
              flexDirection: 'column',
            },
            header: {
              height: '40px',
              lineHeight: '40px',
              flexShrink: 0,
              padding: '0 16px',
              background: '#fafafa',
            },
            body: {
              flex: 1,
              overflow: 'auto',
              padding: `${bodyPadding}px`,
              background: bodyBackgroundColor,
            },
            footer: {
              height: '50px',
              lineHeight: '50px',
              flexShrink: 0,
              borderTop: 'var(--panel-border)',
              background: '#fafafa',
              textAlign: type === 'full' ? 'right' : 'left',
              padding: '0 24px',
              margin: 0,
              boxSizing: 'border-box',
            },
          }}
          push={{distance: innerDrawerWidth - 32}}
          destroyOnHidden={true}
      >
        <div className="air-slide-body" style={type === 'full' ? {height: '100%'} : undefined}>{children}</div>
        {innerDrawer && (
            <Drawer
                size={innerDrawerWidth}
                open={showInnerDrawer}
                destroyOnHidden={true}
                maskClosable={true}
                onClose={onInnerClose}
                closable={false}
                styles={{
                  body: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: bodyPadding,
                    paddingRight: bodyPadding,
                  },
                }}
            >
              {innerDrawer}
            </Drawer>
        )}
      </Drawer>
  )
}

export default SlidePanel
