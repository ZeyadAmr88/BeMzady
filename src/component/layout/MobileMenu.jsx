"use client";

import React from "react"
import { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { ThemeContext } from "../contexts/ThemeContext"
import { categoryService, subcategoryService, messageService } from "../services/api"
import { Search, User, ShoppingCart, Bell, MessageCircle, LogOut, ChevronDown, ChevronRight } from "lucide-react"

const MobileMenu = ({ setIsMenuOpen }) => {
    const { user, logout } = useContext(AuthContext)
    const { darkMode } = useContext(ThemeContext)
    const [searchQuery, setSearchQuery] = useState("")
    const [categories, setCategories] = useState([])
  const [categoriesWithSubs, setCategoriesWithSubs] = useState([])
    const [expandedCategory, setExpandedCategory] = useState(null)
    const [subcategories, setSubcategories] = useState({})
    const [loading, setLoading] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCategoriesAndSubcategories = async () => {
            setLoading(true);
            try {
                // Attempt to get hierarchical data
                try {
                    const hierarchyResponse = await categoryService.getCategoriesWithSubcategories();
                    if (hierarchyResponse.data && hierarchyResponse.data.data) {
                        setCategoriesWithSubs(hierarchyResponse.data.data);
                        setLoading(false);
                        return;
                    }
                } catch (hierarchyError) {
                    console.warn("Hierarchical categories endpoint failed, falling back to standard method", hierarchyError);
                }

                // Fallback: Get categories first
                const categoryResponse = await categoryService.getCategories({
                    page: 1,
                    limit: 10
                });
                const categoriesData = categoryResponse.data.data || [];
                setCategories(categoriesData);

                // Then fetch subcategories for each category and build the hierarchy
                const categoriesWithSubcategories = [];

                for (const category of categoriesData) {
                    try {
                        const subResponse = await categoryService.getSubcategoriesByCategory(category._id);
                        const subcategories = subResponse.data.data || [];

                        categoriesWithSubcategories.push({
                            ...category,
                            subcategories: subcategories
                        });
                    } catch (subError) {
                        console.error(`Error fetching subcategories for category ${category.name}:`, subError);
                        categoriesWithSubcategories.push({
                            ...category,
                            subcategories: []
                        });
                    }
                }

                setCategoriesWithSubs(categoriesWithSubcategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndSubcategories();
    }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/auctions?keyword=${searchQuery}`);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleCategory = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <div
      className={`md:hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-3.5rem)] overflow-y-auto`}
    >
      <div className="px-3 sm:px-4 py-3">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search auctions..."
              className={`w-full py-2 pl-4 pr-10 rounded-full border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-rose-500`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Search size={18} className="text-gray-500" />
            </button>
          </div>
        </form>

                <nav className="space-y-4">
                    <Link to="/" className="block py-2 hover:text-rose-600 transition-colors" onClick={closeMenu}>
                        Home
                    </Link>
                    <Link to="/auctions" className="block py-2 hover:text-rose-600 transition-colors" onClick={closeMenu}>
                        Auctions
                    </Link>
                    <Link to="/items" className="block py-2 hover:text-rose-600 transition-colors" onClick={closeMenu}>
                        Items
                    </Link>
                    <div>
                        <Link to="/categories" className="block py-2 hover:text-rose-600 transition-colors">
                            Categories
                        </Link>
                        <div className="pl-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700">
                            {loading ? (
                                <div className="flex justify-center items-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
                                </div>
                            ) : (
                                categoriesWithSubs.map((category) => (
                                    <div key={category._id} className="py-1">
                                        <div
                                            className="flex items-center justify-between cursor-pointer hover:text-rose-600 transition-colors"
                                            onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                                        >
                                            <Link
                                                to={`/category/${category._id}`}
                                                className="flex-grow"
                                                onClick={closeMenu}
                                            >
                                                {category.name}
                                            </Link>
                                            {category.subcategories && category.subcategories.length > 0 && (
                                                <button className="p-1">
                                                    {expandedCategory === category._id ?
                                                        <ChevronDown size={16} /> :
                                                        <ChevronRight size={16} />}
                                                </button>
                                            )}
                                        </div>

                                        {expandedCategory === category._id && category.subcategories && (
                                            <div className="pl-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                                {category.subcategories.length > 0 ? (
                                                    category.subcategories.map((subcategory) => (
                                                        <Link
                                                            key={subcategory._id}
                                                            to={`/subcategory/${subcategory.slug}`}
                                                            className="block text-sm py-1 hover:text-rose-600 transition-colors"
                                                            onClick={closeMenu}
                                                        >
                                                            {subcategory.name}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 py-1">No subcategories found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

          {user ? (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex items-center space-x-3 mb-3">
                  {user.user_picture ? (
                    <img
                      src={user.user_picture || "/placeholder.svg"}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <User size={16} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center py-2 hover:text-rose-600 transition-colors"
                  onClick={closeMenu}
                >
                  <User size={18} className="mr-3" />
                  Your Profile
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center py-2 hover:text-rose-600 transition-colors"
                  onClick={closeMenu}
                >
                  <ShoppingCart size={18} className="mr-3" />
                  Your Cart
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center py-2 hover:text-rose-600 transition-colors"
                  onClick={closeMenu}
                >
                  <Bell size={18} className="mr-3" />
                  Notifications
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center py-2 hover:text-rose-600 transition-colors"
                  onClick={closeMenu}
                >
                  <div className="relative">
                    <MessageCircle size={18} className="mr-3" />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                      </span>
                    )}
                  </div>
                  Messages
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full py-2 text-rose-600 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                className="py-2 px-4 rounded-md border border-rose-600 text-rose-600 text-center hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors"
                onClick={closeMenu}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="py-2 px-4 rounded-md bg-rose-600 text-white text-center hover:bg-rose-700 transition-colors"
                onClick={closeMenu}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
