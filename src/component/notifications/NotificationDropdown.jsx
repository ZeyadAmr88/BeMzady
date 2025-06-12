"use client";

import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationContext } from "../contexts/NotificationContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, CheckCheck } from "lucide-react";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/api";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getUserNotifications();
        const notificationsData = response;
        setNotifications(
          Array.isArray(notificationsData) ? notificationsData : []
        );
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

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div
      className={`absolute right-0 mt-2 w-96 rounded-xl shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } ring-1 ring-black ring-opacity-5 z-50 max-h-[32rem] overflow-hidden flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-bounce mb-3">
              <Bell size={24} className="mx-auto text-rose-500" />
            </div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <Bell size={24} className="mx-auto mb-3 text-gray-400" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">
              We'll notify you when something arrives
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification._id}
                className={`px-4 py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  !notification.isRead
                    ? "bg-rose-50/50 dark:bg-rose-900/10"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm line-clamp-2 ${
                        !notification.isRead
                          ? "font-medium text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {notification.message}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs">
                      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <CheckCircle size={12} />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <Link
          to="/notifications"
          className="block w-full py-2 text-sm text-center text-rose-600 hover:text-rose-700 transition-colors font-medium"
        >
          View all notifications
        </Link>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${darkMode
            ? "rgba(156, 163, 175, 0.5)"
            : "rgba(156, 163, 175, 0.3)"};
          border-radius: 20px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${darkMode
            ? "rgba(156, 163, 175, 0.7)"
            : "rgba(156, 163, 175, 0.5)"};
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
