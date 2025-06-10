import axios from "axios";

// Define the API base URL - updated to port 3000
const API_BASE_URL = "https://be-mazady.vercel.app/api";

// Create the api instance with the correct base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for cookies/auth
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error(
        "Network Error: Cannot connect to the API server. Please check if the backend is running on port 3000."
      );
    } else if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// // Export all services as a single object
// export const services = {
//   auction: auctionService,
//   bid: bidService,
//   category: categoryService,
//   subcategory: subcategoryService,
//   item: itemService,
//   user: userService,
//   cart: cartService,
//   message: messageService,
//   recommendation: recommendationService,
//   notification: {
//     create: createNotification,
//     markAsRead,
//     markAllAsRead,
//     getUnreadCount,
//     getUserNotifications
//   }
// };

// Individual service exports
export const auctionService = {
  getAuctions: (params) => api.get("/auctions", { params }),
  getAuctionById: (id) => api.get(`/auctions/${id}`),
  placeBid: (auctionId, amount) => {
    const bidderId = localStorage.getItem("user_id");
    console.log(
      `Placing bid: Auction ID: ${auctionId}, Bidder ID: ${bidderId}, Amount: ${amount}`
    );
    return api.post(`/auctions/${auctionId}/bid`, {
      bidder: bidderId,
      amount: amount,
    });
  },
  buyNow: (auctionId) => {
    const buyerId = localStorage.getItem("user_id");
    console.log(
      `Buying auction: Auction ID: ${auctionId}, Buyer ID: ${buyerId}`
    );
    return api.post(`/auctions/${auctionId}/buy-now`);
  },
  endAuction: (auctionId) => api.post(`/auctions/${auctionId}/end`),
  createAuction: (formData) =>
    (async (formData) => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("User ID not found in localStorage.");
          return Promise.reject(new Error("User not authenticated"));
        }

        const userResponse = await userService.getUserById(userId);
        const user = userResponse.data.data || userResponse.data;
        const isAdmin = user && user.role === "admin";

        const dataToSend = new FormData();

        for (const pair of formData.entries()) {
          const [key, value] = pair;
          if (!(isAdmin && key === "seller || admin")) {
            dataToSend.append(key, value);
          }
        }

        return api.post("/auctions", dataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Error creating auction:", error);
        return Promise.reject(error);
      }
    })(formData),
  getUserAuctions: () => api.get("/auctions/my-auctions"),
  deleteAuction: (auctionId) => api.delete(`/auctions/${auctionId}`),
  updateAuction: (auctionId, formData) =>
    api.put(`/auctions/${auctionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
};

export const bidService = {
  getUserBids: () => api.get("/bids/my-bids"),
  getBidHistory: (auctionId) => api.get(`/bids/auction/${auctionId}`),
  retractBid: (bidId) => api.delete(`/bids/${bidId}`),
};

export const categoryService = {
  getCategories: (params) => api.get("/categories", { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  getSubcategoriesByCategory: (categoryId) =>
    api.get(`/subcategories/category/${categoryId}`),
  getCategoryWithAuctions: (id) => api.get(`/categories/${id}/auctions`),
  getCategoriesWithSubcategories: () =>
    api.get("/categories/with-subcategories"),
  createCategory: async (formData) => {
    try {
      const response = await api.post("categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },
  updateCategory: async (categoryId, formData) => {
    try {
      const response = await api.put(`categories/${categoryId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export const subcategoryService = {
  getSubcategories: (params) => api.get("/subcategories", { params }),
  getSubcategoryById: (id) => api.get(`/subcategories/${id}`),
  getSubcategoriesByCategory: (categoryId) =>
    api.get(`/subcategories/category/${categoryId}`),
  createSubcategory: async (subcategoryData) => {
    try {
      const response = await api.post("subcategories", subcategoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },
  updateSubcategory: async (subcategoryId, updatedSubcategoryData) => {
    try {
      const response = await api.put(
        `subcategories/${subcategoryId}`,
        updatedSubcategoryData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating subcategory ${subcategoryId}:`, error);
      throw error;
    }
  },
  deleteSubcategory: async (subcategoryId) => {
    try {
      const response = await api.delete(`subcategories/${subcategoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subcategory ${subcategoryId}:`, error);
      throw error;
    }
  },
};

export const itemService = {
  getItems: (params) => api.get("/items", { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (formData) =>
    api.post("/items", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      timeout: 60000,
    }),
  getItemReviews: (itemId) => api.get(`/items/${itemId}/reviews`),
  addReview: (itemId, review) => api.post(`/items/${itemId}/reviews`, review),
  updateReview: (itemId, review) => api.put(`/items/${itemId}/reviews`, review),
  deleteReview: (itemId) => api.delete(`/items/${itemId}/reviews`),
  updateItem: async (itemId, data) => {
    try {
      const response = await api.put(`/items/${itemId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  },
  deleteItem: async (itemId) => {
    try {
      const response = await api.delete(`/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  },
};

export const userService = {
  getProfile: () => api.get("/users/MyProfile"),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateProfile: async (userId, formData) => {
    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  },
  getFavorites: () =>
    api.get(`/users/${localStorage.getItem("user_id")}/favorites`),
  addToFavorites: (itemId) =>
    api.post(`/users/${localStorage.getItem("user_id")}/favorites`, { itemId }),
  removeFromFavorites: (itemId) =>
    api.delete(`/users/${localStorage.getItem("user_id")}/favorites/${itemId}`),
  updatePassword: (currentPassword, newPassword) =>
    api.patch(`/users/${localStorage.getItem("user_id")}/password`, {
      currentPassword,
      newPassword,
    }),
  updateRole: (role) =>
    api.patch(`/users/${localStorage.getItem("user_id")}/role`, { role }),
  getSellerOverview: () => api.get("/analytics/seller/overview"),
  getSellerItems: (status = "available", page = 1) =>
    api.get(`/analytics/seller/my-items?status=${status}&page=${page}`),
  getSellerAuctions: (status = "completed", page = 1, limit = 5) =>
    api.get(
      `/analytics/seller/my-auctions?status=${status}&page=${page}&limit=${limit}`
    ),
  getAllUsers: async (params) => {
    try {
      const response = await api.get("users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  getOneUser: async (userId) => {
    try {
      const response = await api.get(`users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },
  checkUsername: async (username) => {
    const response = await api.get(`/users/check-username/${username}`);
    return response;
  },
};

export const cartService = {
  getCart: () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return Promise.reject(new Error("User not authenticated"));
    }
    return api.get("/cart");
  },
  addToCart: (itemId, quantity) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return Promise.reject(new Error("User not authenticated"));
    }
    const validQuantity = parseInt(quantity) || 1;
    return api.post("/cart/add", {
      itemId,
      quantity: validQuantity,
    });
  },
  removeFromCart: (itemId) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return Promise.reject(new Error("User not authenticated"));
    }
    return api.delete("/cart/remove", { data: { itemId } });
  },
  clearCart: () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return Promise.reject(new Error("User not authenticated"));
    }
    return api.delete("/cart/clear");
  },
  checkout: () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return Promise.reject(new Error("User not authenticated"));
    }
    return api.get("/cart/checkout", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  },
};

export const messageService = {
  getConversations: () => {
    return api
      .get("/messages/conversations")
      .then((response) => {
        console.log("Original getConversations response:", response);
        if (!response.data || !response.data.data) {
          if (response.data && !Array.isArray(response.data)) {
            const firstId = Object.keys(response.data)[0];
            if (
              firstId &&
              response.data[firstId] &&
              response.data[firstId].participants
            ) {
              const conversations = Object.entries(response.data).map(
                ([id, conv]) => ({
                  _id: id,
                  ...conv,
                })
              );
              return { data: { data: conversations } };
            }
          }
          if (Array.isArray(response.data)) {
            return { data: { data: response.data } };
          }
        }
        return response;
      })
      .catch((error) => {
        console.error("Error in getConversations:", error);
        return { data: { data: [] } };
      });
  },
  getMessages: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (recipientId, content) => {
    if (!recipientId || !content) {
      console.error("Missing recipientId or content.");
      return Promise.reject(
        new Error("Both recipientId and content are required.")
      );
    }

    const payload = {
      recipientId: recipientId,
      content: content,
    };

    console.log("Sending message to:", recipientId);
    console.log("Message payload:", payload);

    return api
      .post("/messages/", payload)
      .then((response) => {
        console.log("✅ Message sent successfully:", response.data);
        return response;
      })
      .catch((error) => {
        const errData = error.response?.data || error.message;
        console.error("❌ Error sending message:", errData);
        return Promise.reject(error);
      });
  },
  createConversation: (recipientId) => {
    console.log("Creating conversation with:", recipientId);
    return api
      .post("/messages/conversations", {
        recipientId,
        userId: recipientId,
      })
      .then((response) => {
        console.log("Conversation created successfully:", response);
        return response;
      })
      .catch((error) => {
        console.error("Error creating conversation:", error.response?.data);
        return Promise.reject(error);
      });
  },
  deleteConversation: (conversationId) =>
    api.delete(`/messages/conversations/${conversationId}`),
  markAsRead: (messageId) =>
    api.put(`/messages/conversations/read/${messageId}`),
  getUnreadCount: () => {
    try {
      return api.get("/messages/unread-count").then((response) => {
        const count =
          response?.data?.data?.count ||
          response?.data?.count ||
          (typeof response?.data === "number" ? response.data : 0);

        return {
          data: {
            data: { count },
          },
        };
      });
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return Promise.resolve({ data: { data: { count: 0 } } });
    }
  },
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  getUserById: (userId) => {
    return api.get(`/users/${userId}`).catch((error) => {
      console.error("Error fetching user by ID:", error.response?.data);
      if (error.response?.status === 404) {
        return api.get(`/users/profile/${userId}`);
      }
      return Promise.reject(error);
    });
  },
};

export const recommendationService = {
  getRecommendationsByItem: (itemId) => api.get(`/recommendations/${itemId}`),
  getRecommendationsByCategory: (categoryId) =>
    api.get(`/recommendations/${categoryId}`),
  getRecommendationsWithFilters: (filters) =>
    api.get("/recommendations", { params: filters }),
};

// Notification APIs
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post("notifications/create", notificationData);
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.put("notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

export const getUserNotifications = async () => {
  try {
    const response = await api.get("notifications/");
    return response.data;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};
