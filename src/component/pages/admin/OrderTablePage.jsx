import React, { useEffect, useState } from "react";
import { orderService } from "../../services/api";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []); // Fetch orders once on component mount

  useEffect(() => {
    // Recalculate total pages and count whenever filters or orders change
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === "";

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate =
        (!start || (orderDate && orderDate >= start)) &&
        (!end || (orderDate && orderDate <= end));

      return matchesSearch && matchesStatus && matchesDate;
    });

    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / ordersPerPage));
    setCurrentPage(1); // Reset to first page on filter change
  }, [orders, searchQuery, statusFilter, startDate, endDate, ordersPerPage]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders();
      console.log("Orders API Response:", response);

      const ordersData = response.data?.data || response.data || [];
      const count = ordersData.length;

      setOrders(ordersData);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / ordersPerPage));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Calculate the current page's orders
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const filteredOrders = orders.filter((order) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === "";

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate =
        (!start || (orderDate && orderDate >= start)) &&
        (!end || (orderDate && orderDate <= end));

      return matchesSearch && matchesStatus && matchesDate;
    });

    return filteredOrders.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Order Management
      </h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Order ID or User Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 flex-grow"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Date Range Filter */}
        <label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">
          From:
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          title="Start Date"
        />
        <label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">
          To:
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          title="End Date"
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageOrders().map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {order._id}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {order.user?.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        ${order.totalAmount?.toFixed(2) || "0.00"}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <span
                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          order.status === "pending"
                            ? "text-yellow-900"
                            : order.status === "paid"
                            ? "text-green-900"
                            : order.status === "shipped"
                            ? "text-blue-900"
                            : order.status === "delivered"
                            ? "text-purple-900"
                            : order.status === "cancelled"
                            ? "text-red-900"
                            : "text-gray-900"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 opacity-50 rounded-full ${
                            order.status === "pending"
                              ? "bg-yellow-200"
                              : order.status === "paid"
                              ? "bg-green-200"
                              : order.status === "shipped"
                              ? "bg-blue-200"
                              : order.status === "delivered"
                              ? "bg-purple-200"
                              : order.status === "cancelled"
                              ? "bg-red-200"
                              : "bg-gray-200"
                          }`}
                        ></span>
                        <span className="relative">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {order.createdAt
                          ? format(new Date(order.createdAt), "PPP")
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-5 flex justify-center items-center space-x-4 bg-gray-100 dark:bg-gray-700">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Page {currentPage} of {totalPages} ({totalCount} orders)
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
