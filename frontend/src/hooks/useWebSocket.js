import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useWebSocket — WebSocket connection hook with auto-reconnect and XHR fallback.
 *
 * @param {string | null} url — WebSocket URL (null = disabled / use XHR fallback)
 * @param {{ onMessage?, onOpen?, onClose?, onError?, reconnectDelay? }} options
 * @returns {{ sendMessage, lastMessage, readyState, connected }}
 */
const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectDelay = 3000,
    maxReconnects = 5,
  } = options;

  const wsRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CLOSED);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(function doConnect() {
    // If no URL given, skip (XHR fallback mode)
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (ev) => {
        setReadyState(WebSocket.OPEN);
        setConnected(true);
        reconnectCountRef.current = 0;
        onOpen?.(ev);
      };

      ws.onmessage = (ev) => {
        let parsed;
        try {
          parsed = JSON.parse(ev.data);
        } catch {
          parsed = ev.data;
        }
        setLastMessage(parsed);
        onMessage?.(parsed);
      };

      ws.onclose = (ev) => {
        setReadyState(WebSocket.CLOSED);
        setConnected(false);
        onClose?.(ev);

        // Auto-reconnect
        if (reconnectCountRef.current < maxReconnects) {
          reconnectCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(doConnect, reconnectDelay);
        }
      };

      ws.onerror = (ev) => {
        setReadyState(WebSocket.CLOSED);
        onError?.(ev);
        ws.close();
      };
    } catch (err) {
      console.warn('WebSocket unavailable, using XHR fallback:', err.message);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectDelay, maxReconnects]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { sendMessage, lastMessage, readyState, connected };
};

export default useWebSocket;
