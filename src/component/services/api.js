import axios from "axios"

// Define the API base URL - updated to port 3000
const API_BASE_URL = "https://be-mazady.vercel.app/api"

// Log the base URL for debugging
console.log("API Base URL:", API_BASE_URL)

// Create the api instance with the correct base URL
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds timeout
    withCredentials: true, // Important for cookies/auth
})

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`)
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error("Request error:", error)
        return Promise.reject(error)
    },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status)
        return response
    },
    (error) => {
        if (error.code === "ERR_NETWORK") {
            console.error(
                "Network Error: Cannot connect to the API server. Please check if the backend is running on port 3000.",
            )
        } else if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token")
            localStorage.removeItem("user_id")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

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
}

export const categoryService = {
    getCategories: (params) => api.get("/categories", { params }),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    getSubcategoriesByCategory: (categoryId) => api.get(`/categories/${categoryId}/Subcategories`),
    getCategoryWithAuctions: (id) => api.get(`/categories/${id}/auctions`),
}

export const subcategoryService = {
    // Public endpoints
    getSubcategories: (params) => api.get("/subcategories", { params }),
    getSubcategoryById: (id) => api.get(`/subcategories/${id}`),
    getSubcategoriesByCategory: (categoryId) => api.get(`/subcategories/category/${categoryId}`),

    // Admin-only endpoints (protected)
    createSubcategory: (data) => api.post("/subcategories", data, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }),
    updateSubcategory: (id, data) => api.put(`/subcategories/${id}`, data, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }),
    deleteSubcategory: (id) => api.delete(`/subcategories/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
}

export const itemService = {
    getItems: (params) => api.get("/items", { params }),
    getItemById: (id) => api.get(`/items/${id}`),
    createItem: (formData) =>
        api.post("/items", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            timeout: 60000, // Increase timeout to 60 seconds for file uploads
        }),
    getItemReviews: (itemId) => api.get(`/items/${itemId}/reviews`),
    addReview: (itemId, review) => api.post(`/items/${itemId}/reviews`, review),
    updateReview: (itemId, review) => api.put(`/items/${itemId}/reviews`, review),
    deleteReview: (itemId) => api.delete(`/items/${itemId}/reviews`),
}

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
}

export const messageService = {
    getConversations: () => api.get("/messages/conversations"),
    getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
    sendMessage: (conversationId, content) => api.post(`/messages/conversations/${conversationId}`, { content }),
    createConversation: (recipientId) => api.post("/messages/conversations", { recipientId }),
    deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
}