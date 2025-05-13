import React from "react"
import { Link } from "react-router-dom"
import { Clock, Heart } from "lucide-react"
import { useState, useEffect, useContext } from "react"
import { formatDistanceToNow } from "date-fns"
import { AuthContext } from "../contexts/AuthContext"

const AuctionCard = ({ auction }) => {
    const [timeLeft, setTimeLeft] = useState("")
    // eslint-disable-next-line no-unused-vars
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





    return (
        <Link to={`/auctions/${auction._id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative">
                    <img
                        src={auction.auctionCover || "/placeholder.svg?height=200&width=300"}
                        alt={auction.title}
                        className="w-full h-40 sm:h-48 object-cover"
                    />


                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                        <div className="flex items-center text-white">
                            <Clock size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                            <span className="text-xs sm:text-sm">{timeLeft}</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-4 flex-grow flex flex-col">
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {auction.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-grow">{auction.description}</p>

                    <div className="flex justify-between items-center mt-auto">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Current Bid</p>
                            <p className="text-rose-600 font-bold text-sm sm:text-base">${auction.currentPrice || auction.startPrice}</p>
                        </div>

                        <button className="px-2 sm:px-3 py-1 bg-rose-600 text-white text-xs sm:text-sm rounded-full hover:bg-rose-700 transition-colors">
                            Bid Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default AuctionCard