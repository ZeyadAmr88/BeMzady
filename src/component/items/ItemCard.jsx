"use client";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

const ItemCard = ({ item }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <Link
      to={`/items/${item._id}`}
      className={`block group rounded-lg overflow-hidden transition-all duration-300 ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
        } shadow-sm hover:shadow-md h-full`}
    >
      {/* Item Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.item_cover || "https://via.placeholder.com/400"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.status === "sold" && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            Sold
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-5 space-y-3">
        <h3 className={`font-semibold line-clamp-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          {item.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Category
          </span>
          <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} ml-5`}>
            {item.category?.name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Price
          </span>
          <span className="font-semibold text-rose-600">
            ${item.price?.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Status
          </span>
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${item.item_status === 'available'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            }`}>
            {item.item_status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
