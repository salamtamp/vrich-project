import { useEffect, useRef, useState } from 'react';

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { publicEnv } from '@/constants/env/public-env';

type UseSocketOptions = {
  token: string;
  serverUrl?: string;
};

type UseSocketReturn = {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
};

export const useSocket = ({ token, serverUrl }: UseSocketOptions): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // For browser connections, always use localhost instead of Docker container hostname
  const getSocketServerUrl = () => {
    if (serverUrl) {
      return serverUrl;
    }

    // If baseApiUrl contains Docker container hostname, replace with localhost
    const baseUrl = publicEnv.baseApiUrl ?? 'http://localhost:8000';
    if (baseUrl.includes('vrich_app_dev')) {
      return baseUrl.replace('vrich_app_dev', 'localhost');
    }

    return baseUrl;
  };

  const socketServerUrl = getSocketServerUrl();

  const connect = () => {
    if (socketRef.current?.connected) {
      return;
    }

    console.info('Attempting to connect to Socket.IO server:', socketServerUrl);
    console.info('Token present:', !!token);

    socketRef.current = io(socketServerUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.info('Connected to Socket.IO server');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.info('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    socketRef.current.on('connected', (data) => {
      console.info('Authentication successful:', data);
    });

    socketRef.current.on('joined_room', (data) => {
      console.info('Joined room:', data);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinRoom = (room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { room });
    }
  };

  useEffect(() => {
    if (token && token.length > 0) {
      connect();
    } else {
      console.warn('Socket.IO: No token provided, skipping connection.');
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, socketServerUrl]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinRoom,
  };
};
