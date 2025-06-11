"use client"

import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { userService } from "../services/api"
import { Package, Gavel, DollarSign, TrendingUp, AlertCircle, Star, Tag, Calendar, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { AuthContext } from "../contexts/AuthContext"
import { categoryService } from "../services/api"

const SellerDashboard = () => {
    const [overview, setOverview] = useState(null)
    const [items, setItems] = useState([])
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useContext(AuthContext)
    const [editingItem, setEditingItem] = useState(null)
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null)
    const [editingAuction, setEditingAuction] = useState(null)
    const [deleteConfirmAuction, setDeleteConfirmAuction] = useState(null)
    const [auctionStatus, setAuctionStatus] = useState("all")
    const [categories, setCategories] = useState([])

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token")
        if (!token) {
            setError("Please log in to view your dashboard")
            setLoading(false)
            return
        }

        // Check if user has seller role
        if (user && user.role !== "seller") {
            updateToSellerRole()
        } else {
            fetchDashboardData()
        }
    }, [user])

    useEffect(() => {
        // Fetch categories when component mounts
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 100 })
                setCategories(response.data.data || [])
            } catch (error) {
                console.error("Error fetching categories:", error)
                toast.error("Failed to load categories")
            }
        }

        fetchCategories()
    }, [])

    const updateToSellerRole = async () => {
        try {
            setLoading(true)
            // Check if current role is buyer
            if (user.role !== "buyer") {
                setLoading(false)
                return
            }

            await userService.updateRole("seller")
            toast.success("Your account has been upgraded to seller status!")
            fetchDashboardData()
        } catch (error) {
            console.error("Error updating role:", error)
            const errorMessage = error.response?.data?.message || "Failed to update role"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get the authentication token
            const token = localStorage.getItem("token")
            if (!token) {
                throw new Error("No authentication token found")
            }

            // Add token to requests
            const [overviewRes, itemsRes, auctionsRes] = await Promise.all([
                userService.getSellerOverview(),
                userService.getSellerItems("available", 1),
                userService.getSellerAuctions(auctionStatus === "all" ? "" : auctionStatus, 1, 5)
            ])

            // Debug logging
            console.log('Overview Response:', overviewRes)
            console.log('Items Response:', itemsRes)
            console.log('Auctions Response:', auctionsRes)

            if (!overviewRes.data || !itemsRes.data || !auctionsRes.data) {
                throw new Error("Invalid response from server")
            }

            // Set overview data
            setOverview(overviewRes.data)

            // Set items data - check the response structure
            const itemsData = itemsRes.data?.items || itemsRes.data.data || []
            console.log('Processed Items Data:', itemsData)
            setItems(itemsData)

            // Set auctions data - check the response structure
            const auctionsData = auctionsRes.data?.auctions || auctionsRes.data.data || []
            console.log('Processed Auctions Data:', auctionsData)
            setAuctions(auctionsData)

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            const errorMessage = error.response?.data?.message || error.message || "Failed to load dashboard data"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Add useEffect to refetch when auction status changes
    useEffect(() => {
        fetchDashboardData()
    }, [auctionStatus])

    const handleUpdateItem = async (itemId, formData) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`https://be-mazady.vercel.app/api/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to update item')
            }

            const data = await response.json()
            if (data.status === 'success') {
                toast.success('Item updated successfully')
                fetchDashboardData() // Refresh the items list
                setEditingItem(null)
            }
        } catch (error) {
            console.error('Error updating item:', error)
            toast.error(error.message || 'Failed to update item')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteItem = async (itemId) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`https://be-mazady.vercel.app/api/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete item')
            }

            toast.success('Item deleted successfully')
            fetchDashboardData() // Refresh the items list
            setDeleteConfirmItem(null)
        } catch (error) {
            console.error('Error deleting item:', error)
            toast.error(error.message || 'Failed to delete item')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateAuction = async (auctionId, formData) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`https://be-mazady.vercel.app/api/auctions/${auctionId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    startPrice: parseFloat(formData.startPrice),
                    buyNowPrice: parseFloat(formData.buyNowPrice),
                    minimumBidIncrement: parseFloat(formData.minimumBidIncrement),
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: formData.status
                })
            })
            console.log("oh yah");


            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update auction')
            }

            const data = await response.json()
            console.log("dddd", data.success);

            if (data.success === true) {
                console.log("yaraaab");

                toast.success('Auction updated successfully')
                fetchDashboardData() // Refresh the dashboard data
                setEditingAuction(null)
            }
        } catch (error) {
            console.error('Error updating auction:', error)
            toast.error(error.message || 'Failed to update auction')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAuction = async (auctionId) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`https://be-mazady.vercel.app/api/auctions/${auctionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete auction')
            }

            toast.success('Auction deleted successfully')
            fetchDashboardData() // Refresh the auctions list
            setDeleteConfirmAuction(null)
        } catch (error) {
            console.error('Error deleting auction:', error)
            toast.error(error.message || 'Failed to delete auction')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                            <p className="text-2xl font-bold">{overview?.itemCount || 0}</p>
                        </div>
                        <Package className="text-rose-600" size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Auctions</p>
                            <p className="text-2xl font-bold">{overview?.auctionCount || 0}</p>
                        </div>
                        <Gavel className="text-rose-600" size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Items Sold</p>
                            <p className="text-2xl font-bold">{overview?.itemSold || 0}</p>
                        </div>
                        <TrendingUp className="text-rose-600" size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold">${overview?.revenue || 0}</p>
                        </div>
                        <DollarSign className="text-rose-600" size={24} />
                    </div>
                </div>
            </div>

            {/* My Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">My Items</h2>
                    <Link
                        to="/products/add"
                        className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors text-sm"
                    >
                        Add New Item
                    </Link>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
                            >
                                <div className="relative">
                                    <img
                                        src={item.item_cover || "/placeholder.svg"}
                                        alt={item.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    {item.is_featured && (
                                        <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-full text-xs">
                                            Featured
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <Tag size={16} className="text-gray-500 dark:text-gray-400 mr-1" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.item_status}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-rose-600">
                                            ${item.price}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <Star size={16} className="text-yellow-400 mr-1" />
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {item.ratingsAvg || 0}/5
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                ({item.reviews?.length || 0} reviews)
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                            <Calendar size={16} className="mr-1" />
                                            <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmItem(item)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Item</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target)
                            handleUpdateItem(editingItem._id, formData)

                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={editingItem.title}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        defaultValue={editingItem.price}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        name="item_status"
                                        defaultValue={editingItem.item_status}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                                    <input
                                        type="file"
                                        name="item_cover"
                                        accept="image/*"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"

                                >
                                    Update Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Delete Item</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete "{deleteConfirmItem.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirmItem(null)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteItem(deleteConfirmItem._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Auctions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold">My Auctions</h2>
                        <select
                            value={auctionStatus}
                            onChange={(e) => setAuctionStatus(e.target.value)}
                            className="px-3 py-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="all">All Auctions</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <Link
                        to="/auctions/create"
                        className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors text-sm"
                    >
                        Add New Auction
                    </Link>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctions.map((auction) => (
                            <div
                                key={auction._id}
                                className="block bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={auction.auctionCover || "/placeholder.svg"}
                                        alt={auction.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium mb-1">{auction.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Current Bid: ${auction.currentPrice}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Ends: {format(new Date(auction.endDate), "MMM d, yyyy")}</span>
                                        <span>{auction.bids?.length || 0} bids</span>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => setEditingAuction(auction)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmAuction(auction)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Auction Modal */}
            {editingAuction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Auction</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = {
                                title: e.target.title.value,
                                description: e.target.description.value,
                                category: e.target.category.value,
                                startPrice: e.target.startPrice.value,
                                buyNowPrice: e.target.buyNowPrice.value,
                                minimumBidIncrement: e.target.minimumBidIncrement.value,
                                startDate: e.target.startDate.value,
                                endDate: e.target.endDate.value,
                                status: e.target.status.value
                            }
                            handleUpdateAuction(editingAuction._id, formData)
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={editingAuction.title}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        defaultValue={editingAuction.description}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        name="category"
                                        defaultValue={editingAuction.category}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        defaultValue={format(new Date(editingAuction.startDate), "yyyy-MM-dd'T'HH:mm")}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        defaultValue={format(new Date(editingAuction.endDate), "yyyy-MM-dd'T'HH:mm")}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                                    <input
                                        type="file"
                                        name="auctionCover"
                                        accept="image/*"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Images</label>
                                    <input
                                        type="file"
                                        name="auctionImages"
                                        accept="image/*"
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Price</label>
                                    <input
                                        type="text"
                                        name="startPrice"
                                        defaultValue={editingAuction.startPrice}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Buy Now Price</label>
                                    <input
                                        type="number"
                                        name="buyNowPrice"
                                        defaultValue={editingAuction.buyNowPrice}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Minimum Bid Increment</label>
                                    <input
                                        type="number"
                                        name="minimumBidIncrement"
                                        defaultValue={editingAuction.minimumBidIncrement}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={editingAuction.status}
                                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingAuction(null)}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                                >
                                    Update Auction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Auction Confirmation Modal */}
            {deleteConfirmAuction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Delete Auction</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete "{deleteConfirmAuction.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirmAuction(null)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteAuction(deleteConfirmAuction._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SellerDashboard 