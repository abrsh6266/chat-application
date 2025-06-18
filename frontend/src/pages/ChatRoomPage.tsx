import React from "react";
import { useParams } from "react-router-dom";

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Room #{roomId}</h1>
        <p className="text-gray-600">Chat room interface</p>
      </div>
      <div className="flex-1 p-6">
        <p className="text-gray-500">
          Chat interface will be implemented here...
        </p>
      </div>
    </div>
  );
};
