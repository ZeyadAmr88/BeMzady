"use client"
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"
import { categoryService } from "../services/api"
import { Loader2 } from "lucide-react"

const Categories = () => {
    const { darkMode } = useContext(ThemeContext)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories()
                setCategories(response.data.data)
                setError(null)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setError("Failed to load categories. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    if (loading) {
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
    )
}

export default Categories 