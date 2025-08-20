import React, { useEffect, useState } from 'react';
import { BellIcon, CogIcon, UserIcon } from '@heroicons/react/outline'; // Import the UserIcon for the avatar
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showAll, setShowAll] = useState(false); // State to manage "View all" behavior
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`http://localhost:5044/api/notification/${userId}`);
          const notificationsData = response.data;
          setNotifications(notificationsData);

          const unreadExists = notificationsData.some(n => !n.isRead);
          setHasUnread(unreadExists);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleBellClick = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await axios.put(`http://localhost:5044/api/notification/markAsRead/${userId}`);
        setHasUnread(false);
      }
      setDropdownVisible(prev => !prev); // Toggle dropdown visibility
      if (dropdownVisible) {
        // Reset to showing top 5 notifications when dropdown is closed
        setShowAll(false);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleViewAllClick = () => {
    setShowAll(true); // Show all notifications
  };

  const handleNotificationClick = (ticketId) => {
    navigate(`/ticket/${ticketId}`); // Navigate to the ticket page with ticketId
    setDropdownVisible(false); // Close the dropdown
  };

  return (
    <header className="header px-4 sm:px-6 h-16 bg-white rounded-none xl:rounded-15 flex items-center mb-4 xl:m-4 group-data-[sidebar-size=lg]:xl:ml-[calc(theme('spacing.app-menu')_+_32px)] group-data-[sidebar-size=sm]:xl:ml-[calc(theme('spacing.app-menu-sm')_+_32px)] ac-transition">
      <div className="flex items-center justify-between grow">
        {/* Header Left */}
        <div className="flex items-center gap-4">
          {/* ...existing header left content... */}
        </div>
        {/* Header Right */}
        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            data-drawer-target="app-setting-drawer"
            data-drawer-show="app-setting-drawer"
            data-drawer-placement="right"
            aria-controls="app-setting-drawer"
          >
            <CogIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>
          {/* Notification Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleBellClick}
              className="relative flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <BellIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            {/* Dropdown menu */}
            {dropdownVisible && (
              <div
                id="dropdownNotification"
                className={`absolute right-0 z-50 w-80 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-800 dark:divide-gray-700 ${showAll ? 'max-h-80 overflow-y-auto' : 'max-h-64 overflow-y-auto'}`}
              >
                <div className="px-4 py-2 font-medium text-center text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                  Notifications
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, showAll ? notifications.length : 5).map((notification) => (
                        <a
                          href="#"
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.ticketId)} // Add onClick handler
                          className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full">
                              <UserIcon className="w-5 h-5 text-white" /> {/* Avatar icon with red background */}
                            </div>
                          </div>
                          <div className="w-full ps-3">
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1.5">
                              {notification.message}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </a>
                      ))}
                      {!showAll && notifications.length > 5 && (
                        <button
                          type="button"
                          onClick={handleViewAllClick}
                          className="w-full px-4 py-2 text-sm font-medium text-center text-gray-900 dark:text-gray-100 rounded-b-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          View all
                        </button>
                      )}
                      {showAll && notifications.length === 0 && (
                        <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                          No more notifications
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
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
