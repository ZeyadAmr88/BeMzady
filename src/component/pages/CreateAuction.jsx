"use client"

import React, { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { auctionService, categoryService } from "../services/api"
import { toast } from "react-hot-toast"
import { handleApiError } from "../utils/errorHandler"
import { Upload, Calendar, DollarSign } from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"

const CreateAuction = () => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        startPrice: "",
        reservePrice: "",
        buyNowPrice: "",
        minimumBidIncrement: "",
        startDate: "",
        endDate: "",
        auctionCover: null,
        auctionImages: [],
    })
    const [previewCover, setPreviewCover] = useState(null)
    const [previewImages, setPreviewImages] = useState([])
    const [errors, setErrors] = useState({})

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 100 })
                setCategories(response.data.data || [])
            } catch (error) {
                console.error("Error fetching categories:", error)
                toast.error("Failed to load categories")
            }
        }

        fetchCategories()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target

        if (name === "auctionCover" && files[0]) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }))

            // Create preview URL for cover image
            const previewUrl = URL.createObjectURL(files[0])
            setPreviewCover(previewUrl)

            // Clear error
            if (errors.auctionCover) {
                setErrors((prev) => ({ ...prev, auctionCover: null }))
            }
        } else if (name === "auctionImages" && files.length > 0) {
            const selectedFiles = Array.from(files)
            setFormData((prev) => ({
                ...prev,
                [name]: [...prev.auctionImages, ...selectedFiles],
            }))

            // Create preview URLs for additional images
            const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
            setPreviewImages((prev) => [...prev, ...newPreviewUrls])
        }
    }

    const removeImage = (index, type) => {
        if (type === "cover") {
            setFormData((prev) => ({ ...prev, auctionCover: null }))
            setPreviewCover(null)
        } else {
            // Remove from both formData and previews
            setFormData((prev) => ({
                ...prev,
                auctionImages: prev.auctionImages.filter((_, i) => i !== index),
            }))

            setPreviewImages((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Required fields
        if (!formData.title) newErrors.title = "Title is required"
        if (!formData.description) newErrors.description = "Description is required"
        if (!formData.category) newErrors.category = "Category is required"
        if (!formData.startPrice) newErrors.startPrice = "Start price is required"
        if (!formData.reservePrice) newErrors.reservePrice = "Reserve price is required"
        if (!formData.buyNowPrice) newErrors.buyNowPrice = "Buy now price is required"
        if (!formData.minimumBidIncrement) newErrors.minimumBidIncrement = "Minimum bid increment is required"
        if (!formData.startDate) newErrors.startDate = "Start date is required"
        if (!formData.endDate) newErrors.endDate = "End date is required"
        if (!formData.auctionCover) newErrors.auctionCover = "Cover image is required"

        // Price validations
        if (Number(formData.reservePrice) <= Number(formData.startPrice)) {
            newErrors.reservePrice = "Reserve price must be higher than start price"
        }

        if (Number(formData.buyNowPrice) <= Number(formData.reservePrice)) {
            newErrors.buyNowPrice = "Buy now price must be higher than reserve price"
        }

        // Date validations
        const startDate = new Date(formData.startDate)
        const endDate = new Date(formData.endDate)
        const now = new Date()

        if (startDate <= now) {
            newErrors.startDate = "Start date must be in the future"
        }

        if (endDate <= startDate) {
            newErrors.endDate = "End date must be after start date"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Please fix the errors in the form")
            return
        }

        setLoading(true)

        try {
            // Create a FormData object to send to the backend
            const formDataToSend = new FormData()

            // Add all the text fields
            formDataToSend.append("title", formData.title)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("category", formData.category)
            formDataToSend.append("startPrice", formData.startPrice)
            formDataToSend.append("reservePrice", formData.reservePrice)
            formDataToSend.append("buyNowPrice", formData.buyNowPrice)
            formDataToSend.append("minimumBidIncrement", formData.minimumBidIncrement)
            formDataToSend.append("startDate", formData.startDate)
            formDataToSend.append("endDate", formData.endDate)

            // Add the seller ID
            const sellerId = user?._id || localStorage.getItem("user_id")
            formDataToSend.append("seller", sellerId)

            console.log("Creating auction with seller ID:", sellerId)

            // Add the cover image file directly
            if (formData.auctionCover) {
                formDataToSend.append("auctionCover", formData.auctionCover)
            }

            // Add additional image files directly
            if (formData.auctionImages && formData.auctionImages.length > 0) {
                for (let i = 0; i < formData.auctionImages.length; i++) {
                    formDataToSend.append("auctionImages", formData.auctionImages[i])
                }
            }

            // Send the FormData to the backend
            const response = await auctionService.createAuction(formDataToSend)
            toast.success("Auction created successfully!")
            navigate(`/auctions/${response.data._id}`)
        } catch (error) {
            console.error("Error creating auction:", error)
            const errorMessage = handleApiError(error, "Failed to create auction. Please try again.")
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Create New Auction</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                placeholder="Enter auction title"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                placeholder="Describe your auction item"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center text-gray-700 dark:text-gray-200">
                            <DollarSign size={20} className="mr-2" />
                            Pricing
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="startPrice"
                                        value={formData.startPrice}
                                        onChange={handleInputChange}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.startPrice ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.startPrice && <p className="mt-1 text-sm text-red-500">{errors.startPrice}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reserve Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="reservePrice"
                                        value={formData.reservePrice}
                                        onChange={handleInputChange}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.reservePrice ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.reservePrice && <p className="mt-1 text-sm text-red-500">{errors.reservePrice}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Buy Now Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="buyNowPrice"
                                        value={formData.buyNowPrice}
                                        onChange={handleInputChange}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.buyNowPrice ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.buyNowPrice && <p className="mt-1 text-sm text-red-500">{errors.buyNowPrice}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Minimum Bid Increment
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="minimumBidIncrement"
                                        value={formData.minimumBidIncrement}
                                        onChange={handleInputChange}
                                        className={`w-full pl-8 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.minimumBidIncrement ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.minimumBidIncrement && (
                                    <p className="mt-1 text-sm text-red-500">{errors.minimumBidIncrement}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center text-gray-700 dark:text-gray-200">
                            <Calendar size={20} className="mr-2" />
                            Auction Schedule
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                />
                                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                />
                                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center text-gray-700 dark:text-gray-200">
                            <Upload size={20} className="mr-2" />
                            Images
                        </h2>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Auction Cover Image <span className="text-red-500">*</span>
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-lg p-4 ${errors.auctionCover ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                            >
                                {previewCover ? (
                                    <div className="relative">
                                        <img
                                            src={previewCover || "/placeholder.svg"}
                                            alt="Cover preview"
                                            className="h-40 mx-auto object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(0, "cover")}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click or drag to upload cover image</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    name="auctionCover"
                                    onChange={handleFileChange}
                                    className={`w-full mt-2 ${previewCover ? "hidden" : ""}`}
                                    accept="image/*"
                                />
                            </div>
                            {errors.auctionCover && <p className="mt-1 text-sm text-red-500">{errors.auctionCover}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Additional Images (Optional)
                            </label>

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                {previewImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview || "/placeholder.svg"}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-24 w-full object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index, "additional")}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Click or drag to upload additional images
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    name="auctionImages"
                                    onChange={handleFileChange}
                                    className="w-full mt-2"
                                    accept="image/*"
                                    multiple
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/auctions")}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating Auction..." : "Create Auction"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateAuction
