import React, { useState } from 'react';
import { MenuIcon, BellIcon, SearchIcon, UserIcon, XIcon, CheckIcon } from './Icons';
import { Notification } from '@/types/safety';

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  currentUser: { name: string; role: string } | null;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  searchQuery,
  onSearchChange,
  notifications,
  onNotificationRead,
  currentUser,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-gold-100 text-gold-800 border-gold-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-babyblue-100 text-babyblue-800 border-babyblue-200';
    }
  };

  return (
    <header className="bg-white border-b border-babyblue-200 sticky top-0 z-40 print-hide">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-babyblue-50 transition-colors"
          >
            <MenuIcon size={24} className="text-gray-600" />
          </button>
          
          <div className="hidden lg:flex items-center gap-3">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/69715207e860303490f3d8ab_1769043905057_b034ee0f.png" 
              alt="Kaiser Logo" 
              className="w-10 h-10 rounded-lg shadow-md object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-navy-900">Kaiser</h1>
              <p className="text-xs text-gray-500">Construction Safety</p>
            </div>
          </div>

        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, employees, or forms..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-babyblue-50 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-lg hover:bg-babyblue-50 transition-colors">
            <SearchIcon size={20} className="text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-babyblue-50 transition-colors"
            >
              <BellIcon size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-babyblue-200 overflow-hidden z-50">
                <div className="p-4 border-b border-babyblue-100 flex items-center justify-between bg-gradient-to-r from-babyblue-50 to-gold-50">
                  <h3 className="font-semibold text-navy-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-white/50 rounded"
                  >
                    <XIcon size={16} className="text-gray-500" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-50 hover:bg-babyblue-50 cursor-pointer ${
                          !notification.is_read ? 'bg-gold-50/50' : ''
                        }`}
                        onClick={() => onNotificationRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getNotificationColor(notification.type)}`}>
                            {notification.type}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-navy-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-gold-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="p-3 text-center border-t border-babyblue-100">
                    <button className="text-sm text-babyblue-600 hover:text-babyblue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-babyblue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-navy-900">{currentUser?.name || 'Guest'}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role || 'User'}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-babyblue-200 overflow-hidden z-50">
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-babyblue-50 rounded-lg transition-colors">
                    My Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-babyblue-50 rounded-lg transition-colors">
                    Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-babyblue-50 rounded-lg transition-colors">
                    Help & Support
                  </button>
                  <hr className="my-2 border-babyblue-100" />
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
