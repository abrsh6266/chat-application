import { useState, useCallback } from 'react';
import { roomsApi } from '../api';
import {
  RoomResponse,
  CreateRoomRequest,
  RoomState,
  ApiError,
} from '../types';

export const useRooms = () => {
  const [roomState, setRoomState] = useState<RoomState>({
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: null,
  });

  const fetchAllRooms = useCallback(async () => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const rooms = await roomsApi.getAllRooms();
      
      // Filter out rooms with no users
      const roomsWithUsers = rooms.filter(room => {
        const userCount = room._count?.users || 0;
        const usersArrayLength = room.users?.length || 0;
        return userCount > 0 || usersArrayLength > 0;
      });
      
      setRoomState(prev => ({ ...prev, rooms: roomsWithUsers, isLoading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
    }
  }, []);

  const fetchUserRooms = useCallback(async () => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const rooms = await roomsApi.getUserRooms();
      setRoomState(prev => ({ ...prev, rooms, isLoading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
    }
  }, []);

  const fetchRoomById = useCallback(async (roomId: string) => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const room = await roomsApi.getRoomById(roomId);
      setRoomState(prev => ({ 
        ...prev, 
        currentRoom: room, 
        isLoading: false 
      }));
      return room;
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const createRoom = useCallback(async (roomData: CreateRoomRequest) => {
    try {
      setRoomState(prev => ({ ...prev, error: null }));
      const newRoom = await roomsApi.createRoom(roomData);
      
      // Mark the newly created room as joined since the creator automatically joins
      const roomWithJoinedStatus = {
        ...newRoom,
        isJoined: true,
        _count: {
          users: 1, // Creator is automatically added
          messages: 0
        }
      };
      
      // Add the new room to the beginning of the list
      setRoomState(prev => ({
        ...prev,
        rooms: [roomWithJoinedStatus, ...prev.rooms],
      }));
      
      return roomWithJoinedStatus;
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    try {
      const updatedRoom = await roomsApi.joinRoom(roomId);
      
      setRoomState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => 
          room.id === roomId 
            ? { 
                ...room, 
                isJoined: true, 
                users: updatedRoom.users || room.users, 
                _count: {
                  ...room._count,
                  users: updatedRoom._count?.users || (room._count?.users || 0) + 1
                }
              }
            : room
        ),
        error: null,
      }));
      
      return updatedRoom;
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const leaveRoom = useCallback(async (roomId: string) => {
    try {
      await roomsApi.leaveRoom(roomId);
      
      setRoomState(prev => {
        const updatedRooms = prev.rooms.map(room => {
          if (room.id === roomId) {
            const newUserCount = Math.max(0, (room._count?.users || 1) - 1);
            return { 
              ...room, 
              isJoined: false, 
              _count: { 
                ...room._count, 
                users: newUserCount 
              }
            };
          }
          return room;
        });
        
        // Filter out rooms with no users after leaving
        const roomsWithUsers = updatedRooms.filter(room => 
          (room._count?.users || 0) > 0
        );
        
        return {
          ...prev,
          rooms: roomsWithUsers,
          currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom,
          error: null,
        };
      });
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      await roomsApi.deleteRoom(roomId);
      
      setRoomState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
        currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom,
        error: null,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const searchRooms = useCallback(async (query: string) => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const rooms = await roomsApi.searchRooms(query);
      
      // Filter out rooms with no users
      const roomsWithUsers = rooms.filter(room => 
        room._count?.users > 0 || room.users?.length > 0
      );
      
      setRoomState(prev => ({ ...prev, rooms: roomsWithUsers, isLoading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
    }
  }, []);

  const getRoomsWithFilters = useCallback(async (filters: {
    joined?: boolean;
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'userCount';
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const rooms = await roomsApi.getRoomsWithFilters(filters);
      setRoomState(prev => ({ ...prev, rooms, isLoading: false }));
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
    }
  }, []);

  const bulkJoinRooms = useCallback(async (roomIds: string[]) => {
    try {
      setRoomState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await roomsApi.joinMultipleRooms(roomIds);
      
      setRoomState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => 
          result.successful.includes(room.id)
            ? { ...room, isJoined: true }
            : room
        ),
        isLoading: false,
        error: result.failed.length > 0 
          ? `Failed to join ${result.failed.length} rooms` 
          : null,
      }));
      
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setRoomState(prev => ({ ...prev, error: null }));
  }, []);

  const clearCurrentRoom = useCallback(() => {
    setRoomState(prev => ({ ...prev, currentRoom: null }));
  }, []);

  const updateCurrentRoom = useCallback((room: RoomResponse) => {
    setRoomState(prev => ({ ...prev, currentRoom: room }));
  }, []);

  const getRoomStats = useCallback(async (roomId: string) => {
    try {
      return await roomsApi.getRoomStats(roomId);
    } catch (error) {
      const apiError = error as ApiError;
      setRoomState(prev => ({ 
        ...prev, 
        error: apiError.message 
      }));
      throw error;
    }
  }, []);

  const isUserInRoom = useCallback(async (roomId: string) => {
    try {
      return await roomsApi.isUserInRoom(roomId);
    } catch (error) {
      return false;
    }
  }, []);

  const refreshRooms = useCallback(async () => {
    await fetchAllRooms();
  }, [fetchAllRooms]);

  const refreshCurrentRoom = useCallback(async () => {
    if (roomState.currentRoom) {
      await fetchRoomById(roomState.currentRoom.id);
    }
  }, [roomState.currentRoom, fetchRoomById]);

  // Add a method to refetch rooms after operations
  const refetchRooms = useCallback(async () => {
    await fetchAllRooms();
  }, [fetchAllRooms]);

  return {
    rooms: roomState.rooms,
    currentRoom: roomState.currentRoom,
    isLoading: roomState.isLoading,
    error: roomState.error,

    fetchAllRooms,
    fetchUserRooms,
    fetchRoomById,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    searchRooms,
    getRoomsWithFilters,
    bulkJoinRooms,
    clearError,
    clearCurrentRoom,
    updateCurrentRoom,
    getRoomStats,
    isUserInRoom,
    refreshRooms,
    refreshCurrentRoom,
    refetchRooms,
  };
}; 