import { apiClient } from './client';
import {
  Message,
  CreateMessageRequest,
  PaginationParams,
} from '../types';

export interface GetMessagesParams extends PaginationParams {
  roomId: string;
}

export interface MessagesPaginationResponse {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class MessagesApi {
  /**
   * Create a new message in a room
   */
  async createMessage(data: CreateMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', data);
    return response.data!;
  }

  /**
   * Get messages for a specific room with pagination
   */
  async getMessagesByRoom(params: GetMessagesParams): Promise<MessagesPaginationResponse> {
    const { roomId, page = 1, limit = 50, sortBy, sortOrder } = params;
    
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;

    const response = await apiClient.get<MessagesPaginationResponse>(
      `/messages/room/${roomId}`,
      queryParams
    );
    
    return response.data!;
  }

  /**
   * Get recent messages for a room (convenience method)
   */
  async getRecentMessages(roomId: string, limit: number = 50): Promise<Message[]> {
    const response = await this.getMessagesByRoom({
      roomId,
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    
    // Return messages in ascending order (oldest first)
    return response.data.reverse();
  }

  /**
   * Delete a message (only message author can delete)
   */
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/messages/${messageId}`);
    return response.data!;
  }

  /**
   * Get older messages for infinite scroll with cursor-based pagination
   */
  async getOlderMessages(
    roomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<MessagesPaginationResponse> {
    return this.getMessagesByRoom({
      roomId,
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Search messages in a room
   */
  async searchMessages(
    roomId: string, 
    query: string, 
    limit: number = 50
  ): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`/messages/room/${roomId}`, {
      search: query,
      limit,
    });
    
    return response.data!;
  }

  /**
   * Get message statistics for a room
   */
  async getMessageStats(roomId: string): Promise<{
    totalMessages: number;
    messagesThisWeek: number;
    messagesThisMonth: number;
  }> {
    const response = await this.getMessagesByRoom({
      roomId,
      page: 1,
      limit: 1,
    });
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get recent messages to calculate stats (last 1000 messages)
    const recentMessages = await this.getMessagesByRoom({
      roomId,
      page: 1,
      limit: 1000,
    });
    
    const messagesThisWeek = recentMessages.data.filter(
      message => new Date(message.createdAt) > oneWeekAgo
    ).length;
    
    const messagesThisMonth = recentMessages.data.filter(
      message => new Date(message.createdAt) > oneMonthAgo
    ).length;
    
    return {
      totalMessages: response.meta.total,
      messagesThisWeek,
      messagesThisMonth,
    };
  }

  /**
   * Bulk delete messages (for admins/moderators)
   */
  async bulkDeleteMessages(messageIds: string[]): Promise<{
    successful: string[];
    failed: { messageId: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      messageIds.map(messageId => this.deleteMessage(messageId))
    );

    const successful: string[] = [];
    const failed: { messageId: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(messageIds[index]);
      } else {
        failed.push({
          messageId: messageIds[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  }

  /**
   * Get messages with advanced filtering
   */
  async getMessagesWithFilters(roomId: string, filters: {
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
    containsText?: string;
    page?: number;
    limit?: number;
  }): Promise<MessagesPaginationResponse> {
    const params: Record<string, any> = {
      page: filters.page || 1,
      limit: filters.limit || 50,
    };

    if (filters.userId) params.userId = filters.userId;
    if (filters.fromDate) params.fromDate = filters.fromDate.toISOString();
    if (filters.toDate) params.toDate = filters.toDate.toISOString();
    if (filters.containsText) params.search = filters.containsText;

    const response = await apiClient.get<MessagesPaginationResponse>(
      `/messages/room/${roomId}`,
      params
    );
    
    return response.data!;
  }

  /**
   * Get message context (messages before and after a specific message)
   */
  async getMessageContext(
    roomId: string, 
    messageId: string, 
    contextSize: number = 10
  ): Promise<{
    before: Message[];
    target: Message | null;
    after: Message[];
  }> {
    // This would require backend support for context-based queries
    // For now, we'll simulate it by getting a larger set of messages
    const messages = await this.getRecentMessages(roomId, 1000);
    
    const targetIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (targetIndex === -1) {
      return { before: [], target: null, after: [] };
    }

    const before = messages.slice(
      Math.max(0, targetIndex - contextSize),
      targetIndex
    );
    
    const after = messages.slice(
      targetIndex + 1,
      targetIndex + 1 + contextSize
    );

    return {
      before,
      target: messages[targetIndex],
      after,
    };
  }
}

export const messagesApi = new MessagesApi();
export default messagesApi; 