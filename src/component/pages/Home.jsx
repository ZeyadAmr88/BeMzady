"use client"
import React from 'react';

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { auctionService, categoryService } from "../services/api"
import { Clock, ArrowRight } from "lucide-react"
import AuctionCard from "../auctions/AuctionCard"
import CategoryCard from "../categories/CategoryCard"
import HeroSection from "../home/HeroSection"
import HowItWorks from "../home/HowItWorks"
import Testimonials from "../home/Testimonials"

const Home = () => {
    const [featuredAuctions, setFeaturedAuctions] = useState([])
    const [endingSoonAuctions, setEndingSoonAuctions] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured auctions
                const featuredResponse = await auctionService.getAuctions({
                    limit: 4,
                    sort: "-startPrice",
                    status: "active",
                })

                // Fetch ending soon auctions
                const endingSoonResponse = await auctionService.getAuctions({
                    limit: 4,
                    sort: "endDate",
                    status: "active",
                })

                // Fetch categories
                const categoriesResponse = await categoryService.getCategories({
                    limit: 6,
                })

                setFeaturedAuctions(featuredResponse.data.data)
                setEndingSoonAuctions(endingSoonResponse.data.data)
                setCategories(categoriesResponse.data.data)
            } catch (error) {
                console.error("Error fetching home data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div>
            <HeroSection />

            {/* Featured Auctions */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">Featured Auctions</h2>
                        <Link to="/auctions" className="flex items-center text-rose-600 hover:text-rose-700 transition-colors">
                            View All <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {featuredAuctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
                        <Link to="/categories" className="flex items-center text-rose-600 hover:text-rose-700 transition-colors">
                            View All <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {categories.map((category) => (
                            <CategoryCard key={category._id} category={category} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Ending Soon */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center">
                            <Clock size={24} className="mr-2 text-rose-600" />
                            <h2 className="text-2xl md:text-3xl font-bold">Ending Soon</h2>
                        </div>
                        <Link
                            to="/auctions?sort=endDate"
                            className="flex items-center text-rose-600 hover:text-rose-700 transition-colors"
                        >
                            View All <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {endingSoonAuctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />
                        ))}
                    </div>
                </div>
            </section>

            <HowItWorks />
            <Testimonials />
        </div>
    )
}

export default Home
