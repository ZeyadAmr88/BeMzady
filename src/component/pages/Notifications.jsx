
import React, { useEffect, useState } from "react"
import { getUserNotifications, markAsRead, markAllAsRead } from "../services/api.js"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  CheckCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Gavel,
  ShoppingCart,
} from "lucide-react"

const getNotificationIcon = (type) => {
  switch (type) {
    case "bid":
      return <Bell size={20} className="text-blue-500" />
    case "auction_end":
      return <CheckCircle size={20} className="text-green-500" />
    case "message":
      return <Bell size={20} className="text-purple-500" />
    case "SYSTEM":
      return <Bell size={20} className="text-yellow-500" />
    default:
      return <Bell size={20} className="text-gray-500" />
  }
}

// Helper function to detect link type and return appropriate button config
const getLinkButtonConfig = (url) => {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes("stripe.com") || lowerUrl.includes("checkout")) {
    return {
      label: "Complete Payment",
      icon: <CreditCard size={16} />,
      className: "bg-rose-100 hover:bg-rose-200 text-rose-700",
    }
  }

  if (lowerUrl.includes("auction") || lowerUrl.includes("bid")) {
    return {
      label: "View Auction",
      icon: <Gavel size={16} />,
      className: "bg-rose-100 hover:bg-rose-200 text-rose-700",
    }
  }

  if (lowerUrl.includes("order") || lowerUrl.includes("purchase")) {
    return {
      label: "View Order",
      icon: <ShoppingCart size={16} />,
      className: "bg-rose-100 hover:bg-rose-200 text-rose-700",
    }
  }

  return {
    label: "Open Link",
    icon: <ExternalLink size={16} />,
    className: "bg-rose-100 hover:bg-rose-200 text-rose-700",
  }
}

// Helper function to extract and process message with links
const processMessageWithLinks = (message) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = message.match(urlRegex) || []

  // Remove URLs from the message text
  const cleanMessage = message.replace(urlRegex, "").trim()

  // Clean up any extra spaces or colons left behind
  const finalMessage = cleanMessage.replace(/:\s*$/, "").replace(/\s+/g, " ").trim()

  return {
    cleanMessage: finalMessage,
    urls: urls,
  }
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getUserNotifications()
      setNotifications(data)
      setTotalPages(Math.ceil(data.length / itemsPerPage))
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleLinkClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentNotifications = notifications.slice(indexOfFirstItem, indexOfLastItem)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 p-12">
            <div className="animate-bounce mb-4">
              <Bell size={40} className="mx-auto text-rose-500" />
            </div>
            <p className="text-lg">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 p-12">
            <Bell size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-2">We'll notify you when something arrives</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentNotifications.map((notification) => {
                const { cleanMessage, urls } = processMessageWithLinks(notification.message)

                return (
                  <li
                    key={notification._id}
                    className={`p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !notification.isRead ? "bg-rose-50/50 dark:bg-rose-900/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium leading-relaxed break-words ${
                            !notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {cleanMessage}
                        </div>

                        {/* Action buttons for links */}
                        {urls.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {urls.map((url, index) => {
                              const buttonConfig = getLinkButtonConfig(url)
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleLinkClick(url)}
                                  className={`${buttonConfig.className} px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-sm`}
                                >
                                  {buttonConfig.icon}
                                  {buttonConfig.label}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">
                            From: {notification.sender?.username || "System"}
                          </span>
                          {notification.type && (
                            <span className="text-gray-400 dark:text-gray-500">Type: {notification.type}</span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="shrink-0 text-sm bg-rose-100 hover:bg-rose-200 text-rose-600 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-sm"
                        >
                          <CheckCircle size={14} />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Notifications
