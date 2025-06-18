import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Settings, Hash } from "lucide-react";
import {
  Card,
  Button,
  IconButton,
  LoadingSpinner,
  EmptyState,
  ConnectionStatus,
  Badge,
} from "../components/ui";
import { ChatInput } from "../components/ChatInput";
import { OnlineUserListItem } from "../components/OnlineUserListItem";
import { useAuth, useRooms, useMessages, useChatSocket } from "../hooks";
import { Message as MessageType } from "../types";
import { Message } from "../components/Message";

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, fetchRoomById, isLoading: roomLoading } = useRooms();
  const {
    messages: historicalMessages,
    isLoading: messagesLoading,
    fetchMessages,
  } = useMessages();
  const {
    messages: socketMessages,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    error: socketError,
  } = useChatSocket(roomId);

  const [messageInput, setMessageInput] = React.useState("");
  const [showUserList, setShowUserList] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Merge historical and socket messages, removing duplicates
  const messages = React.useMemo(() => {
    const allMessages = [...historicalMessages, ...socketMessages];
    const uniqueMessages = allMessages.filter(
      (message, index, array) =>
        array.findIndex((m) => m.id === message.id) === index
    );

    // Sort by creation date to ensure proper order
    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [historicalMessages, socketMessages]);

  // Load room and messages
  React.useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
      fetchMessages(roomId, 1, 50);
    }
  }, [roomId, fetchRoomById, fetchMessages]);

  // Join room via socket
  React.useEffect(() => {
    if (roomId && isConnected) {
      joinRoom(roomId);
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected, joinRoom, leaveRoom]);

  // Add current user to online users when connected and in room
  const enhancedOnlineUsers = React.useMemo(() => {
    if (!user || !roomId || !isConnected) return onlineUsers;

    // Check if current user is already in the list
    const currentUserExists = onlineUsers.some(
      (onlineUser) => onlineUser.id === user.id
    );

    if (currentUserExists) {
      return onlineUsers;
    }

    // Add current user to the list
    return [
      {
        id: user.id,
        username: user.username,
        roomId: roomId,
      },
      ...onlineUsers,
    ];
  }, [onlineUsers, user, roomId, isConnected]);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleLeaveRoom = () => {
    if (roomId) {
      leaveRoom(roomId);
    }
    navigate("/rooms");
  };

  const groupMessages = (messages: MessageType[]) => {
    const grouped: Array<{
      messages: MessageType[];
      user: any;
      timestamp: string;
    }> = [];
    let currentGroup: MessageType[] = [];
    let currentUserId: string | null = null;
    let currentTime: string | null = null;

    messages.forEach((message) => {
      const messageTime = new Date(message.createdAt).toDateString();

      if (message.userId !== currentUserId || messageTime !== currentTime) {
        if (currentGroup.length > 0) {
          grouped.push({
            messages: currentGroup,
            user: currentGroup[0].user,
            timestamp: currentTime!,
          });
        }
        currentGroup = [message];
        currentUserId = message.userId;
        currentTime = messageTime;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      grouped.push({
        messages: currentGroup,
        user: currentGroup[0].user,
        timestamp: currentTime!,
      });
    }

    return grouped;
  };

  const messageGroups = React.useMemo(
    () => groupMessages(messages),
    [messages]
  );

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          title="Room not found"
          description="The room you're looking for doesn't exist"
          action={
            <Button onClick={() => navigate("/rooms")}>Back to Rooms</Button>
          }
        />
      </div>
    );
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading room..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconButton
                icon={<ArrowLeft />}
                variant="ghost"
                onClick={handleLeaveRoom}
              />

              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {currentRoom?.name || "Unknown Room"}
                  </h1>
                  {currentRoom?.description && (
                    <p className="text-sm text-gray-500">
                      {currentRoom.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ConnectionStatus isConnected={isConnected} />
                {!isConnected && (
                  <span className="text-xs text-red-500">
                    {socketError ? "Connection Error" : "Connecting..."}
                  </span>
                )}
                {isConnected && enhancedOnlineUsers.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {enhancedOnlineUsers.length} online
                  </span>
                )}
              </div>

              <IconButton
                icon={<Users />}
                variant="ghost"
                onClick={() => setShowUserList(!showUserList)}
              />
            </div>
          </div>

          {/* Error Banner */}
          {socketError && socketError !== "Authentication required" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{socketError}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Loading messages..." />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Start the conversation by sending the first message"
            />
          ) : (
            <div className="py-4">
              <AnimatePresence>
                {messageGroups.map((group, groupIndex) => (
                  <motion.div
                    key={groupIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-4"
                  >
                    {group.messages.map((message, messageIndex) => (
                      <Message
                        key={message.id}
                        message={message}
                        isOwn={message.userId === user?.id}
                        showUser={messageIndex === 0}
                      />
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" />
                      <div
                        className="h-1 w-1 bg-primary-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-1 w-1 bg-primary-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span>
                      {typingUsers.length === 1
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          value={messageInput}
          onChange={setMessageInput}
          onSend={handleSendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={!isConnected}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
        />
      </div>

      {/* User List Sidebar */}
      <AnimatePresence>
        {showUserList && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-80 bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Online Users
                </h2>
                <Badge variant="primary" size="sm">
                  {enhancedOnlineUsers.length}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {enhancedOnlineUsers.map((user) => (
                  <OnlineUserListItem
                    key={user.id}
                    user={user}
                    isTyping={typingUsers.some(
                      (typing) => typing.id === user.id
                    )}
                  />
                ))}
              </div>

              {enhancedOnlineUsers.length === 0 && (
                <EmptyState
                  title="No one online"
                  description="Be the first to join this room"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
