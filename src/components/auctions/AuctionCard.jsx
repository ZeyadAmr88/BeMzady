import { Link } from "react-router-dom";
import { FaClock, FaHammer, FaFire, FaTag } from "react-icons/fa";

const AuctionCard = ({ auction, isHot = false }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate time remaining
  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) {
      return "Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get the current price (highest bid or start price)
  const getCurrentPrice = () => {
    if (auction.bids && auction.bids.length > 0) {
      return (
        auction.currentPrice || auction.bids[auction.bids.length - 1].amount
      );
    }
    return auction.startPrice;
  };

  return (
    <div className="bg-surface rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105 relative">
      {/* Hot item badge */}
      {isHot && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-bl-lg z-10 flex items-center">
          <FaFire className="mr-1" />
          <span className="text-xs font-bold">HOT</span>
        </div>
      )}

      {/* Auction image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            auction.auctionCover ||
            (auction.auctionImages && auction.auctionImages.length > 0
              ? auction.auctionImages[0]
              : auction.images && auction.images.length > 0
              ? auction.images[0]
              : "https://via.placeholder.com/300x200?text=No+Image")
          }
          alt={auction.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-bold flex items-center">
              <FaClock className="mr-1 text-yellow-400" />
              {calculateTimeRemaining(auction.endDate)}
            </span>
            <span className="text-white text-sm font-bold flex items-center">
              <FaHammer className="mr-1 text-blue-400" />
              {auction.bids ? auction.bids.length : 0} bids
            </span>
          </div>
        </div>
      </div>

      {/* Auction details */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-text truncate">
          {auction.title}
        </h3>
        <p className="text-text-muted text-sm mb-3 line-clamp-2">
          {auction.description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-text-muted text-xs">Current Price</span>
            <p className="text-primary font-bold text-lg">
              {formatCurrency(getCurrentPrice())}
            </p>
          </div>
          {auction.buyNowPrice && (
            <div>
              <span className="text-text-muted text-xs">Buy Now</span>
              <p className="text-secondary font-bold">
                {formatCurrency(auction.buyNowPrice)}
              </p>
            </div>
          )}
        </div>

        {auction.category && (
          <div className="mb-3">
            <span className="inline-flex items-center bg-background-light text-text-muted text-xs px-2 py-1 rounded">
              <FaTag className="mr-1" />
              {auction.category.name}
            </span>
          </div>
        )}

        <Link
          to={`/auctions/${auction._id}`}
          className="btn btn-primary w-full text-center block"
        >
          View Auction
        </Link>
      </div>
    </div>
  );
};

export default AuctionCard;
