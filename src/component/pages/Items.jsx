"use client"

import React, { useState, useEffect, useContext } from "react"
import { itemService } from "../services/api"
import { ThemeContext } from "../contexts/ThemeContext"
import ItemCard from "../items/ItemCard"
import { Search, Filter, X, Loader, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useSearchParams } from "react-router-dom"

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
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find((option) => option.value === value)?.label || "Select option"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"} ${value === option.value ? (darkMode ? "bg-gray-600" : "bg-gray-50") : ""}`}
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
        className={`w-5 h-5 border rounded flex items-center justify-center ${checked ? "bg-rose-600 border-rose-600" : `border-gray-300 ${darkMode ? "bg-gray-700" : "bg-white"} ${darkMode ? "border-gray-600" : ""}`}`}
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
    <label htmlFor={htmlFor} className={`text-sm font-medium ml-2 cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [sortOption, setSortOption] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl])
    }
  }, [searchParams])

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [sortOption, selectedCategories])

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://be-mazady.vercel.app/api/categories")
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        const uniqueCategories = Array.from(
          new Map(data.data.map(category => [category._id, category])).values()
        )
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchItems = async () => {
    if (isInitialLoad) {
      setLoading(true)
    }
    try {
      const params = {
        sort: `${sortOption === "desc" ? "-" : ""}${sortOption}`,
      }

      if (searchQuery) {
        params.keyword = searchQuery
      }

      if (selectedCategories.length > 0) {
        selectedCategories.forEach((categoryId, index) => {
          params[`category[${index}]`] = categoryId
        })
      }

      params.fields = "title,description,price,category,images,item_cover,status,createdAt,item_status,is_featured,favorites"

      const response = await itemService.getItems(params)

      if (response.data) {
        setItems(response.data.data || [])
      } else {
        setItems([])
        console.error("Invalid response format:", response)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items. Please try again later.")
      setItems([])
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchItems()
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

  const handleSortChange = (value) => {
    setSortOption(value)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSortOption("newest")
    setSearchQuery("")
    fetchItems()
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "priceAsc", label: "Price: Low to High" },
    { value: "priceDesc", label: "Price: High to Low" },
    { value: "titleAsc", label: "Title: A-Z" },
    { value: "titleDesc", label: "Title: Z-A" },
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
            className={`w-full flex items-center justify-between px-4 py-2 ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"} border rounded-md shadow-sm`}
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
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
            <h2 className="text-lg font-semibold mb-4">Sort By</h2>
            <CustomSelect value={sortOption} onChange={handleSortChange} options={sortOptions} />
          </div>

          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow`}>
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
              <button className="mt-4 text-sm text-rose-600 dark:text-rose-400 hover:underline" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Items</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {items.length} {items.length === 1 ? "item" : "items"} found
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSearch(e);
          }} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-3.5 pl-12 rounded-xl border ${darkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-rose-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-rose-500"
                  } focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-200`}
              />
              <Search
                size={20}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${darkMode
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-rose-600 hover:bg-rose-700"
                  } text-white transition-colors duration-200`}
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No items found matching your filters.</p>
              <button className="mt-2 text-rose-600 dark:text-rose-400 hover:underline" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Items
