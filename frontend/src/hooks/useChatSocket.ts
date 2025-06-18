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
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection once
  useEffect(() => {
    const validateToken = async (token: string) => {
      try {
        // Simple JWT payload decode (without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', payload);
        console.log('🕐 Token expires:', new Date(payload.exp * 1000));
        console.log('🕐 Current time:', new Date());
        
        if (payload.exp * 1000 < Date.now()) {
          console.error('⚠️ Token has expired!');
          return false;
        }
        return true;
      } catch (error) {
        console.error('❌ Invalid token format:', error);
        return false;
      }
    };

    const initializeSocket = async () => {
      const token = authApi.getToken();
      
      if (!token) {
        console.error('❌ No authentication token found');
        setError('Authentication required for chat');
        return;
      }

      // Validate token before connecting
      const isValid = await validateToken(token);
      if (!isValid) {
        setError('Authentication token is invalid or expired. Please login again.');
        return;
      }

      console.log('🔌 Initializing socket connection...');
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
      console.log('🌐 Socket URL:', SOCKET_URL);

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // Allow both transports
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      socket.on('authenticated', (data) => {
        console.log('🔐 Socket authenticated:', data);
        
        // Rejoin current room if exists
        if (currentRoomRef.current) {
          console.log('🏠 Rejoining room after authentication:', currentRoomRef.current);
          socket.emit('joinRoom', { roomId: currentRoomRef.current });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, manual reconnection needed
          setTimeout(() => socket.connect(), 1000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('🔥 Socket connection error:', error);
        reconnectAttemptsRef.current++;
        
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to connect to chat server. Please refresh the page.');
        } else {
          setError(`Connection failed: ${error.message}. Retrying... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        }
        setIsConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setError(null);
      });

      socket.on('reconnect_error', (error) => {
        console.error('🔥 Reconnection failed:', error);
      });

      socket.on('reconnect_failed', () => {
        console.error('💀 All reconnection attempts failed');
        setError('Unable to reconnect to chat server. Please refresh the page.');
      });

      // Message events
      socket.on('message', (data: MessageData) => {
        console.log('📨 Received message:', data);
        const message: Message = {
          id: data.id,
          content: data.content,
          userId: data.userId,
          roomId: data.roomId,
          user: data.user,
          createdAt: data.createdAt.toString(),
        };

        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        // Remove typing indicator for the user who sent the message
        setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
      });

      // User presence events
      socket.on('onlineUsers', (data) => {
        console.log('👥 Received online users:', data);
        const onlineUsersList = data.users.map((user: any) => ({
          id: user.userId,
          username: user.username,
          roomId: user.roomId,
        }));
        setOnlineUsers(onlineUsersList);
      });

      socket.on('userJoined', (data: UserJoinedData) => {
        console.log('👋 User joined:', data);
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
        console.log('👋 User left:', data);
        setOnlineUsers(prev => prev.filter(user => user.id !== data.userId));
        setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
      });

      // Typing events
      socket.on('typing', (data) => {
        console.log('⌨️ User typing:', data);
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
        console.log('⌨️ User stopped typing:', data);
        setTypingUsers(prev => prev.filter(user => user.id !== data.userId));
      });

      // Error events
      socket.on('error', (data: ErrorData) => {
        console.error('❌ Socket error:', data);
        setError(data.message);
      });
    };

    initializeSocket();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection...');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Handle room changes
  useEffect(() => {
    if (!socketRef.current || !roomId) return;

    const handleRoomChange = () => {
      console.log('🏠 Changing room from', currentRoomRef.current, 'to', roomId);

      // Leave previous room
      if (currentRoomRef.current && currentRoomRef.current !== roomId) {
        socketRef.current!.emit('leaveRoom', { roomId: currentRoomRef.current });
      }

      // Join new room
      if (isConnected) {
        socketRef.current!.emit('joinRoom', { roomId });
        currentRoomRef.current = roomId;
      }

      // Clear room-specific state
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    };

    handleRoomChange();

    return () => {
      // Leave room on unmount or room change
      if (socketRef.current && roomId) {
        console.log('🚪 Leaving room:', roomId);
        socketRef.current.emit('leaveRoom', { roomId });
      }
    };
  }, [roomId, isConnected]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomId || !content.trim() || !isConnected) {
      console.warn('⚠️ Cannot send message - missing requirements');
      return;
    }

    console.log('📤 Sending message:', content);
    socketRef.current.emit('sendMessage', {
      content: content.trim(),
      roomId,
    });

    // Stop typing indicator
    stopTyping();
  }, [roomId, isConnected]);

  const joinRoom = useCallback((newRoomId: string) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ Cannot join room - socket not connected');
      return;
    }

    console.log('🏠 Manually joining room:', newRoomId);

    // Leave current room
    if (currentRoomRef.current) {
      socketRef.current.emit('leaveRoom', { roomId: currentRoomRef.current });
    }

    // Join new room
    socketRef.current.emit('joinRoom', { roomId: newRoomId });
    currentRoomRef.current = newRoomId;

    // Clear state
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
  }, [isConnected]);

  const leaveRoom = useCallback((roomIdToLeave: string) => {
    if (!socketRef.current) return;

    console.log('🚪 Manually leaving room:', roomIdToLeave);
    socketRef.current.emit('leaveRoom', { roomId: roomIdToLeave });
    
    if (currentRoomRef.current === roomIdToLeave) {
      currentRoomRef.current = null;
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
  }, []);

  const startTyping = useCallback(() => {
    if (!socketRef.current || !roomId || !isConnected) return;

    console.log('⌨️ Start typing in room:', roomId);
    socketRef.current.emit('typing', {
      roomId,
      userId: '',
      username: '',
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [roomId, isConnected]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId || !isConnected) return;

    console.log('⌨️ Stop typing in room:', roomId);
    socketRef.current.emit('stopTyping', {
      roomId,
      userId: '',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [roomId, isConnected]);

  // Cleanup typing timeout on unmount
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