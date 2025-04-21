import axios from "axios"

export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
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
    placeBid: (auctionId, amount) =>
        api.post(`/auctions/${auctionId}/bid`, {
            auction: auctionId,
            bidder: localStorage.getItem("user_id"),
            amount,
        }),
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
}

export const itemService = {
    getItems: (params) => api.get("/items", { params }),
    getItemById: (id) => api.get(`/items/${id}`),
    getItemReviews: (itemId) => api.get(`/items/${itemId}/reviews`),
    addReview: (itemId, review) => api.post(`/items/${itemId}/reviews`, review),
    updateReview: (itemId, review) => api.put(`/items/${itemId}/reviews`, review),
    deleteReview: (itemId) => api.delete(`/items/${itemId}/reviews`),
}

export const userService = {
    getProfile: () => api.get("/users/MyProfile"),
    updateProfile: (userData) =>
        api.put(`/users/${localStorage.getItem("user_id")}`, userData, {
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
}

export const cartService = {
    getCart: () => api.get("/cart"),
    addToCart: (itemId, quantity) => api.post("/cart/add", { itemId, quantity }),
    removeFromCart: (itemId) => api.delete("/cart/remove", { data: { itemId } }),
    clearCart: () => api.delete("/cart/clear"),
}

export const messageService = {
    getConversations: () => api.get("/messages/conversations"),
    getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
    sendMessage: (conversationId, content) => api.post(`/messages/conversations/${conversationId}`, { content }),
    createConversation: (recipientId) => api.post("/messages/conversations", { recipientId }),
    deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
}
