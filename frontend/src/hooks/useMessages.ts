import { useState, useCallback } from 'react';
import { messagesApi, MessagesPaginationResponse } from '../api/messages';
import {
  Message,
  ApiError,
} from '../types';

interface MessagesState {
  messages: Message[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

export const useMessages = () => {
  const [messagesState, setMessagesState] = useState<MessagesState>({
    messages: [],
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 0,
    currentPage: 1,
    totalCount: 0,
    isLoading: false,
    error: null,
  });

  const fetchMessages = useCallback(async (
    roomId: string,
    page: number = 1,
    limit: number = 50
  ) => {
    try {
      setMessagesState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await messagesApi.getMessagesByRoom({ roomId, page, limit });
      
      // Calculate pagination info
      const totalPages = response.meta.totalPages;
      const hasNextPage = response.meta.hasNextPage;
      const hasPrevPage = response.meta.hasPrevPage;
      
      setMessagesState(prev => ({
        ...prev,
        messages: response.data,
        hasNextPage,
        hasPrevPage,
        totalPages,
        currentPage: response.meta.page,
        totalCount: response.meta.total,
        isLoading: false,
      }));
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const loadMoreMessages = useCallback(async (
    roomId: string,
    limit: number = 50
  ) => {
    if (!messagesState.hasNextPage || messagesState.isLoading) return;

    try {
      setMessagesState(prev => ({ ...prev, isLoading: true, error: null }));
      const nextPage = messagesState.currentPage + 1;
      const response = await messagesApi.getMessagesByRoom({ roomId, page: nextPage, limit });
      
      // Calculate pagination info
      const totalPages = response.meta.totalPages;
      const hasNextPage = response.meta.hasNextPage;
      const hasPrevPage = response.meta.hasPrevPage;
      
      setMessagesState(prev => ({
        ...prev,
        messages: [...prev.messages, ...response.data],
        hasNextPage,
        hasPrevPage,
        totalPages,
        currentPage: response.meta.page,
        totalCount: response.meta.total,
        isLoading: false,
      }));
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, [messagesState.hasNextPage, messagesState.isLoading, messagesState.currentPage]);

  const addMessage = useCallback((message: Message) => {
    setMessagesState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      totalCount: prev.totalCount + 1,
    }));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessagesState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
      totalCount: Math.max(0, prev.totalCount - 1),
    }));
  }, []);

  const searchMessages = useCallback(async (
    roomId: string,
    query: string,
    limit: number = 50
  ) => {
    try {
      setMessagesState(prev => ({ ...prev, isLoading: true, error: null }));
      const results = await messagesApi.searchMessages(roomId, query, limit);
      
      setMessagesState(prev => ({
        ...prev,
        messages: results,
        // Search results don't have pagination meta, so set defaults
        hasNextPage: false,
        hasPrevPage: false,
        totalPages: 1,
        currentPage: 1,
        totalCount: results.length,
        isLoading: false,
      }));
      
      return results;
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const getRecentMessages = useCallback(async (
    roomId: string,
    limit: number = 50
  ) => {
    try {
      setMessagesState(prev => ({ ...prev, isLoading: true, error: null }));
      const messages = await messagesApi.getRecentMessages(roomId, limit);
      
      setMessagesState(prev => ({
        ...prev,
        messages,
        hasNextPage: false,
        hasPrevPage: false,
        totalPages: 1,
        currentPage: 1,
        totalCount: messages.length,
        isLoading: false,
      }));
      
      return messages;
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messagesApi.deleteMessage(messageId);
      removeMessage(messageId);
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({ ...prev, error: apiError.message }));
      throw error;
    }
  }, [removeMessage]);

  const getMessageStats = useCallback(async (roomId: string) => {
    try {
      return await messagesApi.getMessageStats(roomId);
    } catch (error) {
      const apiError = error as ApiError;
      setMessagesState(prev => ({ ...prev, error: apiError.message }));
      throw error;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessagesState({
      messages: [],
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 0,
      currentPage: 1,
      totalCount: 0,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setMessagesState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    messages: messagesState.messages,
    hasNextPage: messagesState.hasNextPage,
    hasPrevPage: messagesState.hasPrevPage,
    totalPages: messagesState.totalPages,
    currentPage: messagesState.currentPage,
    totalCount: messagesState.totalCount,
    isLoading: messagesState.isLoading,
    error: messagesState.error,

    // Actions
    fetchMessages,
    loadMoreMessages,
    addMessage,
    removeMessage,
    searchMessages,
    getRecentMessages,
    deleteMessage,
    getMessageStats,
    clearMessages,
    clearError,
  };
}; 