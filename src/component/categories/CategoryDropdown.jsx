import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { categoryService } from "../services/api";
import { ThemeContext } from "../contexts/ThemeContext";

const CategoryDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const { darkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getCategories({ limit: 100 });
                console.log("Categories response:", response);
                if (response.data && response.data.data) {
                    setCategories(response.data.data);
                } else {
                    console.error("Invalid categories response format:", response);
                    setError("Invalid response format from server");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError(error.response?.data?.message || "Failed to load categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category) => {
        if (expandedCategory === category._id) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category._id);
        }
    };

    const handleSubcategoryClick = (category, subcategory) => {
        navigate(`/auctions?category=${category._id}&subcategory=${subcategory._id}`);
    };

    const handleCategorySelect = (category) => {
        navigate(`/auctions?category=${category._id}`);
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className={`w-64 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg overflow-hidden`}>
            <div className="p-2">
                <h3 className="text-lg font-semibold mb-2 px-2 py-1 text-gray-800 dark:text-gray-200">
                    Categories
                </h3>
                <div className="space-y-1">
                    {categories.map((category) => (
                        <div key={category._id} className="relative">
                            <button
                                onClick={() => handleCategoryClick(category)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${darkMode
                                    ? "hover:bg-gray-700 text-gray-200"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                <span className="flex items-center">
                                    {category.categoryImage && (
                                        <img
                                            src={category.categoryImage}
                                            alt={category.name}
                                            className="w-5 h-5 mr-2 object-contain"
                                        />
                                    )}
                                    {category.name}
                                </span>
                                {category.subcategories && category.subcategories.length > 0 && (
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform ${expandedCategory === category._id ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </button>

                            {/* Subcategories dropdown */}
                            {expandedCategory === category._id && category.subcategories && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {category.subcategories.map((subcategory) => (
                                        <button
                                            key={subcategory._id}
                                            onClick={() => handleSubcategoryClick(category, subcategory)}
                                            className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${darkMode
                                                ? "hover:bg-gray-700 text-gray-300"
                                                : "hover:bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <ChevronRight size={14} className="mr-1" />
                                            {subcategory.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryDropdown; 