import React, {useCallback, useEffect, useRef} from 'react';
import {Terminal} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './index.less';

/**
 * WebShell 连接参数
 */
export interface WebShellConnectOptions {
  host: string;
  port?: number;
  username: string;
  password: string;
}

/**
 * WebShell 组件属性
 *
 * 使用 xterm.js 模拟终端，通过原生 WebSocket 连接平台 /ws/webshell，
 * 由平台经 JSch 转发到目标 SSH 服务器，支持多用户多路。
 */
export interface WebShellProps {
  /** 连接参数：host, port(默认22), username, password */
  options: WebShellConnectOptions;
  /** WebSocket 路径，默认 /ws/webshell */
  wsPath?: string;
  /** 连接成功回调 */
  onConnect?: () => void;
  /** 断开回调 */
  onDisconnect?: () => void;
  /** 错误回调 */
  onError?: (message: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 根据当前页面的 protocol/host 构造 WebSocket 的 base URL（ws 或 wss）
 */
function getWsBase(): string {
  const {protocol, host} = window.location;
  return (protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host;
}

/**
 * WebShell 组件
 *
 * 基于 xterm.js + 原生 WebSocket，连接平台 /ws/webshell，
 * 协议：首条 JSON { type:'connect', host, port, username, password }；
 * 之后可发 { type:'resize', cols, rows } 或裸终端输入。
 * 服务端通过 JSch 建立 SSH Shell 并转发输入输出。
 *
 * 注意：onConnect/onDisconnect/onError 通过 ref 持有最新引用，不加入 effect 依赖，
 * 避免父组件因 frameSize 等重渲染时传入新函数导致 effect 清理并重连、页面尺寸变化时连接被断开。
 *
 * Created by ChaiMingXu, on 2026-01-25
 */
const WebShell: React.FC<WebShellProps> = (props) => {
  const {
    options,
    wsPath = '/ws/webshell',
    onConnect,
    onDisconnect,
    onError,
    className = '',
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;
  onErrorRef.current = onError;

  const sendResize = useCallback(() => {
    const term = termRef.current;
    const ws = wsRef.current;
    if (!term || !ws || ws.readyState !== WebSocket.OPEN) return;
    const cols = term.cols;
    const rows = term.rows;
    try {
      ws.send(JSON.stringify({type: 'resize', cols, rows}));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !options?.host || !options?.username || !options?.password) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrainsMono, Menlo, "SF Mono", Monaco, "Courier New", monospace',
      theme: {background: '#ffffff', foreground: '#000000', cursor: '#000000'},
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;

    const base = getWsBase();
    const url = base + wsPath;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      const {host, port = 22, username, password} = options;
      ws.send(
          JSON.stringify({
            type: 'connect',
            host,
            port,
            username,
            password,
          }),
      );
      sendResize();
      onConnectRef.current?.();
    };

    ws.onmessage = (ev: MessageEvent) => {
      const data = typeof ev.data === 'string' ? ev.data : '';
      if (!data) return;
      try {
        const j = JSON.parse(data);
        if (j && j.type === 'error') {
          term.writeln('\r\n[错误] ' + (j.message || ''));
          onErrorRef.current?.(j.message);
          return;
        }
      } catch (_) {
        // 非 JSON，当作终端输出
      }
      term.write(data);
    };

    ws.onclose = () => {
      term.writeln('\r\n\r\n[连接已关闭]');
      onDisconnectRef.current?.();
    };

    ws.onerror = () => {
      onErrorRef.current?.('WebSocket 连接异常');
    };

    term.onData((d) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(d);
    });

    // 有选区时 Ctrl/Cmd+C 写入剪贴板并拦截，避免 ^C 发到 pty；弥补 copy 事件在部分环境下不触发或无法复制中文的问题
    term.onKey((e) => {
      const ev = e.domEvent;
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'c') {
        const sel = term.getSelection();
        if (sel && sel.length > 0) {
          ev.preventDefault();
          ev.stopPropagation();
          navigator.clipboard.writeText(sel).catch(() => {
          });
        }
      }
    });

    const ro = new ResizeObserver(() => {
      fit.fit();
      sendResize();
    });
    ro.observe(container);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [options?.host, options?.username, options?.password, options?.port, wsPath, sendResize]);

  return (
      <div
          ref={containerRef}
          className={`air-webshell ${className}`.trim()}
          style={{minHeight: 120, ...style}}
      />
  );
};

export default WebShell;
