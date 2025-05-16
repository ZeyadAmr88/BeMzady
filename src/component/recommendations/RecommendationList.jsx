import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { recommendationService } from "../services/api";

const RecommendationList = ({
    itemId,
    categoryId,
    limit = 6,
    title = "Recommended For You",
    showViewAll = true,
    viewAllLink = "/auctions"
}) => {
    const { darkMode } = useContext(ThemeContext);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                let response;
                if (itemId) {
                    console.log("Fetching recommendations for item:", itemId);
                    response = await recommendationService.getRecommendationsByItem(itemId);
                } else if (categoryId) {
                    const categoryIdValue = typeof categoryId === 'object' && categoryId._id ?
                        categoryId._id : categoryId;
                    console.log("Fetching recommendations for category:", categoryIdValue);
                    response = await recommendationService.getRecommendationsByCategory(categoryIdValue);
                } else {
                    console.log("Fetching general recommendations");
                    response = await recommendationService.getRecommendationsWithFilters({
                        limit,
                        sort: "createdAt:-1"
                    });
                }

                console.log("Recommendation response:", response);

                // Handle different response formats
                let recommendationsData = [];
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        recommendationsData = response.data;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        recommendationsData = response.data.data;
                    } else if (response.data.items && Array.isArray(response.data.items)) {
                        recommendationsData = response.data.items;
                    }
                }

                console.log("Processed recommendations:", recommendationsData);
                setRecommendations(recommendationsData);
                setError(null);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError("Unable to load recommendations");
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [itemId, categoryId, limit]);

    if (loading) {
        return (
            <div className="my-8">
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <div
                            key={i}
                            className={`animate-pulse rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
                        >
                            <div className={`h-40 mb-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                            <div className={`h-4 w-2/3 mb-2 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                            <div className={`h-4 w-1/3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-8">
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {title}
                </h2>
                <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900/20 text-red-200" : "bg-red-100 text-red-600"}`}>
                    {error}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null; // Don't render anything if no recommendations
    }

    return (
        <div className="my-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {title}
                </h2>
                {showViewAll && (
                    <Link
                        to={viewAllLink}
                        className={`text-sm font-medium ${darkMode ? "text-rose-400 hover:text-rose-300" : "text-rose-600 hover:text-rose-500"}`}
                    >
                        View All
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recommendations.map((item) => (
                    <Link
                        key={item._id}
                        to={`/item/${item._id}`}
                        className={`group block rounded-lg overflow-hidden transition-all duration-200 shadow hover:shadow-md ${darkMode
                            ? "bg-gray-800 hover:bg-gray-750"
                            : "bg-white hover:bg-gray-50"
                            }`}
                    >
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                            <img
                                src={item.images?.[0] || item.item_pictures?.[0] || item.item_cover || "/placeholder-item.png"}
                                alt={item.name || item.title}
                                className="h-48 w-full object-cover object-center group-hover:opacity-90 transition-opacity"
                            />
                        </div>
                        <div className="p-3">
                            <h3 className={`text-sm font-medium truncate ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                {item.name || item.title}
                            </h3>
                            <p className={`mt-1 text-sm font-semibold ${darkMode ? "text-rose-400" : "text-rose-600"}`}>
                                ${item.price ? item.price.toFixed(2) : "N/A"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecommendationList; 