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

// === Category APIs ===
export const getCategories = async (params) => {
  try {
    // GET All Categories API: /api/categories
    const response = await api.get("categories", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (formData) => {
  try {
    // POST Create Category API: /api/categories
    // Use FormData for file upload
    const response = await api.post("categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, formData) => {
  try {
    // PUT update category by id API: /api/categories/{category_id}
    // Use FormData for file upload
    const response = await api.put(`categories/${categoryId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // DEL delete category by id API: /api/categories/{category_id}
    const response = await api.delete(`categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// === Subcategory APIs ===
export const getSubcategoriesByCategory = async (categoryId) => {
  try {
    // GET a list of subcategories for a category API: /api/subcategories/category/:categoryId
    const response = await api.get(`subcategories/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching subcategories for category ${categoryId}:`,
      error
    );
    throw error;
  }
};

export const getSubcategoryById = async (subcategoryId) => {
  try {
    // GET subcategory by id API: /api/subcategories/:subcategoryId
    const response = await api.get(`subcategories/${subcategoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subcategory ${subcategoryId}:`, error);
    throw error;
  }
};

export const createSubcategory = async (subcategoryData) => {
  try {
    // POST Create Subcategory API: /api/subcategories
    const response = await api.post("subcategories", subcategoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating subcategory:", error);
    throw error;
  }
};

export const updateSubcategory = async (
  subcategoryId,
  updatedSubcategoryData
) => {
  try {
    // PUT update subcategory API: /api/subcategories/:subcategoryId
    const response = await api.put(
      `subcategories/${subcategoryId}`,
      updatedSubcategoryData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating subcategory ${subcategoryId}:`, error);
    throw error;
  }
};

export const deleteSubcategory = async (subcategoryId) => {
  try {
    // DEL delete subcategory API: /api/subcategories/:subcategoryId
    const response = await api.delete(`subcategories/${subcategoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting subcategory ${subcategoryId}:`, error);
    throw error;
  }
};

// === User APIs ===
export const getAllUsers = async (params) => {
  try {
    // GET All users API: /api/users
    const response = await api.get("users", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getOneUser = async (userId) => {
  try {
    // GET one user API: /api/users/{user_id}
    const response = await api.get(`users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    // PUT update user API: /api/users/{user_id}
    const response = await api.put(`users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    // DEL delete user API: /api/users/{user_id}
    const response = await api.delete(`users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};
