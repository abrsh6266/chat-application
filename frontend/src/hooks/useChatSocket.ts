import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authApi } from '../api';
import {
  Message,
  TypingUser,
  UseChatSocketReturn,
  ServerToClientEvents,
  ClientToServerEvents,
  MessageData,
  UserJoinedData,
  UserLeftData,
  ErrorData,
} from '../types';

interface OnlineUser {
  id: string;
  username: string;
  roomId: string;
}

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3000';

export const useChatSocket = (roomId?: string): UseChatSocketReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = authApi.getToken();
    
    if (!token) {
      setError('Authentication required for chat');
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    socket.on('message', (data: MessageData) => {
      const message: Message = {
        id: data.id,
        content: data.content,
        userId: data.userId,
        roomId: data.roomId,
        user: data.user,
        createdAt: data.createdAt.toString(),
      };

      setMessages(prev => [...prev, message]);
      setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
    });

    socket.on('userJoined', (data: UserJoinedData) => {
      setOnlineUsers(prev => {
        const exists = prev.some(user => user.id === data.userId);
        if (exists) return prev;
        
        return [...prev, {
          id: data.userId,
          username: data.username,
          roomId: data.roomId,
        }];
      });
    });

    socket.on('userLeft', (data: UserLeftData) => {
      setOnlineUsers(prev => prev.filter(user => user.id !== data.userId));
      setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
    });

    socket.on('typing', (data) => {
      setTypingUsers(prev => {
        const exists = prev.some(user => user.id === data.userId);
        if (exists) return prev;
        
        return [...prev, {
          id: data.userId,
          username: data.username,
          roomId: data.roomId,
        }];
      });
    });

    socket.on('stopTyping', (data) => {
      setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
    });

    socket.on('error', (data: ErrorData) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !roomId || !isConnected) return;

    if (currentRoomRef.current && currentRoomRef.current !== roomId) {
      socketRef.current.emit('leaveRoom', { roomId: currentRoomRef.current });
    }

    socketRef.current.emit('joinRoom', { roomId });
    currentRoomRef.current = roomId;

    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);

    return () => {
      if (socketRef.current && roomId) {
        socketRef.current.emit('leaveRoom', { roomId });
      }
    };
  }, [roomId, isConnected]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomId || !content.trim()) return;

    socketRef.current.emit('sendMessage', {
      content: content.trim(),
      roomId,
    });

    stopTyping();
  }, [roomId]);

  const joinRoom = useCallback((newRoomId: string) => {
    if (!socketRef.current) return;

    if (currentRoomRef.current) {
      socketRef.current.emit('leaveRoom', { roomId: currentRoomRef.current });
    }

    socketRef.current.emit('joinRoom', { roomId: newRoomId });
    currentRoomRef.current = newRoomId;

    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
  }, []);

  const leaveRoom = useCallback((roomIdToLeave: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('leaveRoom', { roomId: roomIdToLeave });
    
    if (currentRoomRef.current === roomIdToLeave) {
      currentRoomRef.current = null;
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
  }, []);

  const startTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('typing', {
      roomId,
      userId: '',
      username: '',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [roomId]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('stopTyping', {
      roomId,
      userId: '',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    error,
  };
}; 