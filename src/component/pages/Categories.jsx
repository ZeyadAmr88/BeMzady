"use client"
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"
import { categoryService } from "../services/api"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const Categories = () => {
    const { darkMode } = useContext(ThemeContext)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(8) // Number of categories per page

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const response = await categoryService.getCategories({
                    page: currentPage,
                    limit: limit
                })

                console.log("Categories response:", response.data)
                setCategories(response.data.data)

                // Calculate total pages
                const totalCategories = response.data.totalCategories || response.data.total || 0
                setTotalPages(Math.ceil(totalCategories / limit))

                setError(null)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setError("Failed to load categories. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [currentPage, limit])

    // Initial loading state
    if (loading && categories.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                    All Categories
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Browse through our wide range of auction categories
                </p>
            </div>

            <div className="relative">
                {/* Loading overlay for pagination */}
                {loading && categories.length > 0 && (
                    <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/category/${category._id}`}
                            className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${darkMode
                                ? "bg-gray-800/50 hover:bg-gray-700/50"
                                : "bg-white/50 hover:bg-gray-50/50"
                                } shadow-sm hover:shadow-md`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300">
                                    {category.name}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {category.description || "Explore items in this category"}
                                </p>
                                <div className="mt-4 flex items-center text-sm text-rose-600 dark:text-rose-400">
                                    <span>View Auctions</span>
                                    <svg
                                        className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${darkMode
                                ? "bg-gray-800 text-gray-300 disabled:bg-gray-900 disabled:text-gray-700"
                                : "bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                                } border ${darkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                                } disabled:cursor-not-allowed`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex space-x-1">
                            {(() => {
                                // Create a smart pagination that shows current page, first, last, and some pages around current
                                const pageButtons = [];
                                const maxVisiblePages = 5; // Maximum number of page buttons to show

                                // Always show first page
                                if (totalPages > 0) {
                                    pageButtons.push(
                                        <button
                                            key={1}
                                            onClick={() => setCurrentPage(1)}
                                            className={`w-10 h-10 rounded-md ${currentPage === 1
                                                    ? "bg-rose-600 text-white"
                                                    : darkMode
                                                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                                } border ${darkMode
                                                    ? "border-gray-700"
                                                    : "border-gray-200"
                                                }`}
                                        >
                                            1
                                        </button>
                                    );
                                }

                                // Add ellipsis if needed
                                if (currentPage > 3) {
                                    pageButtons.push(
                                        <span key="ellipsis1" className="flex items-center justify-center w-10 h-10">...</span>
                                    );
                                }

                                // Add pages around current page
                                const startPage = Math.max(2, currentPage - 1);
                                const endPage = Math.min(totalPages - 1, currentPage + 1);

                                for (let i = startPage; i <= endPage; i++) {
                                    if (i > 1 && i < totalPages) {
                                        pageButtons.push(
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i)}
                                                className={`w-10 h-10 rounded-md ${currentPage === i
                                                        ? "bg-rose-600 text-white"
                                                        : darkMode
                                                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                                    } border ${darkMode
                                                        ? "border-gray-700"
                                                        : "border-gray-200"
                                                    }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }
                                }

                                // Add ellipsis if needed
                                if (currentPage < totalPages - 2) {
                                    pageButtons.push(
                                        <span key="ellipsis2" className="flex items-center justify-center w-10 h-10">...</span>
                                    );
                                }

                                // Always show last page if there is more than one page
                                if (totalPages > 1) {
                                    pageButtons.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                            className={`w-10 h-10 rounded-md ${currentPage === totalPages
                                                    ? "bg-rose-600 text-white"
                                                    : darkMode
                                                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                                } border ${darkMode
                                                    ? "border-gray-700"
                                                    : "border-gray-200"
                                                }`}
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pageButtons;
                            })()}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${darkMode
                                ? "bg-gray-800 text-gray-300 disabled:bg-gray-900 disabled:text-gray-700"
                                : "bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                                } border ${darkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                                } disabled:cursor-not-allowed`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Categories