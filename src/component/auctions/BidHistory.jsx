"use client"

import React, { useState, useEffect } from "react"
import { api } from "../services/api"
import { formatDistanceToNow } from "date-fns"
import { User } from "lucide-react"

const BidHistory = ({ auctionId }) => {
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await api.get(`/auctions/${auctionId}`)
                const auctionData = response.data.data
                setBids(auctionData.bids || [])
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
            <h2 className="text-xl font-bold mb-4">Bid History</h2>
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
                                        {bid.bidder?.user_picture ? (
                                            <img
                                                src={bid.bidder.user_picture || "/placeholder.svg"}
                                                alt={bid.bidder.username}
                                                className="w-8 h-8 rounded-full mr-3"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                <User size={16} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium">{bid.bidder?.username || "Anonymous"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-rose-600 font-medium">${bid.amount.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
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
