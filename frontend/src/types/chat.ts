export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  roomId: string;
}

export interface CreateMessageRequest {
  content: string;
  roomId: string;
}

export interface ServerToClientEvents {
  message: (data: MessageData) => void;
  userJoined: (data: UserJoinedData) => void;
  userLeft: (data: UserLeftData) => void;
  error: (data: ErrorData) => void;
  roomCreated: (data: RoomData) => void;
  typing: (data: TypingData) => void;
  stopTyping: (data: StopTypingData) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: JoinRoomData) => void;
  leaveRoom: (data: LeaveRoomData) => void;
  sendMessage: (data: SendMessageData) => void;
  typing: (data: TypingData) => void;
  stopTyping: (data: StopTypingData) => void;
}

export interface MessageData {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: Date;
}

export interface UserJoinedData {
  userId: string;
  username: string;
  roomId: string;
}

export interface UserLeftData {
  userId: string;
  username: string;
  roomId: string;
}

export interface ErrorData {
  message: string;
  code?: string;
}

export interface RoomData {
  id: string;
  name: string;
  createdAt: Date;
}

export interface JoinRoomData {
  roomId: string;
}

export interface LeaveRoomData {
  roomId: string;
}

export interface SendMessageData {
  content: string;
  roomId: string;
}

export interface TypingData {
  roomId: string;
  userId: string;
  username: string;
}

export interface StopTypingData {
  roomId: string;
  userId: string;
}

export interface ChatState {
  messages: Message[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  currentRoomId: string | null;
}

export interface OnlineUser {
  id: string;
  username: string;
  roomId: string;
}

export interface TypingUser {
  id: string;
  username: string;
  roomId: string;
}

export interface UseChatSocketReturn {
  messages: Message[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  error: string | null;
}

export interface MessageProps {
  message: Message;
  isOwn: boolean;
  showUser?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface OnlineUserListProps {
  users: OnlineUser[];
  typingUsers: TypingUser[];
}

export interface OnlineUserListItemProps {
  user: OnlineUser;
  isTyping: boolean;
} 