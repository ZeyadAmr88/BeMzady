"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { itemService } from "../services/api";
import ItemCard from "../items/ItemCard";
import { Loader } from "lucide-react";

const CategoryPage = () => {
    const { id } = useParams();
    const { darkMode } = useContext(ThemeContext);
    const [category, setCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryAndItems = async () => {
            try {
                setLoading(true);
                // Fetch category details
                const categoryResponse = await fetch(`https://be-mazady.vercel.app/api/categories/${id}`);
                const categoryData = await categoryResponse.json();
                setCategory(categoryData.data);

                // Fetch items in this category
                const itemsResponse = await itemService.getItems({ category: id });
                // Ensure we're setting an array
                const itemsData = Array.isArray(itemsResponse.data) ? itemsResponse.data :
                    Array.isArray(itemsResponse) ? itemsResponse : [];
                setItems(itemsData);
                setError(null);
            } catch (error) {
                console.error("Error fetching category data:", error);
                setError("Failed to load category data");
                setItems([]); // Reset items to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryAndItems();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-rose-600 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-rose-600 mb-2">Category Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400">The requested category could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Category Header */}
            <div className="mb-8">
                <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                    <img
                        src={category.categoryImage}
                        alt={category.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
                        <p className="text-gray-200">{items.length} items available</p>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.isArray(items) && items.map((item) => (
                    <ItemCard key={item._id} item={item} />
                ))}
            </div>

            {/* Empty State */}
            {(!Array.isArray(items) || items.length === 0) && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No Items Available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        There are currently no items in this category.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;

