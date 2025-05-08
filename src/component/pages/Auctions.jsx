"use client"

import React, { useState, useEffect, useContext } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { auctionService, categoryService, userService } from "../services/api"
import { Search, Filter, ChevronDown, X, SlidersHorizontal, Clock, ArrowUpDown } from "lucide-react"
import AuctionCard from "../auctions/AuctionCard"
import { toast } from "react-hot-toast"
import { AuthContext } from "../contexts/AuthContext"

const Auctions = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [auctions, setAuctions] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalPages, setTotalPages] = useState(1)
    const [showFilters, setShowFilters] = useState(false)
    const [changingRole, setChangingRole] = useState(false)

    const handleCreateAuction = async () => {
        try {
            setChangingRole(true)
            // Update user role to seller before navigating to create auction
            const response = await userService.updateRole("seller")
            console.log("response role", response);
            
            toast.success("Your account has been upgraded to seller status!")
            navigate("/auctions/create")
        } catch (error) {
            console.error("Error updating user role:", error)
            toast.error("Failed to update your account status. Please try again.")
        } finally {
            setChangingRole(false)
        }
    }
    // Filter states
    const [filters, setFilters] = useState({
        keyword: searchParams.get("keyword") || "",
        category: searchParams.get("category") || "",
        status: searchParams.get("status") || "all",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        sort: searchParams.get("sort") || "createdAt",
        page: Number.parseInt(searchParams.get("page") || "1"),
        limit: 12,
    })

    // Sort options
    const sortOptions = [
        { value: "createdAt", label: "Newest" },
        { value: "endDate", label: "Ending Soon" },
        { value: "currentPrice", label: "Price: Low to High" },
        { value: "-currentPrice", label: "Price: High to Low" },
    ]

    // Status options
    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "ended", label: "Ended" },
        { value: "all", label: "All" },
    ]

    useEffect(() => {
        // Fetch categories for filter
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 5 })
                console.log("res", response)
                setCategories(response.data.data)
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        // Fetch auctions based on filters
        const fetchAuctions = async () => {
            setLoading(true)
            setError(null)

            try {
                // Remove empty filters
                const queryParams = Object.fromEntries(
                    // eslint-disable-next-line no-unused-vars
                    Object.entries(filters).filter(([_, value]) => value !== "" && value !== null),
                )

                const response = await auctionService.getAuctions(queryParams)
                setAuctions(response.data.data)
                console.log("auction response", response);


                // Calculate total pages
                const total = response.data.totalAuctions || 0
                const limit = filters.limit
                setTotalPages(Math.ceil(total / limit))
            } catch (error) {
                console.error("Error fetching auctions:", error)
                setError("Failed to load auctions. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchAuctions()
    }, [filters])

    // Update URL with filters
    useEffect(() => {
        const queryParams = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== null && key !== "limit") {
                queryParams.set(key, value)
            }
        })

        navigate(`/auctions?${queryParams.toString()}`, { replace: true })
    }, [filters, navigate])

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            // Reset page when changing filters
            ...(name !== "page" && { page: 1 }),
        }))
    }

    const clearFilters = () => {
        setFilters({
            keyword: "",
            category: "",
            status: "all",
            minPrice: "",
            maxPrice: "",
            sort: "createdAt",
            page: 1,
            limit: 12,
        })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const searchInput = e.target.elements.search.value
        handleFilterChange("keyword", searchInput)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Explore Auctions</h1>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search auctions..."
                            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            defaultValue={filters.keyword}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Search
                        </button>
                    </div>
                </form>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                    </button>

                    <div className="relative">
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange("sort", e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <ArrowUpDown size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <SlidersHorizontal size={18} className="mr-2" /> Advanced Filters
                        </h2>
                        <button onClick={clearFilters} className="text-rose-600 hover:text-rose-700 text-sm flex items-center">
                            <X size={16} className="mr-1" /> Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange("category", e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Price Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters */}
            {(filters.keyword || filters.category || filters.status !== "all" || filters.minPrice || filters.maxPrice) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {filters.keyword && (
                        <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full text-sm flex items-center">
                            Search: {filters.keyword}
                            <button
                                onClick={() => handleFilterChange("keyword", "")}
                                className="ml-2 text-rose-600 hover:text-rose-800"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {filters.category && (
                        <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full text-sm flex items-center">
                            Category: {categories.find((c) => c._id === filters.category)?.name || "Selected"}
                            <button
                                onClick={() => handleFilterChange("category", "")}
                                className="ml-2 text-rose-600 hover:text-rose-800"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {filters.status !== "all" && (
                        <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full text-sm flex items-center">
                            Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                            <button
                                onClick={() => handleFilterChange("status", "all")}
                                className="ml-2 text-rose-600 hover:text-rose-800"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {(filters.minPrice || filters.maxPrice) && (
                        <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full text-sm flex items-center">
                            Price: {filters.minPrice || "0"} - {filters.maxPrice || "Any"}
                            <button
                                onClick={() => {
                                    handleFilterChange("minPrice", "")
                                    handleFilterChange("maxPrice", "")
                                }}
                                className="ml-2 text-rose-600 hover:text-rose-800"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">{error}</div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                </div>
            ) : auctions.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No auctions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Try adjusting your filters or check back later for new auctions.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Auctions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {console.log(auctions)}
                        {auctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />

                        ))}
                    </div>

                    <button
                        onClick={handleCreateAuction}
                        disabled={changingRole}
                        className="bg-rose-600 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {changingRole ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Upgrading Account...
                            </span>
                        ) : "Create Auction"}
                    </button>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                                    disabled={filters.page === 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show pages around current page
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (filters.page <= 3) {
                                        pageNum = i + 1
                                    } else if (filters.page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = filters.page - 2 + i
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handleFilterChange("page", pageNum)}
                                            className={`px-4 py-2 border rounded-md ${pageNum === filters.page
                                                ? "bg-rose-600 text-white border-rose-600"
                                                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}

                                <button
                                    onClick={() => handleFilterChange("page", Math.min(totalPages, filters.page + 1))}
                                    disabled={filters.page === totalPages}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Auctions
