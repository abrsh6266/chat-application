import React from "react";
import { motion } from "framer-motion";
import { Plus, Users, MessageCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "../components/ui";

export const RoomListPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Chat Rooms</h1>
        <p className="text-gray-600">Join a room to start chatting</p>
      </div>
      <div className="flex-1 p-6">
        <p className="text-gray-500">Room list will be implemented here...</p>
      </div>
    </div>
  );
};
