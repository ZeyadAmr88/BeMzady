import React from "react"
import { Link } from "react-router-dom"
import { Clock, Heart } from "lucide-react"
import { useState, useEffect, useContext } from "react"
import { formatDistanceToNow } from "date-fns"
import { userService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"

const AuctionCard = ({ auction }) => {
    const [timeLeft, setTimeLeft] = useState("")
    const [isFavorite, setIsFavorite] = useState(false)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        // Calculate time left
        const updateTimeLeft = () => {
            const now = new Date()
            const endDate = new Date(auction.endDate)

            if (now >= endDate) {
                setTimeLeft("Ended")
                return
            }

            setTimeLeft(formatDistanceToNow(endDate, { addSuffix: false }))
        }

        updateTimeLeft()
        const interval = setInterval(updateTimeLeft, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [auction.endDate])

    useEffect(() => {
        // Check if auction is in user's favorites
        const checkFavorite = async () => {
            if (!user) return

            try {
                const response = await userService.getFavorites()
                const favorites = response.data.data
                setIsFavorite(favorites.some((fav) => fav._id === auction.item._id))
            } catch (error) {
                console.error("Error checking favorites:", error)
            }
        }

        checkFavorite()
    }, [user, auction._id])

    const toggleFavorite = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            // Redirect to login if not logged in
            window.location.href = "/login"
            return
        }

        try {
            if (isFavorite) {
                await userService.removeFromFavorites(auction.item._id)
            } else {
                await userService.addToFavorites(auction.item._id)
            }
            setIsFavorite(!isFavorite)
        } catch (error) {
            console.error("Error toggling favorite:", error)
        }
    }

    return (
        <Link to={`/auctions/${auction._id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                    <img
                        src={auction.auctionCover || "/placeholder.svg?height=200&width=300"}
                        alt={auction.title}
                        className="w-full h-48 object-cover"
                    />
                    <button
                        onClick={toggleFavorite}
                        className={`absolute top-2 right-2 p-2 rounded-full ${isFavorite ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-500"} hover:bg-rose-100 hover:text-rose-600 transition-colors`}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex items-center text-white">
                            <Clock size={14} className="mr-1" />
                            <span className="text-sm">{timeLeft}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {auction.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{auction.description}</p>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Current Bid</p>
                            <p className="text-rose-600 font-bold">${auction.currentPrice || auction.startPrice}</p>
                        </div>

                        <button className="px-3 py-1 bg-rose-600 text-white text-sm rounded-full hover:bg-rose-700 transition-colors">
                            Bid Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default AuctionCard
