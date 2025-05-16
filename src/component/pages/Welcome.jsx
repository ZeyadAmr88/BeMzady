"use client"
import React from "react"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"
import { ArrowRight, Sparkles, Award, Shield, Heart } from "lucide-react"
import { AuthContext } from "../contexts/AuthContext"

const Welcome = () => {
    const { darkMode } = useContext(ThemeContext)
    const { user } = useContext(AuthContext)

    const quotes = [
        {
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker"
        },
        {
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill"
        },
        {
            text: "The only limit to our realization of tomorrow is our doubts of today.",
            author: "Franklin D. Roosevelt"
        }
    ]

    const features = [
        {
            icon: <Award className="w-8 h-8" />,
            title: "Premium Auctions",
            description: "Access to exclusive and high-quality auction items"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Secure Trading",
            description: "Safe and reliable platform for all your transactions"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "User-Friendly",
            description: "Simple and intuitive interface for all users"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute inset-0 ${darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800" : "bg-gradient-to-b from-gray-50 to-white"}`} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
                {/* Logo and Title */}
                <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-rose-500/10 px-4 py-2 rounded-full">
                        <Sparkles className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-medium text-rose-500">Welcome to</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold">
                        <span className="bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                            BeMzady
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Your premier destination for online auctions. Find unique items, bid with confidence, and enjoy a secure trading experience.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-xl backdrop-blur-sm transition-all duration-300 ${darkMode
                                ? "bg-gray-800/50 hover:bg-gray-700/50"
                                : "bg-white/50 hover:bg-gray-50/50"
                                } shadow-sm hover:shadow-md`}
                        >
                            <div className="text-rose-500 mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quotes Section */}
                <div className="mt-12 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Words of Wisdom
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quotes.map((quote, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-xl backdrop-blur-sm transition-all duration-300 ${darkMode
                                    ? "bg-gray-800/50 hover:bg-gray-700/50"
                                    : "bg-white/50 hover:bg-gray-50/50"
                                    } shadow-sm hover:shadow-md`}
                            >
                                <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                                    "{quote.text}"
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    - {quote.author}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                    <Link
                        to="/auctions"
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:from-accent-500 hover:to-accent-400 flex items-center space-x-2"
                    >
                        <span>Explore Auctions</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    {!user && (
                        <Link
                            to="/register"
                            className="px-6 py-3 rounded-lg border border-accent-500 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-all duration-300"
                        >
                            Join Now
                        </Link>
                    )}
                    <Link
                        to="/Home"
                        className="px-6 py-3 rounded-lg border border-accent-500 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-500/10 transition-all duration-300" 
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Welcome 