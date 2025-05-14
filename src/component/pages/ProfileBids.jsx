"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bidService } from "../services/api";
import { AlertCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ProfileBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await bidService.getUserBids();
      setBids(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching bids:", error);
      setError("Failed to load your bids. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bids</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {bids.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No bids yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't placed any bids yet. Start by browsing our auctions!
          </p>
          <Link
            to="/auctions"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {bids.map((bid) => (
              <div key={bid._id} className="p-4">
                <div className="flex items-start">
                  <img
                    src={bid.auction.item_cover || "/placeholder.svg"}
                    alt={bid.auction.title}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{bid.auction.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your bid: ${bid.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Placed{" "}
                          {formatDistanceToNow(new Date(bid.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/auctions/${bid.auction._id}`}
                          className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2">
                      {bid.isWinning ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Currently Winning
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Outbid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBids;
