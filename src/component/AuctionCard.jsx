import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { Clock, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { userService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"

const AuctionCard = ({ auction }) => {
    const [timeLeft, setTimeLeft] = useState("")
    const [isFavorite, setIsFavorite] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        const updateTimeLeft = () => {
            if (auction.endTime) {
                const endTime = new Date(auction.endTime)
                const now = new Date()
                const distance = endTime - now

                if (distance < 0) {
                    setTimeLeft("Auction ended")
                } else {
                    setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }))
                }
            }
        }

        updateTimeLeft()
        const timer = setInterval(updateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [auction.endTime])

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (user) {
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
    }, [user, auction._id])

    const handleFavoriteClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
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

    return (
        <Link
            to={`/auctions/${auction._id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
            <div className="relative">
                <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                />
                <button
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                >
                    <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                            }`}
                    />
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {auction.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                        Current Bid: ${auction.currentBid || auction.startingBid}
                    </span>
                    <span className="text-sm text-gray-600">
                        {auction.bidCount} bids
                    </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{timeLeft}</span>
                </div>
            </div>
        </Link>
    )
}

export default AuctionCard 