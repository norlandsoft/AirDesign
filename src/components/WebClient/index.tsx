import React, {useEffect, useRef} from "react";
import './index.less';

interface WebClientProps {
  onOpen?: (ws: WebSocket) => void;
  onMessage?: (data: unknown) => void;
  path?: string;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

const WebClient: React.FC<WebClientProps> = props => {
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const lockRef = useRef<boolean>(true);
  const [info, setInfo] = React.useState<string | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const waitPongTimerRef = useRef<number | null>(null);

  const {
    onOpen,
    onMessage,
    path = '/webapi',
    reconnectInterval = 3000, // 重连间隔
    heartbeatInterval = 10000, // 心跳检测间隔
    heartbeatTimeout = 15000 // 心跳响应超时
  } = props;

  useEffect(() => {
    // 连接到服务器
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
      // stop interval
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      lockRef.current = false;
      setInfo(null);
      stopHeartbeat();
    };
  }, []);

  const connect = () => {
    const addr = sessionStorage.getItem('air-framework-addr');
    if (!addr) {
      setInfo('未配置平台服务器地址');
      return;
    }

    const ws = new WebSocket(`ws://${addr}${path}`);

    const handleOpen = () => {
      clearInterval(intervalRef.current);
      setInfo(null);
      wsRef.current = ws;
      startHeartbeat();
      onOpen?.(ws);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'pong') {
          resetHeartbeatTimeout();
          return; // 心跳响应，不处理消息
        }
        onMessage?.(data);
      } catch (e) {
        console.error('消息解析失败:', e);
      }
    };

    const handleError = () => {
      setInfo('无法连接到平台服务器');
      wsRef.current = null;
    };

    const handleClose = () => {
      setInfo('与平台服务器的连接已断开');
      wsRef.current = null;
      reconnect();
    };

    ws.onopen = handleOpen;
    ws.onmessage = handleMessage;
    ws.onerror = handleError;
    ws.onclose = handleClose;
  }

  const reconnect = () => {
    if (lockRef.current) {
      disconnect();
      intervalRef.current = window.setInterval(() => {
        console.log('尝试重新连接...');
        connect();
      }, reconnectInterval);
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    clearInterval(intervalRef.current);
  }

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimerRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({type: 'ping'}));
        startWaitPong();
      }
    }, heartbeatInterval);
  };

  const startWaitPong = () => {
    stopWaitPong();
    waitPongTimerRef.current = window.setTimeout(() => {
      console.warn('心跳响应超时，主动断开连接');
      disconnect();
      reconnect();
    }, heartbeatTimeout);
  };

  const resetHeartbeatTimeout = () => {
    stopWaitPong();
    startWaitPong();
  };

  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    stopWaitPong();
  };

  const stopWaitPong = () => {
    if (waitPongTimerRef.current) {
      clearTimeout(waitPongTimerRef.current);
      waitPongTimerRef.current = null;
    }
  };

  return (
      <div className={'web-socket-notice'} style={{visibility: info ? 'visible' : 'hidden'}}>
        {info}
      </div>
  )
}

export default WebClient;
