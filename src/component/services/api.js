import axios from "axios";

// Define the API base URL - updated to port 3000
const API_BASE_URL = "https://be-mazady.vercel.app/api";

// Log the base URL for debugging
console.log("API Base URL:", API_BASE_URL);

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
            `Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url
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

export const auctionService = {
    getAuctions: () => api.get("/auctions"),
    getAuctionById: (id) => api.get(`/auctions/${id}`),
    placeBid: (auctionId, amount) => {
        const bidderId = localStorage.getItem("user_id");
        console.log(`Placing bid: Auction ID: ${auctionId}, Bidder ID: ${bidderId}, Amount: ${amount}`);
        return api.post(`/auctions/${auctionId}/bid`, {
            bidder: bidderId,
            amount: amount
        });
    },
    buyNow: (auctionId) => {
        const buyerId = localStorage.getItem("user_id");
        console.log(`Buying auction: Auction ID: ${auctionId}, Buyer ID: ${buyerId}`);
        return api.post(`/auctions/${auctionId}/buy-now`);
    },
    endAuction: (auctionId) => api.post(`/auctions/${auctionId}/end`),
    createAuction: (formData) =>
        api.post("/auctions", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    getUserAuctions: () => api.get("/auctions/my-auctions"),
    deleteAuction: (auctionId) => api.delete(`/auctions/${auctionId}`),
}

export const bidService = {
    getUserBids: () => api.get("/bids/my-bids"),
    getBidHistory: (auctionId) => api.get(`/bids/auction/${auctionId}`),
    retractBid: (bidId) => api.delete(`/bids/${bidId}`),
};

export const categoryService = {
    getCategories: (params) => api.get("/categories", { params }),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    getSubcategoriesByCategory: (categoryId) => api.get(`/subcategories/category/${categoryId}`),
    getCategoryWithAuctions: (id) => api.get(`/categories/${id}/auctions`),
    getCategoriesWithSubcategories: () => api.get("/categories/with-subcategories"),
}

export const subcategoryService = {
    // Public endpoints
    getSubcategories: (params) => api.get("/subcategories", { params }),
    getSubcategoryById: (id) => api.get(`/subcategories/${id}`),
    getSubcategoriesByCategory: (categoryId) =>
        api.get(`/subcategories/category/${categoryId}`),

    // Admin-only endpoints (protected)
    createSubcategory: (data) =>
        api.post("/subcategories", data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }),
    updateSubcategory: (id, data) =>
        api.put(`/subcategories/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }),
    deleteSubcategory: (id) =>
        api.delete(`/subcategories/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }),
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
            timeout: 60000, // Increase timeout to 60 seconds for file uploads
        }),
    getItemReviews: (itemId) => api.get(`/items/${itemId}/reviews`),
    addReview: (itemId, review) => api.post(`/items/${itemId}/reviews`, review),
    updateReview: (itemId, review) => api.put(`/items/${itemId}/reviews`, review),
    deleteReview: (itemId) => api.delete(`/items/${itemId}/reviews`),
};

export const userService = {
    getProfile: () => api.get("/users/MyProfile"),
    getUserById: (userId) => api.get(`/users/${userId}`),
    updateProfile: (userData) =>
        api.patch(`/users/${localStorage.getItem("user_id")}`, userData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    getFavorites: () => api.get(`/users/${localStorage.getItem("user_id")}/favorites`),
    addToFavorites: (itemId) => api.post(`/users/${localStorage.getItem("user_id")}/favorites`, { itemId }),
    removeFromFavorites: (itemId) => api.delete(`/users/${localStorage.getItem("user_id")}/favorites/${itemId}`),
    updatePassword: (currentPassword, newPassword) =>
        api.patch(`/users/${localStorage.getItem("user_id")}/password`, {
            currentPassword,
            newPassword,
        }),
    updateRole: (role) =>
        api.patch(`/users/${localStorage.getItem("user_id")}/role`, {
            role,
        }),
    // New endpoints for seller dashboard
    getSellerOverview: () => api.get("/analytics/seller/overview"),
    getSellerItems: (status = "available", page = 1) => api.get(`/analytics/seller/my-items?status=${status}&page=${page}`),
    getSellerAuctions: (status = "completed", page = 1, limit = 5) => api.get(`/analytics/seller/my-auctions?status=${status}&page=${page}&limit=${limit}`),
}

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
        // Ensure quantity is a valid number
        const validQuantity = parseInt(quantity) || 1;
        return api.post("/cart/add", {
            itemId,
            quantity: validQuantity
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

        // Use the API base URL but with complete configuration
        return api.get("/cart/checkout", {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
    }
}

export const messageService = {
    getConversations: () => {
        return api
            .get("/messages/conversations")
            .then((response) => {
                console.log("Original getConversations response:", response);
                // If the response doesn't have the expected structure, normalize it
                if (!response.data || !response.data.data) {
                    // Handle case where data is directly in response.data
                    if (response.data && !Array.isArray(response.data)) {
                        const firstId = Object.keys(response.data)[0];
                        if (
                            firstId &&
                            response.data[firstId] &&
                            response.data[firstId].participants
                        ) {
                            // Convert object of conversations to array
                            const conversations = Object.entries(response.data).map(
                                ([id, conv]) => ({
                                    _id: id,
                                    ...conv,
                                })
                            );
                            return { data: { data: conversations } };
                        }
                    }

                    // If data is already an array, wrap it
                    if (Array.isArray(response.data)) {
                        return { data: { data: response.data } };
                    }
                }
                return response;
            })
            .catch((error) => {
                console.error("Error in getConversations:", error);
                // Return empty array for consistent handling
                return { data: { data: [] } };
            });
    },

    sendMessage: (recipientId, content) => {
        if (!recipientId || !content) {
            console.error("Missing recipientId or content.");
            return Promise.reject(new Error("Both recipientId and content are required."));
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
        // Keep only the working approach based on user feedback
        return api
            .post("/messages/conversations", {
                recipientId,
                userId: recipientId, // Include both variations to increase success chance
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
                // Handle possible response formats
                const count =
                    response?.data?.data?.count ||
                    response?.data?.count ||
                    (typeof response?.data === "number" ? response.data : 0);

                // Normalize the response for consistent use in components
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
        // Try to get user details from the API
        return api.get(`/users/${userId}`).catch((error) => {
            console.error("Error fetching user by ID:", error.response?.data);
            // Try alternative endpoint if first one fails
            if (error.response?.status === 404) {
                return api.get(`/users/profile/${userId}`);
            }
            return Promise.reject(error);
        });
    },
};

export const recommendationService = {
    getRecommendationsByItem: (itemId) => api.get(`/recommendations/${itemId}`),
    getRecommendationsByCategory: (categoryId) => api.get(`/recommendations/${categoryId}`),
    getRecommendationsWithFilters: (filters) => api.get('/recommendations', { params: filters })
};
