import { apiClient } from './client';
import {
  Room,
  RoomResponse,
  CreateRoomRequest,
} from '../types';

export class RoomsApi {
  /**
   * Create a new room
   */
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await apiClient.post<Room>('/rooms', data);
    return response.data!;
  }

  /**
   * Get all available rooms
   */
  async getAllRooms(): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/rooms');
    return response.data!;
  }

  /**
   * Get rooms that the current user has joined
   */
  async getUserRooms(): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/rooms/my-rooms');
    return response.data!;
  }

  /**
   * Get detailed information about a specific room
   */
  async getRoomById(roomId: string): Promise<RoomResponse> {
    const response = await apiClient.get<RoomResponse>(`/rooms/${roomId}`);
    return response.data!;
  }

  /**
   * Join a room
   */
  async joinRoom(roomId: string): Promise<Room> {
    const response = await apiClient.post<Room>(`/rooms/${roomId}/join`);
    return response.data!;
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/rooms/${roomId}/leave`);
    return response.data!;
  }

  /**
   * Delete a room (only for room creator)
   */
  async deleteRoom(roomId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/rooms/${roomId}`);
    return response.data!;
  }

  /**
   * Search rooms by name
   */
  async searchRooms(query: string): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/rooms', { search: query });
    return response.data!;
  }

  /**
   * Get room statistics
   */
  async getRoomStats(roomId: string): Promise<{
    messageCount: number;
    userCount: number;
    createdAt: string;
  }> {
    const room = await this.getRoomById(roomId);
    return {
      messageCount: room._count.messages,
      userCount: room._count.users,
      createdAt: room.createdAt,
    };
  }

  /**
   * Check if user is a member of a room
   */
  async isUserInRoom(roomId: string): Promise<boolean> {
    try {
      const room = await this.getRoomById(roomId);
      return room.isJoined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get room members
   */
  async getRoomMembers(roomId: string): Promise<{
    id: string;
    username: string;
    createdAt: string;
  }[]> {
    const room = await this.getRoomById(roomId);
    return room.users;
  }

  /**
   * Bulk join multiple rooms
   */
  async joinMultipleRooms(roomIds: string[]): Promise<{
    successful: string[];
    failed: { roomId: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      roomIds.map(roomId => this.joinRoom(roomId))
    );

    const successful: string[] = [];
    const failed: { roomId: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(roomIds[index]);
      } else {
        failed.push({
          roomId: roomIds[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  }

  /**
   * Get room list with filters
   */
  async getRoomsWithFilters(filters: {
    joined?: boolean;
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'userCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Room[]> {
    const params: Record<string, any> = {};

    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    let rooms: Room[];

    if (filters.joined === true) {
      rooms = await this.getUserRooms();
    } else if (filters.joined === false) {
      const allRooms = await this.getAllRooms();
      rooms = allRooms.filter(room => !room.isJoined);
    } else {
      rooms = await this.getAllRooms();
    }

    // Client-side filtering if search is provided and not handled by backend
    if (filters.search && !params.search) {
      rooms = rooms.filter(room => 
        room.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return rooms;
  }
}

// Create and export a singleton instance
export const roomsApi = new RoomsApi();
export default roomsApi; 