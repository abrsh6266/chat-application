export interface ServerToClientEvents {
    message: (data: MessageData) => void;
    userJoined: (data: UserJoinedData) => void;
    userLeft: (data: UserLeftData) => void;
    error: (data: ErrorData) => void;
    roomCreated: (data: RoomData) => void;
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