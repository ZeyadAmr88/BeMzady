"use client"
import React from 'react';

import { createContext, useState, useEffect, useContext } from "react"
import { api } from "../services/api"
import { AuthContext } from "./AuthContext"

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { token } = useContext(AuthContext)

    useEffect(() => {
        if (token) {
            fetchNotifications()
            fetchUnreadCount()

            // Poll for new notifications every minute
            const interval = setInterval(() => {
                fetchUnreadCount()
            }, 60000)

            return () => clearInterval(interval)
        }
    }, [token])

    const fetchNotifications = async () => {
        if (!token) return

        try {
            const response = await api.get("/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setNotifications(response.data.data)
        } catch (error) {
            console.error("Error fetching notifications:", error)
        }
    }

    const fetchUnreadCount = async () => {
        if (!token) return

        try {
            const response = await api.get("/notifications/unread-count", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setUnreadCount(response.data.count)
        } catch (error) {
            console.error("Error fetching unread count:", error)
        }
    }

    const markAsRead = async (notificationId) => {
        if (!token) return

        try {
            await api.put(
                `/notifications/read/${notificationId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            // Update local state
            setNotifications(
                notifications.map((notification) =>
                    notification._id === notificationId ? { ...notification, read: true } : notification,
                ),
            )

            fetchUnreadCount()
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        if (!token) return

        try {
            await api.put(
                "/notifications/read-all",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            // Update local state
            setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}
