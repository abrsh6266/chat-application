import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, LogOut, Users, Settings } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Avatar, Dropdown, DropdownItem, StatusIndicator, LoadingSpinner } from '../components/ui';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-70 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat App</h1>
              <p className="text-sm text-gray-500">Real-time messaging</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar
              fallback={user?.username || ''}
              size="md"
              showOnlineStatus
              isOnline={true}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.username}
              </p>
              <div className="flex items-center gap-1">
                <StatusIndicator status="online" size="sm" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm" className="p-1">
                  <Settings className="h-4 w-4" />
                </Button>
              }
              align="right"
            >
              <DropdownItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={location.pathname === '/rooms' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              className="justify-start"
              onClick={() => window.location.href = '/rooms'}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Rooms
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="justify-start"
              disabled
            >
              <Users className="h-4 w-4 mr-2" />
              Direct Messages
              <span className="ml-auto text-xs text-gray-400">Soon</span>
            </Button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Built with ❤️ using React & NestJS
          </p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}; 