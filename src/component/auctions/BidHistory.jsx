"use client"

import React, { useState, useEffect } from "react"
import { userService } from "../services/api"
import { formatCairoRelativeTime, formatCairoFullDateTime } from "../utils/dateUtils"
import { User } from "lucide-react"

const BidHistory = ({ bids = [] }) => {
    const [loading, setLoading] = useState(false)
    const [userLoading, setUserLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bidderInfo, setBidderInfo] = useState({})

    useEffect(() => {
        const fetchBidderInfo = async () => {
            if (bids.length === 0) return;

            try {
                // Fetch user information for each bidder
                const bidderIds = [...new Set(bids.map(bid => bid.bidder))]
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
                console.error("Error fetching bidder information:", error)
                setError("Failed to load bidder information. Please try again later.")
            }
        }

        fetchBidderInfo()
    }, [bids])

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bidder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bids.map((bid) => (
                            <tr key={bid._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {bidderInfo[bid.bidder]?.user_picture ? (
                                            <img
                                                src={bidderInfo[bid.bidder].user_picture}
                                                alt={bidderInfo[bid.bidder].username}
                                                className="w-8 h-8 rounded-full mr-3"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                                                <User size={16} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {bidderInfo[bid.bidder]?.username || "Unknown"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                                    ${bid.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                    {bid.createdAt ? (
                                        <div>
                                            <div>{formatCairoRelativeTime(bid.createdAt)}</div>
                                            <div className="text-xs mt-1">{formatCairoFullDateTime(bid.createdAt)}</div>
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
