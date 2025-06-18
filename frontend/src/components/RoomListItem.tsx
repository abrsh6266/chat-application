import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Users, Hash } from 'lucide-react';
import { Card, Avatar, Badge, Button } from './ui';
import { Room } from '../types';

interface RoomListItemProps {
  room: Room;
  onJoin: (roomId: string) => void;
  onLeave: (roomId: string) => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  className?: string;
}

export const RoomListItem: React.FC<RoomListItemProps> = ({
  room,
  onJoin,
  onLeave,
  isJoining = false,
  isLeaving = false,
  className,
}) => {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (room.isJoined) {
      onLeave(room.id);
    } else {
      onJoin(room.id);
    }
  };

  const handleCardClick = () => {
    // Only navigate if user is already joined
    if (room.isJoined) {
      navigate(`/rooms/${room.id}`);
    }
  };

  const memberCount = room._count?.users || 0;
  const recentMessagesCount = room._count?.messages || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className={clsx(
          'hover:shadow-md transition-shadow group relative',
          room.isJoined && 'cursor-pointer'
        )}
        onClick={room.isJoined ? handleCardClick : undefined}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Room Icon */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Hash className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            {/* Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {room.name}
                </h3>
                {room.isJoined && (
                  <Badge variant="success" size="sm">
                    Joined
                  </Badge>
                )}
              </div>
              
              {room.description && (
                <p className="text-xs text-gray-500 truncate mb-2">
                  {room.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                </div>
                
                {recentMessagesCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{recentMessagesCount} messages</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 ml-3">
            <Button
              size="sm"
              variant={room.isJoined ? 'outline' : 'primary'}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking button
                handleAction();
              }}
              isLoading={isJoining || isLeaving}
              disabled={isJoining || isLeaving}
            >
              {isJoining ? 'Joining...' : isLeaving ? 'Leaving...' : room.isJoined ? 'Leave' : 'Join'}
            </Button>
          </div>
        </div>

        {/* Recent Users Preview */}
        {room.users && room.users.length > 0 && (
          <div className="px-4 pb-3 border-t border-gray-100">
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-medium text-gray-500">Recent members</span>
              <div className="flex -space-x-2">
                {room.users.slice(0, 4).map((user) => (
                  <Avatar
                    key={user.id}
                    fallback={user.username}
                    size="xs"
                    className="ring-2 ring-white"
                  />
                ))}
                {room.users.length > 4 && (
                  <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                    +{room.users.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Click hint for joined rooms */}
        {room.isJoined && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-sm text-primary-600 bg-primary-50/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-primary-200">
              💬 Click to enter chat
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}; 