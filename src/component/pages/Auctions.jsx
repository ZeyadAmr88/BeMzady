"use client"

import React, { useState, useEffect, useContext } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { auctionService, categoryService, userService } from "../services/api"
import { Search, Filter, ChevronDown, X, SlidersHorizontal, Clock, ArrowUpDown } from "lucide-react"
import AuctionCard from "../auctions/AuctionCard"
import { toast } from "react-hot-toast"
import { AuthContext } from "../contexts/AuthContext"
import CategoryDropdown from "../categories/CategoryDropdown"

const Auctions = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    // eslint-disable-next-line no-unused-vars
    const { user } = useContext(AuthContext)
    const [auctions, setAuctions] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null)
    const [totalPages, setTotalPages] = useState(1)
    const [showFilters, setShowFilters] = useState(false)
    const [changingRole, setChangingRole] = useState(false)
    const categoryId = searchParams.get("category")
    const subcategoryId = searchParams.get("subcategory")

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
        const fetchAuctions = async () => {
            try {
                setLoading(true)
                let response

                if (categoryId && subcategoryId) {
                    // Fetch auctions by category and subcategory
                    response = await auctionService.getAuctions({
                        category: categoryId,
                        subcategory: subcategoryId
                    })
                } else if (categoryId) {
                    // Fetch auctions by category only
                    response = await auctionService.getAuctions({
                        category: categoryId
                    })
                } else {
                    // Fetch all auctions
                    response = await auctionService.getAuctions()
                }

                setAuctions(response.data.data || [])
                setError(null)

                // Calculate total pages
                const total = response.data.totalAuctions || 0
                const limit = filters.limit
                setTotalPages(Math.ceil(total / limit))
            } catch (error) {
                console.error("Error fetching auctions:", error)
                setError("Failed to load auctions")
                setAuctions([])
            } finally {
                setLoading(false)
            }
        }

        fetchAuctions()
    }, [categoryId, subcategoryId, filters.limit])

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
                <div className="text-red-500 dark:text-red-400 text-center">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
                {/* Category Dropdown */}
                <div className="w-64 flex-shrink-0">
                    <CategoryDropdown />
                </div>

                {/* Auctions Grid */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6">
                        {categoryId && subcategoryId
                            ? "Filtered Auctions"
                            : categoryId
                                ? "Category Auctions"
                                : "All Auctions"}
                    </h1>

                    {auctions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">
                                No auctions found.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {auctions.map((auction) => (
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