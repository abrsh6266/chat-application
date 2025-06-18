export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users: RoomUser[];
  isJoined: boolean;
  _count: {
    messages: number;
    users: number;
  };
}

export interface RoomUser {
  id: string;
  username: string;
  createdAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
}

export interface JoinRoomRequest {
  roomId: string;
}

export interface RoomListResponse {
  rooms: Room[];
}

export interface RoomResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users: RoomUser[];
  messages: RoomMessage[];
  isJoined: boolean;
  _count: {
    messages: number;
    users: number;
  };
}

export interface RoomMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface RoomState {
  rooms: Room[];
  currentRoom: RoomResponse | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateRoomFormData {
  name: string;
  description?: string;
}

export interface RoomFormErrors {
  name?: string;
  description?: string;
  general?: string;
}

export interface RoomListItemProps {
  room: Room;
  onJoin: (roomId: string) => void;
  onSelect: (roomId: string) => void;
  isSelected?: boolean;
}

export interface OnlineUser {
  id: string;
  username: string;
  isTyping?: boolean;
} 