"use client";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";

const ItemCard = ({ item }) => {
  const { darkMode } = useContext(ThemeContext);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-500/90 text-white';
      case 'sold':
      case 'unavailable':
        return 'bg-red-500/90 text-white';
      case 'pending':
        return 'bg-yellow-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <Link
      to={`/items/${item._id}`}
      className={`block rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} border ${darkMode ? "border-gray-700" : "border-gray-200"} transition-all duration-300 hover:border-rose-500/50`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden group">
        <img
          src={item.item_cover || item.images?.[0] || "https://via.placeholder.com/300"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status || item.item_status)}`}>
          {formatStatus(item.status || item.item_status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Title and Category */}
        <div className="space-y-1.5">
          <h3 className={`font-semibold text-sm sm:text-base line-clamp-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {item.title}
          </h3>
          <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {item.category?.name || "Uncategorized"}
          </p>
        </div>

        {/* Price and Actions */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Price</span>
            <div className="text-rose-600 font-semibold text-sm sm:text-base">
              {item.price?.toFixed(2)} EGP
            </div>
          </div>

          
          
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
