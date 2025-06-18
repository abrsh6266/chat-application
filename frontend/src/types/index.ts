import React from 'react';

export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthError,
  AuthState,
  LoginFormData,
  RegisterFormData,
  FormErrors,
} from './auth';

export type {
  Room,
  RoomUser,
  CreateRoomRequest,
  JoinRoomRequest,
  RoomListResponse,
  RoomResponse,
  RoomMessage,
  RoomState,
  CreateRoomFormData,
  RoomFormErrors,
  RoomListItemProps,
  OnlineUser,
} from './room';

export type {
  Message,
  SendMessageRequest,
  CreateMessageRequest,
  ServerToClientEvents,
  ClientToServerEvents,
  MessageData,
  UserJoinedData,
  UserLeftData,
  ErrorData,
  RoomData,
  JoinRoomData,
  LeaveRoomData,
  SendMessageData,
  TypingData,
  StopTypingData,
  ChatState,
  TypingUser,
  UseChatSocketReturn,
  MessageProps,
  ChatInputProps,
  OnlineUserListProps,
  OnlineUserListItemProps,
} from './chat';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
} 