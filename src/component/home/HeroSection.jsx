"use client"

import React from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/auctions?keyword=${searchQuery}`)
    }

    return (
        <section className="relative bg-gradient-to-r from-rose-500 to-rose-700 text-white py-10 sm:py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">Discover, Bid, Win on BeMazady</h1>
                    <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-rose-100">
                        Your premier destination for online auctions. Find unique items, bid with confidence, and enjoy a secure
                        trading experience.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6 sm:mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for auctions..."
                                className="w-full py-2 sm:py-3 px-4 sm:px-5 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-rose-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-rose-700 transition-colors"
                            >
                                <Search size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        <Link
                            to="/auctions"
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-rose-600 font-semibold rounded-full hover:bg-rose-50 transition-colors text-sm sm:text-base"
                        >
                            Browse Auctions
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-rose-600 transition-colors text-sm sm:text-base"
                        >
                            Start Selling
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="hidden md:block absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="hidden md:block absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </section>
    )
}

export default HeroSection
