import axios from "axios";

const MAIN_API_URL = "https://be-mazady.vercel.app/api/";

let CURRENT_API_URL = MAIN_API_URL;

const api = axios.create({
  baseURL: CURRENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a notification
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post("notifications/create", notificationData);
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.put("notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async () => {
  try {
    const response = await api.get("notifications/");
    return response.data;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};
