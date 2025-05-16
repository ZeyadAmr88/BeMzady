import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { itemService, userService } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { CartContext } from "../contexts/CartContext";
import { Heart, ShoppingCart, ArrowLeft, User, Loader, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import ItemReviews from "../items/ItemReviews";
import RecommendationList from "../recommendations/RecommendationList";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const { addToCart } = useContext(CartContext);
  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const response = await itemService.getItemById(id);
        const itemData = response.data.data;
        setItem(itemData);

        // Fetch owner information
        if (itemData.owner) {
          try {
            const ownerResponse = await userService.getUserById(itemData.owner);
            setOwner(ownerResponse.data.data);
          } catch (ownerError) {
            console.error("Error fetching owner details:", ownerError);
          }
        }

        // Check if item is in user's favorites
        if (user) {
          try {
            const favoritesResponse = await userService.getFavorites();
            const favorites = favoritesResponse.data.data || [];
            setIsFavorite(favorites.some((fav) => fav._id === id));
          } catch (favError) {
            console.error("Error checking favorites:", favError);
          }
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError("Failed to load item details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.info("Please log in to add items to favorites");
      return;
    }

    try {
      if (isFavorite) {
        await userService.removeFromFavorites(id);
        toast.success("Removed from favorites");
      } else {
        await userService.addToFavorites(id);
        toast.success("Added to favorites");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(
        error.response?.data?.message || "Failed to update favorites"
      );
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please log in to add items to cart");
      return;
    }

    setAddingToCart(true);
    try {
      const result = await addToCart(id, quantity);
      if (result) {
        toast.success("Item added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const shareItem = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-rose-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Item not found</p>
        <Link
          to="/items"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Link
          to="/items"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
            <img
              src={
                item.item_pictures?.[selectedImage] ||
                item.item_cover ||
                "/placeholder.svg"
              }
              alt={item.title}
              className="w-full h-96 object-contain"
            />
          </div>

          {item.item_pictures && item.item_pictures.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {item.item_pictures.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-md overflow-hidden border-2 ${selectedImage === index
                    ? "border-rose-500"
                    : darkMode
                      ? "border-gray-700"
                      : "border-gray-200"
                    }`}
                >
                  <img
                    src={image}
                    alt={`${item.title} - Image ${index + 1}`}
                    className="w-full h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{item.title}</h1>
              <div className="flex space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${isFavorite
                    ? "bg-rose-100 text-rose-600"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    } hover:bg-rose-100 hover:text-rose-600`}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    size={20}
                    className={isFavorite ? "fill-current" : ""}
                  />
                </button>
                <button
                  onClick={shareItem}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600"
                  aria-label="Share item"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                ${parseFloat(item.price).toFixed(2)}
              </span>
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {item.item_status}
              </span>
              {item.is_featured && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  Featured
                </span>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {owner && (
              <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h2 className="text-lg font-medium mb-2">Seller Information</h2>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                    {owner.profilePicture ? (
                      <img
                        src={owner.profilePicture}
                        alt={owner.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User
                        size={20}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{owner.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {owner.location || "Location not specified"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {item.item_status === "available" && (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-4 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`w-16 text-center py-2 border-y ${darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                        }`}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-r-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center disabled:opacity-70"
                >
                  {addingToCart ? (
                    <Loader size={20} className="animate-spin mr-2" />
                  ) : (
                    <ShoppingCart size={20} className="mr-2" />
                  )}
                  {addingToCart ? "Adding to Cart..." : "Add to Cart"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <ItemReviews itemId={id} />
      </div>

      {/* Add recommendations based on current item */}
      {item && item._id && (
        <RecommendationList
          itemId={item._id}
          title="Similar Items You Might Like"
          viewAllLink={`/auctions?category=${item.category}`}
        />
      )}

      {/* If you also want to show category-based recommendations */}
      {item && item.category && (
        <RecommendationList
          categoryId={item.category}
          title={`More Items in ${typeof item.category === 'object' ? item.category.name || 'This Category' : 'This Category'}`}
          viewAllLink={`/auctions?category=${typeof item.category === 'object' ? item.category._id : item.category}`}
        />
      )}
    </div>
  );
};

export default ItemDetail;
