"use client"

import React, { useState, useEffect } from "react"
import { api, bidService, userService } from "../services/api"
import { formatDistanceToNow } from "date-fns"
import { User } from "lucide-react"

const BidHistory = ({ auctionId }) => {
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [userLoading, setUserLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bidderInfo, setBidderInfo] = useState({})

    useEffect(() => {
        const fetchBids = async () => {
            try {
                // Get auction data with bids
                const response = await api.get(`/auctions/${auctionId}`)
                const auctionData = response.data.data
                const bidsList = auctionData.bids || []
                setBids(bidsList)

                // Fetch user information for each bidder
                const bidderIds = [...new Set(bidsList.map(bid => bid.bidder))]
                const bidderData = {}

                if (bidderIds.length > 0) {
                    setUserLoading(true)
                    try {
                        await Promise.all(
                            bidderIds.map(async (bidderId) => {
                                if (bidderId) {
                                    try {
                                        const userResponse = await userService.getUserById(bidderId)
                                        bidderData[bidderId] = userResponse.data.data
                                        console.log(`Fetched user info for ${bidderId}:`, userResponse.data.data)
                                    } catch (userError) {
                                        console.error(`Error fetching user ${bidderId}:`, userError)
                                    }
                                }
                            })
                        )
                    } finally {
                        setUserLoading(false)
                    }
                }

                setBidderInfo(bidderData)
            } catch (error) {
                console.error("Error fetching bid history:", error)
                setError("Failed to load bid history. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchBids()
    }, [auctionId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (error) {
        return <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">{error}</div>
    }

    if (bids.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No bids have been placed yet.</p>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">
                Bid History
                {userLoading && (
                    <span className="ml-2 inline-block">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-rose-600"></div>
                    </span>
                )}
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                                Bidder
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                                Amount
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bids.map((bid, index) => (
                            <tr
                                key={bid._id || index}
                                className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {bidderInfo[bid.bidder]?.profilePicture ? (
                                            <img
                                                src={bidderInfo[bid.bidder].profilePicture || "/placeholder.svg"}
                                                alt={bidderInfo[bid.bidder].username}
                                                className="w-8 h-8 rounded-full mr-3"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                <User size={16} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium">
                                            {bidderInfo[bid.bidder]?.username || "Anonymous"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-rose-600 font-medium">${bid.amount.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                    {bid.createdAt ? (
                                        <div>
                                            <div>{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</div>
                                            <div className="text-xs mt-1">{new Date(bid.createdAt).toLocaleString()}</div>
                                        </div>
                                    ) : (
                                        "Unknown time"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BidHistory
