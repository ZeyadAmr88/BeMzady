import React, { useEffect, useState } from "react";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/api.js";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const getNotificationIcon = (type) => {
  switch (type) {
    case "bid":
      return <Bell size={20} className="text-blue-500" />;
    case "auction_end":
      return <CheckCircle size={20} className="text-green-500" />;
    case "message":
      return <Bell size={20} className="text-purple-500" />;
    case "SYSTEM":
      return <Bell size={20} className="text-yellow-500" />;
    default:
      return <Bell size={20} className="text-gray-500" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setNotifications(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
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
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Notifications</h1>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0} // or any condition you want
          className={`bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <CheckCheck size={16} />
          Mark all as read ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 p-8">
          <Bell size={32} className="mx-auto mb-2 animate-pulse" />
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border rounded-md">
          <Bell size={32} className="mx-auto mb-2" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {currentNotifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 rounded-md  flex items-start gap-3 ${
                  !notification.isRead
                    ? "bg-rose-50 border-rose-200"
                    : "bg-gray-700"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    <span>
                      From: {notification.sender?.username || "System"}
                    </span>
                    {notification.type && (
                      <span className="ml-2">Type: {notification.type}</span>
                    )}
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="shrink-0 text-sm bg-rose-100 hover:bg-rose-200 text-rose-600 px-3 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-full border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
