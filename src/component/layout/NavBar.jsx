"use client";
import React from "react";

import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { NotificationContext } from "../contexts/NotificationContext";
import { CartContext } from "../contexts/CartContext";
import { categoryService, subcategoryService } from "../services/api";
import {
  Sun,
  Moon,
  ShoppingCart,
  Bell,
  MessageCircle,
  User,
  Menu,
  X,
  Search,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { messageService } from "../services/api";
import NotificationDropdown from "../notifications/NotificationDropdown";
import MobileMenu from "./MobileMenu";
/* Add styles at the top of the component */
const scrollbarStyles = `
  /* Custom scrollbars for the category menu */
  .scrollbar-light::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-light::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .scrollbar-light::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
  
  .scrollbar-light::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
  
  .scrollbar-dark::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-dark::-webkit-scrollbar-track {
    background: #2d3748;
    border-radius: 3px;
  }
  
  .scrollbar-dark::-webkit-scrollbar-thumb {
    background: #4a5568;
    border-radius: 3px;
  }
  
  .scrollbar-dark::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }
`;

const Navbar = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const { cartCount } = useContext(CartContext);
  const [categories, setCategories] = useState([]);
  const [categoriesWithSubs, setCategoriesWithSubs] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Fetch all categories and subcategories when component mounts
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      setLoading(true);
      try {
        // Attempt to get hierarchical data

        // Fallback: Get categories first
        const categoryResponse = await categoryService.getCategories({
          page: 1,
          limit: 1000,
        });
        const categoriesData = categoryResponse.data.data || [];
        setCategories(categoriesData);

        // Then fetch subcategories for each category and build the hierarchy
        const categoriesWithSubcategories = [];

        for (const category of categoriesData) {
          try {
            const subResponse =
              await categoryService.getSubcategoriesByCategory(category._id);
            const subcategories = subResponse.data.data || [];

            categoriesWithSubcategories.push({
              ...category,
              subcategories: subcategories,
            });
          } catch (subError) {
            console.error(
              `Error fetching subcategories for category ${category.name}:`,
              subError
            );
            categoriesWithSubcategories.push({
              ...category,
              subcategories: [],
            });
          }
        }

        setCategoriesWithSubs(categoriesWithSubcategories);
        setError(null);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
        setCategories([]);
        setCategoriesWithSubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside notification area
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }

      // Other menu checks...
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/auctions?keyword=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    // Only fetch unread messages if user is logged in
    if (!user) return;

    const fetchUnreadMessageCount = async () => {
      try {
        const response = await messageService.getUnreadCount();
        console.log("😀response", response);
        // Handle different response formats safely
        const count =
          response?.data?.data?.count ||
          response?.data?.count ||
          response?.data ||
          0;
        setUnreadMessageCount(count);
      } catch (error) {
        console.error("Error fetching unread message count:", error);
        // Set to 0 on error to avoid UI issues
        setUnreadMessageCount(0);
      }
    };

    // Fetch immediately
    fetchUnreadMessageCount();

    // And set up interval to refresh every minute
    const intervalId = setInterval(fetchUnreadMessageCount, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md ${
        darkMode
          ? "bg-gray-900/80 border-b border-gray-800"
          : "bg-white/80 border-b border-gray-200"
      } shadow-sm`}
    >
      {/* Add scrollbar styles */}
      <style>{scrollbarStyles}</style>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent group-hover:from-rose-500 group-hover:to-rose-400 transition-all duration-300">
                BeMazady
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/home"
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
            <Link
              to="/items"
              className="relative group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
            >
              Items
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={toggleCategoryMenu}
                className="relative flex items-center group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
              >
                Categories
                <ChevronDown size={16} className="ml-1" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              {isCategoryMenuOpen && (
                <div
                  className={`absolute left-0 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-lg shadow-lg ${
                    darkMode
                      ? "bg-gray-800/90 backdrop-blur-sm scrollbar-dark"
                      : "bg-white/90 backdrop-blur-sm scrollbar-light"
                  } ring-1 ring-black/5 z-50`}
                >
                  {loading ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
                    </div>
                  ) : error ? (
                    <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  ) : (
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {categoriesWithSubs.length > 0 ? (
                        categoriesWithSubs.map((category) => (
                          <div key={category._id} className="relative">
                            {/* Category title */}
                            <Link
                              to={`/items?category=${category._id}`}
                              className={`flex justify-between items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                darkMode
                                  ? "hover:bg-gray-700/50 text-gray-300"
                                  : "hover:bg-gray-100/50 text-gray-600"
                              }`}
                              onClick={() => setIsCategoryMenuOpen(false)}
                            >
                              <span>{category.name}</span>
                              {category.subcategories &&
                                category.subcategories.length > 0 && (
                                  <ChevronRight
                                    size={14}
                                    className="text-gray-400"
                                  />
                                )}
                            </Link>

                            {/* Subcategories */}
                            {category.subcategories &&
                              category.subcategories.length > 0 && (
                                <div className="pl-4 border-l border-gray-200 dark:border-gray-700 ml-4 mt-1 mb-2">
                                  {category.subcategories.map((subcategory) => (
                                    <Link
                                      key={subcategory._id}
                                      to={`/subcategory/${subcategory.slug}`}
                                      className={`block px-3 py-1.5 text-xs rounded transition-colors duration-200 ${
                                        darkMode
                                          ? "hover:bg-gray-700/50 text-gray-400"
                                          : "hover:bg-gray-100/50 text-gray-500"
                                      }`}
                                      onClick={() =>
                                        setIsCategoryMenuOpen(false)
                                      }
                                    >
                                      {subcategory.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No categories found
                        </div>
                      )}
                      <Link
                        to="/categories"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className={`block px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          darkMode
                            ? "text-rose-400 hover:bg-gray-700/50"
                            : "text-rose-600 hover:bg-gray-100/50"
                        }`}
                      >
                        View All Categories
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Dashboard Link (Admin Only) */}
            {user && user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="relative group text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search auctions..."
                  className={`w-full py-2 pl-4 pr-10 rounded-full border transition-all duration-200 ${
                    darkMode
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
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode
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
                  className={`relative p-2 rounded-full transition-all duration-200 ${
                    darkMode
                      ? "hover:bg-gray-700/50 text-gray-300"
                      : "hover:bg-gray-200/50 text-gray-600"
                  }`}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-rose-600 rounded-full">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative p-2 rounded-full transition-all duration-200 ${
                      darkMode
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
                  {isNotificationsOpen && (
                    <div ref={notificationDropdownRef}>
                      <NotificationDropdown />
                    </div>
                  )}
                </div>

                <Link
                  to="/messages"
                  className="relative p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200"
                >
                  <MessageCircle size={22} />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </span>
                  )}
                </Link>

                <div
                  className="relative group hidden md:block"
                  ref={profileRef}
                >
                  <button
                    className={`relative p-2 rounded-full transition-all duration-200 ${
                      darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-200/50"
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
                      <User
                        size={20}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    )}
                  </button>
                  {/* Dropdown on hover */}
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                      darkMode
                        ? "bg-gray-800/90 backdrop-blur-sm"
                        : "bg-white/90 backdrop-blur-sm"
                    } ring-1 ring-black/5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
                  >
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="px-4 py-2 border-b border-gray-200/20 dark:border-gray-700/20">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          darkMode
                            ? "hover:bg-gray-700/50 text-gray-300"
                            : "hover:bg-gray-100/50 text-gray-600"
                        }`}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/products/add"
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          darkMode
                            ? "hover:bg-gray-700/50 text-gray-300"
                            : "hover:bg-gray-100/50 text-gray-600"
                        }`}
                      >
                        Add Product
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          darkMode
                            ? "hover:bg-gray-700/50 text-gray-300"
                            : "hover:bg-gray-100/50 text-gray-600"
                        }`}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`relative p-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                  darkMode
                    ? "hover:bg-primary-700/50 text-primary-300"
                    : "hover:bg-primary-200/50 text-primary-600"
                }`}
              >
                Login
              </Link>
            )}

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
  );
};

export default Navbar;
