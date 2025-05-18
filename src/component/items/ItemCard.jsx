import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { userService } from "../services/api";
import { toast } from "react-toastify";

const ItemCard = ({ item }) => {
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(
    item.favorites?.includes(user?._id)
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please log in to add items to favorites");
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        await userService.removeFromFavorites(item._id);
        toast.success("Removed from favorites");
      } else {
        await userService.addToFavorites(item._id);
        toast.success("Added to favorites");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(
        error.response?.data?.message || "Failed to update favorites"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/items/${item._id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative">
          <img
            src={item.images?.[0] || item.item_cover || "/placeholder.svg?height=200&width=300"}
            alt={item.title}
            className="w-full h-40 sm:h-48 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg?height=200&width=300";
            }}
          />
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full ${isFavorite
                ? "bg-rose-100 text-rose-600"
                : "bg-gray-100 text-gray-500"
              } hover:bg-rose-100 hover:text-rose-600 transition-colors`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              className={isFavorite ? "fill-current" : ""}
            />
          </button>
          {item.is_featured && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md">
              Featured
            </div>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="mt-auto pt-2 flex justify-between items-center">
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              ${parseFloat(item.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {item.item_status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
