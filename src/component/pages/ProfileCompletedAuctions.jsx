import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

const ProfileCompletedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCompletedAuctions();
  }, [currentPage]);

  const fetchCompletedAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://be-mazady.vercel.app/api/analytics/seller/my-auctions?status=completed&page=${currentPage}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAuctions(response.data.data || []);
      setTotalPages(Math.ceil(response.data.total / 5));
      setError(null);
    } catch (error) {
      console.error("Error fetching completed auctions:", error);
      setError("Failed to load your completed auctions. Please try again.");
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
      <h1 className="text-2xl font-bold mb-6">Completed Auctions</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No completed auctions found.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {auctions.map((auction) => (
              <div key={auction._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={auction.item_cover || "/placeholder.svg"}
                      alt={auction.title}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-lg mb-1">
                        {auction.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Final Price: ${auction.final_price?.toFixed(2) || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed{" "}
                        {formatDistanceToNow(new Date(auction.end_date), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/auctions/${auction._id}`}
                    className="flex items-center text-rose-600 hover:text-rose-700"
                  >
                    <Eye size={18} className="mr-1" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ProfileCompletedAuctions;
