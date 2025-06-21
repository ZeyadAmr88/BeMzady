import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  userService,
  categoryService,
  auctionService,
  itemService,
  orderService,
} from "../../services/api";
import Toast from "../../common/Toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState("?");
  const [totalCategories, setTotalCategories] = useState("?");
  const [totalAuctions, setTotalAuctions] = useState("?");
  const [totalItems, setTotalItems] = useState("?");
  const [totalOrders, setTotalOrders] = useState("?");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Total Users
        const usersResponse = await userService.getAllUsers({
          page: 1,
          limit: 1,
        }); // Fetching just 1 to get total count
        if (usersResponse.totalUsers !== undefined) {
          setTotalUsers(usersResponse.totalUsers);
        } else if (usersResponse.data?.totalUsers !== undefined) {
          // Handle nested structure if needed
          setTotalUsers(usersResponse.data.totalUsers);
        } else {
          console.warn("totalUsers not found in users response", usersResponse);
          setTotalUsers("N/A");
          showToast("Failed to load user count", "error");
        }

        // Fetch Total Categories
        const categoriesResponse = await categoryService.getCategories({
          page: 1,
          limit: 1,
        }); // Fetching just 1 to get total count
        if (categoriesResponse.totalCategories !== undefined) {
          setTotalCategories(categoriesResponse.totalCategories);
        } else if (categoriesResponse.data?.totalCategories !== undefined) {
          // Handle nested structure if needed
          setTotalCategories(categoriesResponse.data.totalCategories);
        } else {
          console.warn(
            "totalCategories not found in categories response",
            categoriesResponse
          );
          setTotalCategories("N/A");
          showToast("Failed to load category count", "error");
        }

        // Fetch Total Auctions
        const auctionsResponse = await auctionService.getAuctions({
          page: 1,
          limit: 1,
        });
        if (auctionsResponse.totalAuctions !== undefined) {
          setTotalAuctions(auctionsResponse.totalAuctions);
        } else if (auctionsResponse.data?.totalAuctions !== undefined) {
          // Handle nested structure if needed
          setTotalAuctions(auctionsResponse.data.totalAuctions);
        } else {
          console.warn(
            "totalAuctions not found in auctions response",
            auctionsResponse
          );
          setTotalAuctions("N/A");
          showToast("Failed to load auction count", "error");
        }

        // Fetch Total Items
        const itemsResponse = await itemService.getItems({
          page: 1,
          limit: 1,
        });
        if (itemsResponse.totalItems !== undefined) {
          setTotalItems(itemsResponse.totalItems);
        } else if (itemsResponse.data?.totalItems !== undefined) {
          setTotalItems(itemsResponse.data.totalItems);
        } else {
          console.warn("totalItems not found in items response", itemsResponse);
          setTotalItems("N/A");
          showToast("Failed to load item count", "error");
        }

        // Fetch Total Orders
        const ordersResponse = await orderService.getAllOrders({
          page: 1,
          limit: 1,
        });
        if (ordersResponse.count !== undefined) {
          setTotalOrders(ordersResponse.count);
        } else if (ordersResponse.data?.count !== undefined) {
          setTotalOrders(ordersResponse.data.count);
        } else {
          console.warn("count not found in orders response", ordersResponse);
          setTotalOrders("N/A");
          showToast("Failed to load order count", "error");
        }
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
        setError("Failed to load dashboard data.");
        showToast("Failed to load dashboard data", "error");
        setTotalUsers("Error");
        setTotalCategories("Error");
        setTotalAuctions("Error");
        setTotalItems("Error");
        setTotalOrders("Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []); // Empty dependency array means this runs once on mount

  const handleNavigation = (path) => {
    navigate(path);
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
        onClick ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {title}
          </h3>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full `}>{icon}</div>
      </div>
    </div>
  );

  const ManagementCard = ({ title, description, icon, onClick }) => (
    <div
      onClick={onClick}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-full bg-rose-100 text-rose-600">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          color="text-rose-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/users")}
        />
        <StatCard
          title="Total Categories"
          value={totalCategories}
          color="text-blue-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/categories")}
        />
        <StatCard
          title="Total Auctions"
          value={totalAuctions}
          color="text-green-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/auctions")}
        />
        <StatCard
          title="Total Items"
          value={totalItems}
          color="text-purple-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/items")}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          color="text-yellow-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 14l6-6m-3 0l-3 3m6-3l-3 3M17 17H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/orders")}
        />
      </div>

      {/* Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ManagementCard
          title="Manage Categories"
          description="View, add, edit, and delete product categories and subcategories."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/categories")}
        />
        <ManagementCard
          title="Manage Users"
          description="View, add, edit, and delete user accounts and manage permissions."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/users")}
        />
        <ManagementCard
          title="Manage Auctions"
          description="View, create, edit, end, and delete auctions."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/auctions")}
        />
        <ManagementCard
          title="Manage Items"
          description="View, add, edit, and delete items."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/items")}
        />
        <ManagementCard
          title="Order Management"
          description="View and manage all customer orders."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 14l6-6m-3 0l-3 3m6-3l-3 3M17 17H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2z"
              />
            </svg>
          }
          onClick={() => handleNavigation("/admin/orders")}
        />
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default AdminDashboard;
