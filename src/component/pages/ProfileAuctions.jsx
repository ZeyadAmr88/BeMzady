// "use client"

// import React, { useState, useEffect } from "react"
// import { Link } from "react-router-dom"
// import { auctionService } from "../services/api"
// import { AlertCircle, Edit2, Trash2, Eye } from "lucide-react"

// const ProfileAuctions = () => {
//     const [auctions, setAuctions] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)

//     useEffect(() => {
//         fetchAuctions()
//     }, [])

//     const fetchAuctions = async () => {
//         try {
//             setLoading(true)
//             const response = await auctionService.getUserAuctions()
//             setAuctions(response.data.data || [])
//             setError(null)
//         } catch (error) {
//             console.error("Error fetching auctions:", error)
//             setError("Failed to load your auctions. Please try again.")
//         } finally {
//             setLoading(false)
//         }
//     }

//     const handleDeleteAuction = async (auctionId) => {
//         if (!window.confirm("Are you sure you want to delete this auction?")) return

//         try {
//             await auctionService.deleteAuction(auctionId)
//             setAuctions(prevAuctions => prevAuctions.filter(auction => auction._id !== auctionId))
//         } catch (error) {
//             console.error("Error deleting auction:", error)
//             setError("Failed to delete auction. Please try again.")
//         }
//     }

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
//             </div>
//         )
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold">My Auctions</h1>
//                 <Link
//                     to="/auctions/create"
//                     className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
//                 >
//                     Create New Auction
//                 </Link>
//             </div>

//             {error && (
//                 <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
//                     <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
//                     <span>{error}</span>
//                 </div>
//             )}

//             {auctions.length === 0 ? (
//                 <div className="text-center py-12">
//                     <h2 className="text-xl font-medium mb-2">No auctions yet</h2>
//                     <p className="text-gray-500 dark:text-gray-400 mb-6">
//                         You haven't created any auctions yet. Start by creating your first auction!
//                     </p>
//                     <Link
//                         to="/auctions/create"
//                         className="inline-flex items-center px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
//                     >
//                         Create Auction
//                     </Link>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {auctions.map((auction) => (
//                         <div key={auction._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//                             <img
//                                 src={auction.item_cover || "/placeholder.svg"}
//                                 alt={auction.title}
//                                 className="w-full h-48 object-cover"
//                             />
//                             <div className="p-4">
//                                 <h3 className="font-medium mb-2">{auction.title}</h3>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//                                     {auction.description}
//                                 </p>
//                                 <div className="flex justify-between items-center">
//                                     <span className="font-medium text-rose-600">
//                                         ${auction.current_price.toFixed(2)}
//                                     </span>
//                                     <div className="flex space-x-2">
//                                         <Link
//                                             to={`/auctions/${auction._id}`}
//                                             className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                                         >
//                                             <Eye size={18} />
//                                         </Link>
//                                         <Link
//                                             to={`/auctions/${auction._id}/edit`}
//                                             className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                                         >
//                                             <Edit2 size={18} />
//                                         </Link>
//                                         <button
//                                             onClick={() => handleDeleteAuction(auction._id)}
//                                             className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                                         >
//                                             <Trash2 size={18} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     )
// }

// export default ProfileAuctions
