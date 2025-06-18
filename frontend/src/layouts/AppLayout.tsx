import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  LogOut,
  Users,
  Settings,
  Menu,
  X,
  Hash,
  Plus,
} from "lucide-react";
import { useAuth, useRooms } from "../hooks";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownItem,
  StatusIndicator,
  LoadingSpinner,
  IconButton,
  Badge,
} from "../components/ui";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { rooms, isLoading: roomsLoading, fetchAllRooms } = useRooms();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch rooms on component mount
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAllRooms();
    }
  }, [isAuthenticated, fetchAllRooms]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
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

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleAllRoomsClick = () => {
    navigate("/rooms");
    if (isMobile) {
      closeSidebar();
    }
  };

  const sidebarVisible = isMobile ? isSidebarOpen : true;

  // Get joined rooms for quick access
  const joinedRooms = rooms.filter((room) => room.isJoined).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 flex fixed inset-0 overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <IconButton
            icon={<Menu />}
            variant="primary"
            size="md"
            onClick={() => setIsSidebarOpen(true)}
            className="shadow-lg"
          />
        </div>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarVisible ? 0 : -320,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          ${isMobile ? "fixed" : "relative"} 
          top-0 left-0 h-full w-80 bg-white border-r border-gray-200 flex flex-col 
          ${isMobile ? "z-50 shadow-xl" : "z-auto shadow-none"}
        `}
      >
        {/* Close Button for Mobile */}
        {isMobile && (
          <div className="absolute top-4 right-4 z-10">
            <IconButton
              icon={<X />}
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
            />
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                Chat App
              </h1>
              <p className="text-sm text-gray-500 truncate">
                Real-time messaging
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar
              fallback={user?.username || ""}
              size="md"
              showOnlineStatus
              isOnline={true}
              className="flex-shrink-0"
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
          </div>
        </div>

        {/* Navigation - Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="p-4">
            <div className="space-y-2">
              {/* All Rooms Button */}
              <Button
                variant={
                  location.pathname === "/rooms" &&
                  !location.pathname.includes("/rooms/")
                    ? "primary"
                    : "ghost"
                }
                size="sm"
                fullWidth
                className="justify-start"
                onClick={handleAllRoomsClick}
              >
                <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">All Rooms</span>
                <div className="ml-auto flex items-center gap-1">
                  {rooms.length > 0 && (
                    <Badge variant="default" size="sm">
                      {rooms.length}
                    </Badge>
                  )}
                  <Plus className="h-3 w-3" />
                </div>
              </Button>
            </div>

            {/* Joined Rooms Section */}
            {joinedRooms.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined Rooms
                  </h3>
                  <Badge variant="default" size="sm">
                    {joinedRooms.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {joinedRooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={
                        location.pathname === `/rooms/${room.id}`
                          ? "primary"
                          : "ghost"
                      }
                      size="sm"
                      fullWidth
                      className="justify-start h-auto py-2"
                      onClick={() => handleRoomClick(room.id)}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <Hash className="h-3 w-3 flex-shrink-0 text-gray-400" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium truncate">
                            {room.name}
                          </p>
                          {room.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {room.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {room._count?.users && (
                            <span className="text-xs text-gray-400">
                              {room._count.users}
                            </span>
                          )}
                          <Users className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {roomsLoading && (
              <div className="mt-6 flex items-center justify-center py-4">
                <LoadingSpinner size="sm" text="Loading rooms..." />
              </div>
            )}

            {!roomsLoading && joinedRooms.length === 0 && (
              <div className="mt-6 text-center py-6">
                <Hash className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  No joined rooms yet
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAllRoomsClick}
                >
                  Browse Rooms
                </Button>
              </div>
            )}
          </nav>
        </div>

        {/* Sign Out Button - Bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-2 w-full">
              <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
