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
// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/swiper.css';

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

                // Fetch categories with pagination
                const categoriesResponse = await categoryService.getCategories({
                    page: 1,
                    limit: 6,
                })

                console.log("Home categories response:", categoriesResponse.data)

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
            <HowItWorks />
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

                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                        }}
                        className="category-swiper"
                    >
                        {categories.map((category) => (
                            <SwiperSlide key={category._id}>
                                <div className="relative group cursor-pointer h-[400px]">
                                    <div className="h-full overflow-hidden rounded-xl">
                                        <img
                                            src={category.categoryImage || 'https://placehold.co/400x400/1f2937/e11d48?text=Category'}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:blur-sm"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/400x400/1f2937/e11d48?text=Category';
                                            }}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <h3 className="text-white text-2xl font-semibold text-center px-4">
                                            {category.name}
                                        </h3>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
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


            <Testimonials />
        </div>
    )
}

export default Home
