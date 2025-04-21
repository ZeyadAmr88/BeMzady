"use client"
import React from 'react';

import { useState, useContext, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ThemeContext } from "../contexts/ThemeContext"
import { AuthContext } from "../contexts/AuthContext"
import { NotificationContext } from "../contexts/NotificationContext"
import { categoryService } from "../services/api"
import { Sun, Moon, ShoppingCart, Bell, MessageCircle, User, Menu, X, Search } from "lucide-react"
import NotificationDropdown from "../notifications/NotificationDropdown"
import MobileMenu from "./MobileMenu"

const Navbar = () => {
    const { darkMode, toggleTheme } = useContext(ThemeContext)
    const { user, logout } = useContext(AuthContext)
    const { unreadCount } = useContext(NotificationContext)
    const [categories, setCategories] = useState([])
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const profileRef = useRef(null)
    const notificationRef = useRef(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 5 })
                setCategories(response.data.data)
                setError(null)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setError("Failed to load categories")
                setCategories([])
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/auctions?keyword=${searchQuery}`)
    }

    const handleLogout = () => {
        logout()
        navigate("/")
        setIsProfileOpen(false)
    }

    return (
        <header className={`sticky top-0 z-50 backdrop-blur-md ${darkMode
            ? "bg-gray-900/80 border-b border-gray-800"
            : "bg-white/80 border-b border-gray-200"
            } shadow-sm`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center group">
                            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent group-hover:from-rose-500 group-hover:to-rose-400 transition-all duration-300">
                                BeMazady
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link
                            to="/"
                            className="relative group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
                        >
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            to="/auctions"
                            className="relative group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
                        >
                            Auctions
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <div className="relative group">
                            <button className="relative group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200">
                                Categories
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
                            </button>
                            <div
                                className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg ${darkMode
                                    ? "bg-gray-800/90 backdrop-blur-sm"
                                    : "bg-white/90 backdrop-blur-sm"
                                    } ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50`}
                            >
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {error ? (
                                        <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                                            {error}
                                        </div>
                                    ) : (
                                        categories.map((category) => (
                                            <Link
                                                key={category._id}
                                                to={`/category/${category._id}`}
                                                className={`block px-4 py-2 text-sm transition-colors duration-200 ${darkMode
                                                    ? "hover:bg-gray-700/50 text-gray-300"
                                                    : "hover:bg-gray-100/50 text-gray-600"
                                                    }`}
                                            >
                                                {category.name}
                                            </Link>
                                        ))
                                    )}
                                    <Link
                                        to="/categories"
                                        className={`block px-4 py-2 text-sm font-semibold transition-colors duration-200 ${darkMode
                                            ? "text-rose-400 hover:bg-gray-700/50"
                                            : "text-rose-600 hover:bg-gray-100/50"
                                            }`}
                                    >
                                        View All Categories
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    className={`w-full py-2 pl-4 pr-10 rounded-full border transition-all duration-200 ${darkMode
                                        ? "bg-gray-800/50 border-gray-700 focus:border-rose-500 focus:ring-rose-500/20"
                                        : "bg-gray-100/50 border-gray-200 focus:border-rose-500 focus:ring-rose-500/20"
                                        } focus:outline-none focus:ring-2`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-rose-600 transition-colors duration-200"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-all duration-200 ${darkMode
                                ? "bg-gray-800/50 hover:bg-gray-700/50 text-amber-400"
                                : "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600"
                                }`}
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <>
                                <Link
                                    to="/cart"
                                    className={`relative p-2 rounded-full transition-all duration-200 ${darkMode
                                        ? "hover:bg-gray-700/50 text-gray-300"
                                        : "hover:bg-gray-200/50 text-gray-600"
                                        }`}
                                >
                                    <ShoppingCart size={20} />
                                </Link>

                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className={`relative p-2 rounded-full transition-all duration-200 ${darkMode
                                            ? "hover:bg-gray-700/50 text-gray-300"
                                            : "hover:bg-gray-200/50 text-gray-600"
                                            }`}
                                        aria-label="Notifications"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-rose-600 rounded-full">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {isNotificationsOpen && <NotificationDropdown />}
                                </div>

                                <Link
                                    to="/messages"
                                    className={`relative p-2 rounded-full transition-all duration-200 ${darkMode
                                        ? "hover:bg-gray-700/50 text-gray-300"
                                        : "hover:bg-gray-200/50 text-gray-600"
                                        }`}
                                >
                                    <MessageCircle size={20} />
                                </Link>

                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`relative p-2 rounded-full transition-all duration-200 ${darkMode
                                            ? "hover:bg-gray-700/50"
                                            : "hover:bg-gray-200/50"
                                            }`}
                                        aria-label="User menu"
                                    >
                                        {user.user_picture ? (
                                            <img
                                                src={user.user_picture || "/placeholder.svg"}
                                                alt={user.username}
                                                className="w-6 h-6 rounded-full object-cover ring-2 ring-rose-500/20"
                                            />
                                        ) : (
                                            <User size={20} className="text-gray-600 dark:text-gray-300" />
                                        )}
                                    </button>

                                    {isProfileOpen && (
                                        <div
                                            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${darkMode
                                                ? "bg-gray-800/90 backdrop-blur-sm"
                                                : "bg-white/90 backdrop-blur-sm"
                                                } ring-1 ring-black/5 z-50`}
                                        >
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <div className="px-4 py-2 border-b border-gray-200/20 dark:border-gray-700/20">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${darkMode
                                                        ? "hover:bg-gray-700/50 text-gray-300"
                                                        : "hover:bg-gray-100/50 text-gray-600"
                                                        }`}
                                                >
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/products/add"
                                                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${darkMode
                                                        ? "hover:bg-gray-700/50 text-gray-300"
                                                        : "hover:bg-gray-100/50 text-gray-600"
                                                        }`}
                                                >
                                                    Add Product
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode
                                                        ? "hover:bg-gray-700/50 text-gray-300"
                                                        : "hover:bg-gray-100/50 text-gray-600"
                                                        }`}
                                                >
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex space-x-2">
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${darkMode
                                        ? "border border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
                                        : "border border-rose-500 text-rose-600 hover:bg-rose-50"
                                        }`}
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-500 hover:to-rose-400 transition-all duration-200"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && <MobileMenu setIsMenuOpen={setIsMenuOpen} />}
        </header>
    )
}

export default Navbar
