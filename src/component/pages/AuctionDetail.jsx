"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { auctionService, userService } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import {
  Clock,
  Heart,
  Share2,
  Flag,
  User,
  DollarSign,
  Tag,
  Calendar,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import BidHistory from "../auctions/BidHistory";
import ItemReviews from "../items/ItemReviews";
import RelatedAuctions from "../auctions/RelatedAuctions";
import { toast } from "react-hot-toast";
import ContactButton from "../messages/ContactButton";

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [auction, setAuction] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [sellerLoading, setSellerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isUserSeller, setIsUserSeller] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await auctionService.getAuctionById(id);
        const auctionData = response.data.data;
        setAuction(auctionData);

        // Set initial bid amount to current price + minimum increment
        const currentPrice = auctionData.currentPrice || auctionData.startPrice;
        const minIncrement = auctionData.minimumBidIncrement || 1;
        setBidAmount((currentPrice + minIncrement).toString());

        // Check if the current user is the seller
        if (user && auctionData.seller === user._id) {
          setIsUserSeller(true);
        }

        // Fetch seller information
        if (auctionData.seller) {
          setSellerLoading(true);
          try {
            const sellerResponse = await userService.getUserById(
              auctionData.seller
            );
            setSellerInfo(sellerResponse.data.data);
            console.log("Seller info:", sellerResponse.data.data);
          } catch (sellerError) {
            console.error("Error fetching seller information:", sellerError);
            toast.error("Failed to load seller information");
          } finally {
            setSellerLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching auction:", error);
        setError("Failed to load auction details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id, user]);

  useEffect(() => {
    if (!auction) return;

    // Update time left
    const updateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(auction.endDate);

      if (now >= endDate) {
        setTimeLeft("Auction ended");
        return;
      }

      setTimeLeft(formatDistanceToNow(endDate, { addSuffix: true }));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction]);

  // Check if auction is in user's favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !auction) return;

      try {
        const response = await userService.getFavorites();
        const favorites = response.data.data || [];
        // Check if this auction's item is in favorites
        setIsFavorite(favorites.some((fav) => fav._id === auction._id));
      } catch (error) {
        console.error("Error checking favorites:", error);
      }
    };

    checkFavorite();
  }, [user, auction]);

  const toggleFavorite = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to add items to favorites");
      return;
    }

    try {
      if (isFavorite) {
        await userService.removeFromFavorites(auction._id);
        toast.success("Removed from favorites");
      } else {
        await userService.addToFavorites(auction._id);
        toast.success("Added to favorites");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();

    if (!user) {
      setBidError("Please log in to place a bid");
      return;
    }

    // Prevent seller from bidding on their own auction
    if (isUserSeller) {
      setBidError("You cannot bid on your own auction");
      return;
    }

    let bidValue = Number.parseFloat(bidAmount);
    const currentPrice = auction.currentPrice || auction.startPrice;
    const minIncrement = auction.minimumBidIncrement || 1;
    const minBidAmount = currentPrice + minIncrement;

    // Check if bid is at least the minimum required amount
    if (bidValue < minBidAmount) {
      setBidError(`Bid must be at least $${minBidAmount.toFixed(2)}`);
      return;
    }

    // Calculate how many increments above the current price
    const incrementsAboveCurrentPrice = Math.floor(
      (bidValue - currentPrice) / minIncrement
    );

    // If not an exact multiple of the increment, adjust to the next valid increment
    if ((bidValue - currentPrice) % minIncrement !== 0) {
      const adjustedBidValue =
        currentPrice + (incrementsAboveCurrentPrice + 1) * minIncrement;
      bidValue = adjustedBidValue;
      // Update the bid amount in the input field
      setBidAmount(bidValue.toString());
      toast.info(
        `Your bid has been adjusted to $${bidValue.toFixed(
          2
        )} to match the minimum increment requirement`
      );
    }

    setBidError("");

    try {
      // Show loading state
      setBidSuccess("Processing your bid...");

      // Place the bid
      const bidResponse = await auctionService.placeBid(auction._id, bidValue);
      console.log("Bid response:", bidResponse.data);

      // Update auction data
      const response = await auctionService.getAuctionById(id);
      setAuction(response.data.data);

      // Show success message
      setBidSuccess("Your bid was placed successfully!");
      toast.success("Your bid was placed successfully!");

      // Clear success message after 5 seconds
      setTimeout(() => setBidSuccess(""), 5000);
    } catch (error) {
      console.error("Error placing bid:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to place bid. Please try again.";
      setBidError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Oops!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link
          to="/auctions"
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
        >
          Browse Other Auctions
        </Link>
      </div>
    );
  }

  const isAuctionEnded = new Date() >= new Date(auction.endDate);
  const images = [
    auction.auctionCover,
    ...(auction.auctionImages || []),
  ].filter(Boolean);
  if (images.length === 0) {
    images.push("/placeholder.svg?height=400&width=600");
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-w-16 aspect-h-9">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={auction.title || "Auction image"}
                className="w-full h-[250px] sm:h-[350px] md:h-[400px] object-contain bg-gray-100 dark:bg-gray-900"
              />
            </div>

            {images.length > 1 && (
              <div className="p-2 sm:p-4 flex space-x-1 sm:space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index
                        ? "border-rose-600"
                        : "border-transparent"
                    }`}
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
          <div className="mt-4 sm:mt-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-2 sm:space-x-8">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "details"
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Item Details
                </button>
                <button
                  onClick={() => setActiveTab("bids")}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "bids"
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Bid History
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === "reviews"
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
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {auction.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Tag className="text-rose-600 mr-2" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Category:</span>{" "}
                        {auction.category || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="text-rose-600 mr-2" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Start Date:</span>{" "}
                        {format(new Date(auction.startDate), "PPP")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="text-rose-600 mr-2" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">End Date:</span>{" "}
                        {format(new Date(auction.endDate), "PPP")}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-3">Seller Information</h3>
                  <div className="p-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {sellerInfo ? (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mr-3">
                            {sellerInfo.profilePicture ? (
                              <img
                                src={sellerInfo.profilePicture}
                                alt={sellerInfo.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User
                                  size={18}
                                  className="text-gray-500 dark:text-gray-400"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {sellerInfo.username}
                            </h4>
                            <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
                              {sellerInfo.email && (
                                <span className="flex items-center">
                                  <Mail size={14} className="mr-1" />{" "}
                                  {sellerInfo.email}
                                </span>
                              )}
                              {sellerInfo.phone && (
                                <span className="flex items-center">
                                  <Phone size={14} className="mr-1" />{" "}
                                  {sellerInfo.phone}
                                </span>
                              )}
                              {sellerInfo.address && (
                                <span className="flex items-center">
                                  <MapPin size={14} className="mr-1" />{" "}
                                  {sellerInfo.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Add Contact button */}
                        {!isUserSeller && sellerInfo._id && (
                          <ContactButton
                            recipientId={sellerInfo._id}
                            buttonText="Contact Seller"
                            className="px-3 py-1.5 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Seller information unavailable
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "bids" && <BidHistory auctionId={auction._id} />}

              {activeTab === "reviews" && <ItemReviews itemId={auction._id} />}
            </div>
          </div>
        </div>

        {/* Right Column - Auction Info & Bidding */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              {auction.title}
            </h1>

            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
              <Clock size={16} className="sm:w-[18px] sm:h-[18px] mr-1" />
              <span className="text-sm sm:text-base">{timeLeft}</span>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Current Bid
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                ${(auction.currentPrice || auction.startPrice).toFixed(2)}
              </p>
              {auction.buyNowPrice && (
                <p className="text-xs sm:text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Buy Now:{" "}
                  </span>
                  <span className="font-medium">
                    ${auction.buyNowPrice.toFixed(2)}
                  </span>
                </p>
              )}
              <p className="text-xs sm:text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  Reserve Price:{" "}
                </span>
                <span className="font-medium">
                  ${auction.reservePrice.toFixed(2)}
                </span>
              </p>
            </div>

            {!isAuctionEnded ? (
              <form onSubmit={handleBid}>
                <div className="mb-3 sm:mb-4">
                  <label
                    htmlFor="bidAmount"
                    className="block text-xs sm:text-sm font-medium mb-1"
                  >
                    Your Bid (Minimum Increment: $
                    {auction.minimumBidIncrement.toFixed(2)})
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign
                        size={16}
                        className="sm:w-[18px] sm:h-[18px] text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <input
                      type="number"
                      id="bidAmount"
                      step="0.01"
                      min={
                        (auction.currentPrice || auction.startPrice) +
                        auction.minimumBidIncrement
                      }
                      className="pl-8 sm:pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base py-1.5 sm:py-2"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Bids will be automatically adjusted to match the minimum
                    increment requirement.
                  </p>
                  {bidError && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      {bidError}
                    </p>
                  )}
                  {bidSuccess && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
                      {bidSuccess}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors text-sm sm:text-base"
                >
                  Place Bid
                </button>

                {auction.buyNowPrice && (
                  <button
                    type="button"
                    className="w-full mt-2 sm:mt-3 border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors text-sm sm:text-base"
                  >
                    Buy Now for ${auction.buyNowPrice.toFixed(2)}
                  </button>
                )}
              </form>
            ) : (
              <div className="text-center py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                  This auction has ended
                </p>
              </div>
            )}

            <div className="flex justify-between mt-4 sm:mt-6">
              <button
                onClick={toggleFavorite}
                className={`flex items-center ${
                  isFavorite
                    ? "text-rose-600"
                    : "text-gray-500 dark:text-gray-400"
                } hover:text-rose-600 dark:hover:text-rose-500 transition-colors`}
              >
                <Heart
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] mr-1"
                  fill={isFavorite ? "currentColor" : "none"}
                />
                <span className="text-xs sm:text-sm">
                  {isFavorite ? "Saved" : "Save"}
                </span>
              </button>
              <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px] mr-1" />
                <span className="text-xs sm:text-sm">Share</span>
              </button>
              <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                <Flag size={16} className="sm:w-[18px] sm:h-[18px] mr-1" />
                <span className="text-xs sm:text-sm">Report</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
              Auction Details
            </h2>

            <div className="space-y-2 sm:space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Auction ID
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  {auction._id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Bids
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  {auction.bids?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Item Condition
                </span>
                <span className="font-medium capitalize text-xs sm:text-sm">
                  {auction.status || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Location
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  {auction.seller?.address || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Shipping
                </span>
                <span className="font-medium text-xs sm:text-sm">
                  Worldwide
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Auctions */}
      <RelatedAuctions
        categoryId={auction.category}
        currentAuctionId={auction._id}
      />
    </div>
  );
};

export default AuctionDetail;
