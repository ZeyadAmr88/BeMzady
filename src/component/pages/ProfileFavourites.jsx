"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { userService } from "../services/api"
import { Heart } from 'lucide-react'

const ProfileFavorites = () => {
    const { user } = useContext(AuthContext)
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // This would fetch the user's favorites
        // For now, we'll just set loading to false
        setLoading(false)
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                    <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">This page is not implemented yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        The My Favorites page will show all auctions and items you've saved.
                    </p>
                    <Link
                        to="/profile"
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Back to Profile
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProfileFavorites
