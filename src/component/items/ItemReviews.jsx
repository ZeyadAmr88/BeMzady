"use client"

import React, { useState, useEffect, useContext } from "react"
import { itemService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"
import { Star, User, Edit, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const ItemReviews = ({ itemId }) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userReview, setUserReview] = useState(null)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await itemService.getItemReviews(itemId)
                const reviewsData = response.data.data || []
                setReviews(reviewsData)

                // Check if the current user has already reviewed this item
                if (user) {
                    const existingReview = reviewsData.find((review) => review.user._id === user._id)
                    if (existingReview) {
                        setUserReview(existingReview)
                        setRating(existingReview.rating)
                        setComment(existingReview.comment)
                    }
                }
            } catch (error) {
                console.error("Error fetching reviews:", error)
                setError("Failed to load reviews. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [itemId, user])

    const handleSubmitReview = async (e) => {
        e.preventDefault()

        if (!user) {
            return
        }

        try {
            if (userReview) {
                // Update existing review
                await itemService.updateReview(itemId, { rating, comment })
            } else {
                // Add new review
                await itemService.addReview(itemId, { rating, comment })
            }

            // Refresh reviews
            const response = await itemService.getItemReviews(itemId)
            setReviews(response.data.data || [])

            // Update user review
            const updatedUserReview = response.data.data.find((review) => review.user._id === user._id)
            setUserReview(updatedUserReview)

            setIsEditing(false)
        } catch (error) {
            console.error("Error submitting review:", error)
            setError("Failed to submit review. Please try again.")
        }
    }

    const handleDeleteReview = async () => {
        if (!user || !userReview) {
            return
        }

        try {
            await itemService.deleteReview(itemId)

            // Remove user review from list
            setReviews(reviews.filter((review) => review._id !== userReview._id))
            setUserReview(null)
            setRating(0)
            setComment("")
        } catch (error) {
            console.error("Error deleting review:", error)
            setError("Failed to delete review. Please try again.")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

            {error && (
                <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">{error}</div>
            )}

            {/* Review Form */}
            {user && (isEditing || !userReview) && (
                <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">{userReview ? "Edit Your Review" : "Write a Review"}</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={`rating-star-${star}`}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="text-2xl focus:outline-none"
                                >
                                    <Star
                                        fill={star <= rating ? "currentColor" : "none"}
                                        className={star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium mb-2">
                            Comment
                        </label>
                        <textarea
                            id="comment"
                            rows="4"
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-800 dark:text-white"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                            disabled={rating === 0}
                        >
                            {userReview ? "Update Review" : "Submit Review"}
                        </button>

                        {userReview && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* User's existing review */}
            {user && userReview && !isEditing && (
                <div className="mb-8 border border-gray-200 dark:border-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">Your Review</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-500 hover:text-rose-600 transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                            <button onClick={handleDeleteReview} className="text-gray-500 hover:text-red-600 transition-colors">
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={`user-review-star-${star}`}
                                fill={star <= userReview.rating ? "currentColor" : "none"}
                                className={star <= userReview.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                                size={18}
                            />
                        ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{userReview.comment}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(userReview.updatedAt || userReview.createdAt), { addSuffix: true })}
                    </p>
                </div>
            )}

            {/* Other reviews */}
            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this item!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews
                        .filter((review) => !user || review.user._id !== user._id)
                        .map((review) => (
                            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                                <div className="flex items-center mb-2">
                                    {review.user.user_picture ? (
                                        <img
                                            src={review.user.user_picture || "/placeholder.svg"}
                                            alt={review.user.username}
                                            className="w-8 h-8 rounded-full mr-3"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                            <User size={16} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{review.user.username}</p>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={`review-star-${review._id}-${star}`}
                                                    fill={star <= review.rating ? "currentColor" : "none"}
                                                    className={star <= review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                                                    size={16}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}

export default ItemReviews
