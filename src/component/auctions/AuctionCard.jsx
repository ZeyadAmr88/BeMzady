import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { Clock, Heart, BadgeCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { userService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"
import { ThemeContext } from "../contexts/ThemeContext"

const AuctionCard = ({ auction, isHot = false }) => {
    const [timeLeft, setTimeLeft] = useState("")
    const [isFavorite, setIsFavorite] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sellerInfo, setSellerInfo] = useState(null)
    const { user } = useContext(AuthContext)
    const { darkMode } = useContext(ThemeContext)

    // Get the first image or use a default placeholder
    const imageUrl = auction?.auctionCover ||
        (auction?.auctionImages && auction.auctionImages.length > 0 ? auction.auctionImages[0] : null) ||
        (auction?.images && auction.images.length > 0 ? auction.images[0] : null) ||
        "/placeholder.svg?height=200&width=300"

    useEffect(() => {
        const updateTimeLeft = () => {
            // Try both endTime and endDate fields
            const endTime = auction?.endTime || auction?.endDate
            if (endTime) {
                const endDate = new Date(endTime)
                const now = new Date()
                const distance = endDate - now

                if (distance < 0) {
                    setTimeLeft("Auction ended")
                } else {
                    setTimeLeft(formatDistanceToNow(endDate, { addSuffix: true }))
                }
            }
        }

        updateTimeLeft()
        const timer = setInterval(updateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [auction?.endTime, auction?.endDate])

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (user && auction?._id) {
                try {
                    const response = await userService.getFavorites()
                    const favorites = response.data.data
                    setIsFavorite(favorites.some((fav) => fav._id === auction._id))
                } catch (error) {
                    console.error("Error checking favorite status:", error)
                }
            }
        }

        checkFavoriteStatus()
    }, [user, auction?._id])

    useEffect(() => {
        const fetchSellerInfo = async () => {
            if (auction?.seller) {
                try {
                    // Get the seller ID, handling both string and object cases
                    const sellerId = typeof auction.seller === 'object' ? auction.seller._id : auction.seller
                    if (!sellerId) {
                        console.error("No valid seller ID found")
                        return
                    }
                    const response = await userService.getUserById(sellerId)
                    setSellerInfo(response.data.data)
                } catch (error) {
                    console.error("Error fetching seller info:", error)
                }
            }
        }

        fetchSellerInfo()
    }, [auction?.seller])

    const handleFavoriteClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user || !auction?._id) {
            // Redirect to login or show login modal
            return
        }

        setIsLoading(true)
        try {
            if (isFavorite) {
                await userService.removeFromFavorites(auction._id)
            } else {
                await userService.addToFavorites(auction._id)
            }
            setIsFavorite(!isFavorite)
        } catch (error) {
            console.error("Error toggling favorite:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!auction) {
        return null;
    }

    return (
        <Link
            to={`/auctions/${auction._id}`}
            className="block bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={auction.title || "Auction item"}
                    className="w-full h-48 object-cover rounded-t-lg"
                />
                <button
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                    className="absolute top-2 right-2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-700 transition-colors duration-200"
                >
                    <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
                    />
                </button>
                {sellerInfo?.role === "admin" && (
                    <div className="absolute top-2 left-2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md">
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    {auction.title || "Untitled Auction"}
                </h3>
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Current Bid
                    </span>
                    <div className="text-rose-600 font-semibold">
                        {auction.currentBid || auction.startingBid} EGP
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{timeLeft || "No end time set"}</span>
                </div>
            </div>
        </Link>
    )
}

export default AuctionCard
