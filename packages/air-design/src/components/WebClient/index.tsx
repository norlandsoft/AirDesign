/**
 * WebClient WebSocket 客户端
 *
 * 带心跳检测与断线重连的 WebSocket 连接管理组件。无 UI 库依赖，逻辑与旧版一致，
 * 仅将提示文字容器样式改为 Tailwind。
 *
 * @author ChaiMingXu, 2026/06/19
 */
import React, {useEffect, useRef} from 'react'

interface WebClientProps {
  onOpen?: (ws: WebSocket) => void
  onMessage?: (data: unknown) => void
  path?: string
  reconnectInterval?: number
  heartbeatInterval?: number
  heartbeatTimeout?: number
}

const WebClient: React.FC<WebClientProps> = (props) => {
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<number | undefined>(undefined)
  const lockRef = useRef<boolean>(true)
  const [info, setInfo] = React.useState<string | null>(null)
  const heartbeatTimerRef = useRef<number | null>(null)
  const waitPongTimerRef = useRef<number | null>(null)

  const {
    onOpen,
    onMessage,
    path = '/webapi',
    reconnectInterval = 3000,
    heartbeatInterval = 10000,
    heartbeatTimeout = 15000,
  } = props

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) wsRef.current.close()
      wsRef.current = null
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
      lockRef.current = false
      setInfo(null)
      stopHeartbeat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connect = () => {
    const addr = sessionStorage.getItem('air-framework-addr')
    if (!addr) {
      setInfo('未配置平台服务器地址')
      return
    }

    const ws = new WebSocket(`ws://${addr}${path}`)

    ws.onopen = () => {
      clearInterval(intervalRef.current)
      setInfo(null)
      wsRef.current = ws
      startHeartbeat()
      onOpen?.(ws)
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.type === 'pong') {
          resetHeartbeatTimeout()
          return
        }
        onMessage?.(data)
      } catch (e) {
        console.error('消息解析失败:', e)
      }
    }

    ws.onerror = () => {
      setInfo('无法连接到平台服务器')
      wsRef.current = null
    }

    ws.onclose = () => {
      setInfo('与平台服务器的连接已断开')
      wsRef.current = null
      reconnect()
    }
  }

  const reconnect = () => {
    if (lockRef.current) {
      disconnect()
      intervalRef.current = window.setInterval(() => {
        console.log('尝试重新连接...')
        connect()
      }, reconnectInterval)
    }
  }

  const disconnect = () => {
    if (wsRef.current) wsRef.current.close()
    clearInterval(intervalRef.current)
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimerRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({type: 'ping'}))
        startWaitPong()
      }
    }, heartbeatInterval)
  }

  const startWaitPong = () => {
    stopWaitPong()
    waitPongTimerRef.current = window.setTimeout(() => {
      console.warn('心跳响应超时，主动断开连接')
      disconnect()
      reconnect()
    }, heartbeatTimeout)
  }

  const resetHeartbeatTimeout = () => {
    stopWaitPong()
    startWaitPong()
  }

  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
    stopWaitPong()
  }

  const stopWaitPong = () => {
    if (waitPongTimerRef.current) {
      clearTimeout(waitPongTimerRef.current)
      waitPongTimerRef.current = null
    }
  }

  return (
    <div className="text-xs text-destructive" style={{visibility: info ? 'visible' : 'hidden'}}>
      {info}
    </div>
  )
}

export default WebClient
