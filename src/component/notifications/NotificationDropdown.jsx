"use client";

import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationContext } from "../contexts/NotificationContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle } from "lucide-react";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/api";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "bid":
        return <Bell size={16} className="text-blue-500" />;
      case "auction_end":
        return <CheckCircle size={16} className="text-green-500" />;
      case "message":
        return <Bell size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"
        } ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {notifications.some((notification) => !notification.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-rose-600 hover:text-rose-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="py-2">
        {loading ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <Bell size={24} className="mx-auto mb-2" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            <Bell size={24} className="mx-auto mb-2" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification._id}
              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.read ? "bg-rose-50 dark:bg-gray-700" : ""
                }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">
                    {notification.message}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
        <Link
          to="/notifications"
          className="block w-full py-2 text-sm text-rose-600 hover:text-rose-700 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
