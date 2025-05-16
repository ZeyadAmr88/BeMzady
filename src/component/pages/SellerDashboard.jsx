"use client"

import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { userService } from "../services/api"
import { Package, Gavel, DollarSign, TrendingUp, AlertCircle, Star, Tag, Calendar } from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { AuthContext } from "../contexts/AuthContext"

const SellerDashboard = () => {
    const [overview, setOverview] = useState(null)
    const [items, setItems] = useState([])
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)

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

    const updateToSellerRole = async () => {
        try {
            setLoading(true)
            await userService.updateRole("seller")
            toast.success("Your account has been upgraded to seller status!")
            fetchDashboardData()
        } catch (error) {
            console.error("Error updating role:", error)
            const errorMessage = error.response?.data?.message || "Failed to update role"
            setError(errorMessage)
            toast.error(errorMessage)
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
                userService.getSellerAuctions("completed", 1, 5)
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
            const auctionsData = auctionsRes.data.data?.auctions || auctionsRes.data.data || []
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

    const handleItemClick = (itemSlug) => {
        navigate(`/items/${itemSlug}`)
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
                        to="/product/add"
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
                                onClick={() => handleItemClick(item.slug)}
                                className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-600"
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
                                    {console.log(item,"itemss")}
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* My Auctions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">My Auctions</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctions.map((auction) => (
                            <Link
                                key={auction._id}
                                to={`/auctions/${auction._id}`}
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
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SellerDashboard 