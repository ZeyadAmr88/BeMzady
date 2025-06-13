// "use client"

// import React, { useState, useEffect } from "react"
// import { auctionService } from "../services/api"
// import AuctionCard from "./AuctionCard"

// const RelatedAuctions = ({ categoryId, currentAuctionId }) => {
//     const [auctions, setAuctions] = useState([])
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         const fetchRelatedAuctions = async () => {
//             if (!categoryId) {
//                 setLoading(false)
//                 return
//             }

//             try {
//                 // Use the specialized function for getting auctions by category
//                 const response = await auctionService.getAuctionsByCategory(categoryId, {
//                     limit: 4,
//                     status: "active",
//                     exclude: currentAuctionId // Exclude the current auction from results
//                 })

//                 // Filter out the current auction if it's still in the results
//                 const filteredAuctions = response.data.data.filter((auction) => auction._id !== currentAuctionId)

//                 // Only show up to 4 related auctions
//                 setAuctions(filteredAuctions.slice(0, 4))
//             } catch (error) {
//                 console.error("Error fetching related auctions:", error)
//                 console.error("Error details:", {
//                     message: error.message,
//                     response: error.response?.data,
//                     status: error.response?.status
//                 })
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchRelatedAuctions()
//     }, [categoryId, currentAuctionId])

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-32">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
//             </div>
//         )
//     }

//     // We'll handle empty auctions in the return statement

//     return (
//         <div>
//             {auctions.length > 0 ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {auctions.map((auction) => (
//                         <AuctionCard key={auction._id} auction={auction} />
//                     ))}
//                 </div>
//             ) : (
//                 <div className="text-center py-8">
//                     <p className="text-gray-500 dark:text-gray-400">No related auctions found.</p>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default RelatedAuctions
