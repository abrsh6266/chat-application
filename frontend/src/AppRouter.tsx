import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { RoomListPage } from "./pages/RoomListPage";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { AppLayout } from "./layouts/AppLayout";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/rooms"
        element={
          <AppLayout>
            <RoomListPage />
          </AppLayout>
        }
      />
      <Route
        path="/rooms/:roomId"
        element={
          <AppLayout>
            <ChatRoomPage />
          </AppLayout>
        }
      />

      <Route path="/" element={<Navigate to="/rooms" replace />} />

      <Route path="*" element={<Navigate to="/rooms" replace />} />
    </Routes>
  );
};
