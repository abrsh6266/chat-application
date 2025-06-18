export { apiClient } from './client';

export { authApi, AuthApi } from './auth';
export { roomsApi, RoomsApi } from './rooms';
export { messagesApi, MessagesApi } from './messages';

export type { GetMessagesParams, MessagesPaginationResponse } from './messages';

import { apiClient } from './client';
import { authApi } from './auth';
import { roomsApi } from './rooms';
import { messagesApi } from './messages';

export const api = {
  auth: authApi,
  rooms: roomsApi,
  messages: messagesApi,
  client: apiClient,
};

export default api; 