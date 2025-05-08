"use client"

import React, { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import { auctionService, userService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"
import { Clock, Heart, Share2, Flag, User, DollarSign, Tag, Calendar, MessageCircle, Mail, Phone, MapPin } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import BidHistory from "../auctions/BidHistory"
import ItemReviews from "../items/ItemReviews"
import RelatedAuctions from "../auctions/RelatedAuctions"
import { toast } from "react-hot-toast"

const AuctionDetail = () => {
    const { id } = useParams()
    const { user } = useContext(AuthContext)
    const [auction, setAuction] = useState(null)
    const [sellerInfo, setSellerInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sellerLoading, setSellerLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bidAmount, setBidAmount] = useState("")
    const [bidError, setBidError] = useState("")
    const [bidSuccess, setBidSuccess] = useState("")
    const [timeLeft, setTimeLeft] = useState("")
    const [activeTab, setActiveTab] = useState("details")
    const [selectedImage, setSelectedImage] = useState(0)
    const [isUserSeller, setIsUserSeller] = useState(false)

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const response = await auctionService.getAuctionById(id)
                const auctionData = response.data.data
                setAuction(auctionData)

                // Set initial bid amount to current price + minimum increment
                const currentPrice = auctionData.currentPrice || auctionData.startPrice
                const minIncrement = auctionData.minimumBidIncrement || 1
                setBidAmount((currentPrice + minIncrement).toString())

                // Check if the current user is the seller
                if (user && auctionData.seller === user._id) {
                    setIsUserSeller(true)
                }

                // Fetch seller information
                if (auctionData.seller) {
                    setSellerLoading(true)
                    try {
                        const sellerResponse = await userService.getUserById(auctionData.seller)
                        setSellerInfo(sellerResponse.data.data)
                        console.log("Seller info:", sellerResponse.data.data)
                    } catch (sellerError) {
                        console.error("Error fetching seller information:", sellerError)
                        toast.error("Failed to load seller information")
                    } finally {
                        setSellerLoading(false)
                    }
                }
            } catch (error) {
                console.error("Error fetching auction:", error)
                setError("Failed to load auction details. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchAuction()
    }, [id, user])

    useEffect(() => {
        if (!auction) return

        // Update time left
        const updateTimeLeft = () => {
            const now = new Date()
            const endDate = new Date(auction.endDate)

            if (now >= endDate) {
                setTimeLeft("Auction ended")
                return
            }

            setTimeLeft(formatDistanceToNow(endDate, { addSuffix: true }))
        }

        updateTimeLeft()
        const interval = setInterval(updateTimeLeft, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [auction])

    const handleBid = async (e) => {
        e.preventDefault()

        if (!user) {
            setBidError("Please log in to place a bid")
            return
        }

        // Prevent seller from bidding on their own auction
        if (isUserSeller) {
            setBidError("You cannot bid on your own auction")
            return
        }

        const bidValue = Number.parseFloat(bidAmount)
        const currentPrice = auction.currentPrice || auction.startPrice
        const minIncrement = auction.minimumBidIncrement || 1

        if (bidValue < currentPrice + minIncrement) {
            setBidError(`Bid must be at least $${(currentPrice + minIncrement).toFixed(2)}`)
            return
        }

        setBidError("")

        try {
            // Show loading state
            setBidSuccess("Processing your bid...")

            // Place the bid
            const bidResponse = await auctionService.placeBid(auction._id, bidValue)
            console.log("Bid response:", bidResponse.data)

            // Update auction data
            const response = await auctionService.getAuctionById(id)
            setAuction(response.data.data)

            // Show success message
            setBidSuccess("Your bid was placed successfully!")
            toast.success("Your bid was placed successfully!")

            // Clear success message after 5 seconds
            setTimeout(() => setBidSuccess(""), 5000)
        } catch (error) {
            console.error("Error placing bid:", error)
            const errorMsg = error.response?.data?.message || "Failed to place bid. Please try again."
            setBidError(errorMsg)
            toast.error(errorMsg)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Oops!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <Link
                    to="/auctions"
                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                >
                    Browse Other Auctions
                </Link>
            </div>
        )
    }

    const isAuctionEnded = new Date() >= new Date(auction.endDate)
    const images = [auction.auctionCover, ...(auction.auctionImages || [])].filter(Boolean)
    if (images.length === 0) {
        images.push("/placeholder.svg?height=400&width=600")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="relative aspect-w-16 aspect-h-9">
                            <img
                                src={images[selectedImage] || "/placeholder.svg"}
                                alt={auction.title || "Auction image"}
                                className="w-full h-[400px] object-contain bg-gray-100 dark:bg-gray-900"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="p-4 flex space-x-2 overflow-x-auto">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${selectedImage === index ? "border-rose-600" : "border-transparent"}`}
                                    >
                                        <img
                                            src={image || "/placeholder.svg"}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="mt-8">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "details"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                >
                                    Item Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("bids")}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "bids"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                >
                                    Bid History
                                </button>
                                <button
                                    onClick={() => setActiveTab("reviews")}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "reviews"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        }`}
                                >
                                    Reviews
                                </button>
                            </nav>
                        </div>

                        <div className="py-6">
                            {activeTab === "details" && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Item Description</h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6">{auction.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center">
                                            <Tag className="text-rose-600 mr-2" size={18} />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                <span className="font-medium">Category:</span> {auction.category || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="text-rose-600 mr-2" size={18} />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                <span className="font-medium">Start Date:</span> {format(new Date(auction.startDate), "PPP")}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="text-rose-600 mr-2" size={18} />
                                            <span className="text-gray-700 dark:text-gray-300">
                                                <span className="font-medium">End Date:</span> {format(new Date(auction.endDate), "PPP")}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold mb-3">Seller Information</h3>
                                    <div className="flex items-center mb-6">
                                        {sellerInfo?.profilePicture ? (
                                            <img
                                                src={sellerInfo.profilePicture || "/placeholder.svg"}
                                                alt={sellerInfo.username}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                <User size={20} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{sellerInfo?.username || "Anonymous"}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Member since{" "}
                                                {sellerInfo?.createdAt ? format(new Date(sellerInfo.createdAt), "MMMM yyyy") : "N/A"}
                                            </p>
                                        </div>

                                        {user && !isUserSeller && (
                                            <button className="ml-auto flex items-center text-rose-600 hover:text-rose-700 transition-colors">
                                                <MessageCircle size={18} className="mr-1" />
                                                <span>Contact</span>
                                            </button>
                                        )}
                                    </div>

                                    {sellerInfo && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                            {sellerInfo.email && (
                                                <div className="flex items-center">
                                                    <Mail className="text-rose-600 mr-2" size={16} />
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {sellerInfo.email}
                                                    </span>
                                                </div>
                                            )}
                                            {sellerInfo.phone && (
                                                <div className="flex items-center">
                                                    <Phone className="text-rose-600 mr-2" size={16} />
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {sellerInfo.phone}
                                                    </span>
                                                </div>
                                            )}
                                            {sellerInfo.address && (
                                                <div className="flex items-center col-span-2">
                                                    <MapPin className="text-rose-600 mr-2" size={16} />
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {sellerInfo.address}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "bids" && <BidHistory auctionId={auction._id} />}

                            {activeTab === "reviews" && <ItemReviews itemId={auction._id} />}
                        </div>
                    </div>
                </div>

                {/* Right Column - Auction Info & Bidding */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>

                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                            <Clock size={18} className="mr-1" />
                            <span>{timeLeft}</span>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Bid</p>
                            <p className="text-3xl font-bold text-rose-600">
                                ${(auction.currentPrice || auction.startPrice).toFixed(2)}
                            </p>
                            {auction.buyNowPrice && (
                                <p className="text-sm mt-1">
                                    <span className="text-gray-500 dark:text-gray-400">Buy Now: </span>
                                    <span className="font-medium">${auction.buyNowPrice.toFixed(2)}</span>
                                </p>
                            )}
                            <p className="text-sm mt-1">
                                <span className="text-gray-500 dark:text-gray-400">Reserve Price: </span>
                                <span className="font-medium">${auction.reservePrice.toFixed(2)}</span>
                            </p>
                        </div>

                        {!isAuctionEnded ? (
                            <form onSubmit={handleBid}>
                                <div className="mb-4">
                                    <label htmlFor="bidAmount" className="block text-sm font-medium mb-1">
                                        Your Bid (Minimum Increment: ${auction.minimumBidIncrement.toFixed(2)})
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign size={18} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="bidAmount"
                                            step="0.01"
                                            min={(auction.currentPrice || auction.startPrice) + auction.minimumBidIncrement}
                                            className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:text-white"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {bidError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{bidError}</p>}
                                    {bidSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{bidSuccess}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Place Bid
                                </button>

                                {auction.buyNowPrice && (
                                    <button
                                        type="button"
                                        className="w-full mt-3 border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                                    >
                                        Buy Now for ${auction.buyNowPrice.toFixed(2)}
                                    </button>
                                )}
                            </form>
                        ) : (
                            <div className="text-center py-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="text-gray-700 dark:text-gray-300 font-medium">This auction has ended</p>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                <Heart size={18} className="mr-1" />
                                <span>Save</span>
                            </button>
                            <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                <Share2 size={18} className="mr-1" />
                                <span>Share</span>
                            </button>
                            <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                <Flag size={18} className="mr-1" />
                                <span>Report</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4">Auction Details</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Auction ID</span>
                                <span className="font-medium">{auction._id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Bids</span>
                                <span className="font-medium">{auction.bids?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Item Condition</span>
                                <span className="font-medium capitalize">{auction.status || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Location</span>
                                <span className="font-medium">{auction.seller?.address || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                                <span className="font-medium">Worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Auctions */}
            <RelatedAuctions categoryId={auction.category} currentAuctionId={auction._id} />
        </div>
    )
}

export default AuctionDetail
