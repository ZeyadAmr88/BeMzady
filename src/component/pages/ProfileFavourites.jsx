import React from "react"
import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { userService } from "../services/api"
import { Heart, Eye, X } from 'lucide-react'
import { toast } from "react-hot-toast"

const ProfileFavorites = () => {
    // eslint-disable-next-line no-unused-vars
    const { user } = useContext(AuthContext)
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchFavorites = async () => {
        try {
            setLoading(true)
            const response = await userService.getFavorites()
            console.log("Favorites response:", response.data)
            setFavorites(response?.data?.data || [])
            setError(null)
        } catch (error) {
            console.error("Error fetching favorites:", error)
            setError("Failed to load your favorites. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFavorites()
    }, [])

    const removeFavorite = async (itemId) => {
        try {
            await userService.removeFromFavorites(itemId)
            toast.success("Item removed from favorites")
            // Refresh the favorites list
            fetchFavorites()
        } catch (error) {
            console.error("Error removing favorite:", error)
            toast.error("Failed to remove item from favorites")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <Link
                            to="/profile"
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Back to Profile
                        </Link>
                    </div>
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="text-center py-12">
                        <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            You haven't added any items or auctions to your favorites yet.
                        </p>
                        <Link
                            to="/items"
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                        >
                            Browse Items
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {favorites.map((item) => (
                            <div key={item._id} className="p-4">
                                <div className="flex items-start">
                                    <img
                                        src={item.item_cover || "/placeholder.svg"}
                                        alt={item.title}
                                        className="w-20 h-20 rounded-md object-cover"
                                    />
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{item.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    ${item.price?.toFixed(2) || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Added on {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    to={`/items/${item._id}`}
                                                    className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        removeFavorite(item._id);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileFavorites
