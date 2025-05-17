"use client"

import React, { useState, useEffect, useContext } from "react"
import { itemService } from "../services/api"
import { ThemeContext } from "../contexts/ThemeContext"
import ItemCard from "../items/ItemCard"
import { Search, Filter, X, Loader, Check, ChevronDown, ChevronUp } from "lucide-react"

// Custom Select Component
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { darkMode } = useContext(ThemeContext)

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find((option) => option.value === value)?.label || "Select option"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
            }`}
        >
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                  } ${value === option.value ? (darkMode ? "bg-gray-600" : "bg-gray-50") : ""}`}
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
  const { darkMode } = useContext(ThemeContext)

  return (
    <div className="relative flex items-center">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="sr-only" />
      <div
        className={`w-5 h-5 border rounded flex items-center justify-center ${checked
          ? "bg-rose-600 border-rose-600"
          : `border-gray-300 ${darkMode ? "bg-gray-700" : "bg-white"} ${darkMode ? "border-gray-600" : ""}`
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
  const { darkMode } = useContext(ThemeContext)

  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium ml-2 cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"}`}
    >
      {children}
    </label>
  )
}

const Items = () => {
  const { darkMode } = useContext(ThemeContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [showFilters, setShowFilters] = useState(false)

  // New state for categories
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [filters.sortBy, filters.sortOrder])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://be-mazady.vercel.app/api/categories")
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        setCategories(data.data)
      } else {
        console.error("Invalid categories response format:", data)
        // Extract unique categories from items as fallback
        const uniqueCategories = [...new Set(items.map((item) => item.category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Extract unique categories from items as fallback
      const uniqueCategories = [...new Set(items.map((item) => item.category))]
      setCategories(uniqueCategories)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {
        sort: `${filters.sortOrder === "desc" ? "-" : ""}${filters.sortBy}`,
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      if (filters.status) {
        params.status = filters.status
      }

      if (filters.minPrice) {
        params.minPrice = filters.minPrice
      }

      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice
      }

      // Add category filter
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(",")
      }

      const response = await itemService.getItems(params)
      setItems(response.data.data || [])

      // If we didn't fetch categories separately, extract them from items
      if (categories.length === 0) {
        const uniqueCategories = [...new Set(response.data.data.map((item) => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSortChange = (e) => {
    const value = e.target.value
    const [sortBy, sortOrder] = value.split("-")
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }))
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    setSelectedCategories([])
    setSearchQuery("")
    fetchItems()
  }

  // Filter items based on selected categories (client-side filtering as backup)
  const filteredItems =
    selectedCategories.length > 0 ? items.filter((item) => selectedCategories.includes(item.category?._id)) : items

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Items</h1>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Browse through our collection of items</p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-grow flex items-center relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            />
            <Search size={18} className="absolute left-3 text-gray-400" />
            <button type="submit" className="absolute right-3 bg-rose-600 text-white p-1 rounded-md hover:bg-rose-700">
              <Search size={16} />
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                } hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              <Filter size={18} />
              Filters
            </button>

            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={handleSortChange}
              className={`px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-rose-500`}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div
            className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} border ${darkMode ? "border-gray-600" : "border-gray-300"
              } shadow-sm`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filter Options</h3>
              <button
                onClick={() => setShowFilters(false)}
                className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : ""}`}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={`w-full p-2 rounded-lg border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : ""}`}>Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min Price"
                  className={`w-full p-2 rounded-lg border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : ""}`}>Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max Price"
                  className={`w-full p-2 rounded-lg border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-rose-500`}
                />
              </div>
            </div>

            {/* Category Filter Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : ""}`}>Categories</label>
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {showCategoryFilter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showCategoryFilter && (
                <div
                  className={`p-2 border rounded-lg mt-1 max-h-48 overflow-y-auto ${darkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                    }`}
                >
                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <CustomCheckbox
                            id={`category-${category._id}`}
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryChange(category._id)}
                          />
                          <CustomLabel htmlFor={`category-${category._id}`}>{category.name}</CustomLabel>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No categories available</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={clearFilters}
                className={`px-4 py-2 border rounded-lg ${darkMode ? "border-gray-600 hover:bg-gray-600" : "border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Clear Filters
              </button>
              <button onClick={fetchItems} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={32} className="animate-spin text-rose-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchItems} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No items found</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mb-6`}>
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {(selectedCategories.length > 0 || searchQuery || filters.status || filters.minPrice || filters.maxPrice) && (
            <button onClick={clearFilters} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredItems.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Items
