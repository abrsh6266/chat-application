import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  SearchInput,
  LoadingSpinner,
  EmptyState,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  IconButton,
} from "../components/ui";
import { RoomListItem } from "../components/RoomListItem";
import { useRooms } from "../hooks";
import { CreateRoomRequest } from "../types";

export const RoomListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    rooms,
    isLoading,
    error,
    fetchAllRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    searchRooms,
    clearError,
    refetchRooms,
  } = useRooms();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [joiningRoomId, setJoiningRoomId] = React.useState<string | null>(null);
  const [leavingRoomId, setLeavingRoomId] = React.useState<string | null>(null);

  const [createForm, setCreateForm] = React.useState({
    name: "",
    description: "",
  });

  React.useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchRooms(searchQuery);
      } else {
        fetchAllRooms();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchRooms, fetchAllRooms]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      setJoiningRoomId(roomId);
      await joinRoom(roomId);
      await refetchRooms();
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      setLeavingRoomId(roomId);
      await leaveRoom(roomId);
      await refetchRooms();
    } catch (error) {
      console.error("Failed to leave room:", error);
    } finally {
      setLeavingRoomId(null);
    }
  };

  const handleCreateRoom = async () => {
    if (!createForm.name.trim()) return;

    try {
      setIsCreating(true);
      const roomData: CreateRoomRequest = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
      };

      const newRoom = await createRoom(roomData);
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", description: "" });

      await refetchRooms();

      setTimeout(() => {
        navigate(`/rooms/${newRoom.id}`);
      }, 100);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const filteredRooms = React.useMemo(() => {
    return rooms
      .filter((room) => {
        // First filter: Exclude rooms with no users
        const hasUsers =
          (room._count?.users || 0) > 0 ||
          (room.users && room.users.length > 0);
        if (!hasUsers) return false;

        // Second filter: Apply search criteria
        if (!searchQuery.trim()) return true;

        const searchLower = searchQuery.toLowerCase();
        const nameMatch = room.name.toLowerCase().includes(searchLower);
        const descriptionMatch =
          room.description &&
          room.description.toLowerCase().includes(searchLower);

        return nameMatch || descriptionMatch;
      })
      .sort((a, b) => {
        // Sort joined rooms first, then by creation date (newest first)
        if (a.isJoined && !b.isJoined) return -1;
        if (!a.isJoined && b.isJoined) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [rooms, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat Rooms</h1>
              <p className="text-gray-600">
                Join conversations and connect with others
              </p>
            </div>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Room
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder="Search rooms..."
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
                <Button size="sm" variant="ghost" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading rooms..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRooms.length === 0 && !searchQuery && (
          <EmptyState
            icon={<Users />}
            title="No rooms available"
            description="Create the first room to start chatting with others"
            action={
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Room
              </Button>
            }
          />
        )}

        {/* Search Results Empty */}
        {!isLoading && filteredRooms.length === 0 && searchQuery && (
          <EmptyState
            icon={<Search />}
            title="No rooms found"
            description={`No rooms match "${searchQuery}"`}
            action={
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        )}

        {/* Rooms List */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  room={room}
                  onJoin={handleJoinRoom}
                  onLeave={handleLeaveRoom}
                  isJoining={joiningRoomId === room.id}
                  isLeaving={leavingRoomId === room.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Create Room Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          size="md"
        >
          <ModalHeader>
            <ModalTitle>Create New Room</ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <Input
              label="Room Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter room name"
              required
              fullWidth
            />

            <Textarea
              label="Description (optional)"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this room is about"
              rows={3}
              fullWidth
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              isLoading={isCreating}
              disabled={!createForm.name.trim() || isCreating}
            >
              Create Room
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};
