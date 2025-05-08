"use client"

import React, { useState, useEffect } from "react"
import { auctionService } from "../services/api"
import AuctionCard from "./AuctionCard"

const RelatedAuctions = ({ categoryId, currentAuctionId }) => {
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRelatedAuctions = async () => {
            if (!categoryId) {
                setLoading(false)
                return
            }

            try {
                const response = await auctionService.getAuctions({
                    category: categoryId,
                    limit: 4,
                    status: "active",
                })

                // Filter out the current auction
                const filteredAuctions = response.data.data.filter((auction) => auction._id !== currentAuctionId)

                setAuctions(filteredAuctions)
            } catch (error) {
                console.error("Error fetching related auctions:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedAuctions()
    }, [categoryId, currentAuctionId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (auctions.length === 0) {
        return null
    }

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                    <AuctionCard key={auction._id} auction={auction} />
                ))}
            </div>
        </section>
    )
}

export default RelatedAuctions
