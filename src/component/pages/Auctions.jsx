"use client"

import React, { useState, useEffect } from "react"
import AuctionCard from "../auctions/AuctionCard"
import { ChevronDown, ChevronUp, Filter, Check } from "lucide-react"

// Custom Select Component
const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (optionValue) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{options.find((option) => option.value === value)?.label || "Select option"}</span>
                <ChevronDown className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${value === option.value ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// Custom Checkbox Component
const CustomCheckbox = ({ id, checked, onChange }) => {
    return (
        <div className="relative flex items-center">
            <input type="checkbox" id={id} checked={checked} onChange={onChange} className="sr-only" />
            <div
                className={`w-5 h-5 border rounded flex items-center justify-center ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                onClick={onChange}
            >
                {checked && <Check className="h-3 w-3 text-white" />}
            </div>
        </div>
    )
}

// Custom Label Component
const CustomLabel = ({ htmlFor, children }) => {
    return (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2 cursor-pointer">
            {children}
        </label>
    )
}

const Auctions = () => {
    const [auctions, setAuctions] = useState([])
    const [filteredAuctions, setFilteredAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categories, setCategories] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [sortOption, setSortOption] = useState("newest")
    const [showFilters, setShowFilters] = useState(false)

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://be-mazady.vercel.app/api/categories")
                const data = await response.json()

                if (data.data && Array.isArray(data.data)) {
                    setCategories(data.data)
                } else {
                    console.error("Invalid categories response format:", data)
                }
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }

        fetchCategories()
    }, [])

    // Fetch auctions
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                setLoading(true)
                const response = await fetch("https://be-mazady.vercel.app/api/auctions")
                const data = await response.json()

                if (data.status === "success" && data.data) {
                    setAuctions(data.data)
                    setFilteredAuctions(data.data)
                    setError(null)
                } else {
                    console.error("Invalid auctions response format:", data)
                    setError("Invalid response format from server")
                    setAuctions([])
                    setFilteredAuctions([])
                }
            } catch (error) {
                console.error("Error fetching auctions:", error)
                setError(error.message || "Failed to load auctions")
                setAuctions([])
                setFilteredAuctions([])
            } finally {
                setLoading(false)
            }
        }

        fetchAuctions()
    }, [])

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...auctions]

        // Apply category filter
        if (selectedCategories.length > 0) {
            result = result.filter((auction) =>
                selectedCategories.includes(auction.category?._id)
            )
        }

        // Apply sorting
        switch (sortOption) {
            case "priceAsc":
                result.sort((a, b) => a.startPrice - b.startPrice)
                break
            case "priceDesc":
                result.sort((a, b) => b.startPrice - a.startPrice)
                break
            case "newest":
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
            case "endingSoon":
                result.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
                break
            default:
                break
        }

        setFilteredAuctions(result)
    }, [auctions, selectedCategories, sortOption])

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories((prev) => {
            if (prev.includes(categoryId)) {
                return prev.filter((id) => id !== categoryId)
            } else {
                return [...prev, categoryId]
            }
        })
    }

    const handleSortChange = (value) => {
        setSortOption(value)
    }

    const clearFilters = () => {
        setSelectedCategories([])
        setSortOption("newest")
    }

    const toggleFilters = () => {
        setShowFilters((prev) => !prev)
    }

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "priceAsc", label: "Price: Low to High" },
        { value: "priceDesc", label: "Price: High to Low" },
        { value: "endingSoon", label: "Ending Soon" },
    ]

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 dark:text-red-400 text-center">{error}</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden w-full mb-4">
                    <button
                        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                        onClick={toggleFilters}
                    >
                        <span className="flex items-center">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters & Sort
                        </span>
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Sidebar Filters */}
                <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 space-y-6`}>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Sort By</h2>
                        <CustomSelect value={sortOption} onChange={handleSortChange} options={sortOptions} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category._id} className="flex items-center">
                                    <CustomCheckbox
                                        id={`category-${category._id}`}
                                        checked={selectedCategories.includes(category._id)}
                                        onChange={() => handleCategoryChange(category._id)}
                                    />
                                    <CustomLabel htmlFor={`category-${category._id}`}>
                                        {category.name}
                                    </CustomLabel>
                                </div>
                            ))}
                        </div>
                        {selectedCategories.length > 0 && (
                            <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Auctions Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">All Auctions</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredAuctions.length} {filteredAuctions.length === 1 ? "auction" : "auctions"} found
                        </p>
                    </div>

                    {filteredAuctions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No auctions found matching your filters.</p>
                            <button className="mt-2 text-blue-600 dark:text-blue-400 hover:underline" onClick={clearFilters}>
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAuctions.map((auction) => (
                                <AuctionCard key={auction._id} auction={auction} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Auctions
