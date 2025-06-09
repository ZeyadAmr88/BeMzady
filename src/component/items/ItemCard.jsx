"use client";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";

const ItemCard = ({ item }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <Link
      to={`/items/${item._id}`}
      className={`block group rounded-lg overflow-hidden transition-all duration-300 ${darkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-white hover:bg-gray-50"
        } shadow-sm hover:shadow-md`}
    >
      {/* Item Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.images?.[0] || "https://via.placeholder.com/400"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.status === "sold" && (
          <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Sold
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h3 className={`font-semibold mb-2 line-clamp-2 ${darkMode ? "text-gray-100" : "text-gray-900"
          }`}>
          {item.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
            Current Bid
          </span>
          <span className="font-semibold text-rose-600">
            ${item.currentPrice?.toFixed(2) || item.startingPrice?.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
            {item.endDate ? (
              <>
                Ends {formatDistanceToNow(new Date(item.endDate), { addSuffix: true })}
              </>
            ) : (
              "No end date"
            )}
          </span>
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
            {item.bidCount || 0} bids
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
