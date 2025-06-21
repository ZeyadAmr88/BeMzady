import React, { useEffect, useState } from "react";
import { orderService } from "../../services/api";
import { format, parseISO, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Pie,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    statusDistribution: [],
    revenueByDay: [],
    ordersByDay: [],
    paymentMethods: [],
  });
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (orders.length > 0) {
      processAnalytics(orders);
    }
  }, [orders]);

  const fetchOrders = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders({
        page: page,
        limit: ordersPerPage,
      });
      console.log("Orders API Response:", response);

      const ordersData = response.data?.data || response.data || [];
      const count = response.data?.count || 0;

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

  const processAnalytics = (ordersData) => {
    // Process status distribution
    const statusCounts = {};
    ordersData.forEach((order) => {
      const status = order.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusDistribution = Object.keys(statusCounts).map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status],
    }));

    // Process revenue by day (last 7 days)
    const revenueByDay = generateDailyData(ordersData, "totalAmount");

    // Process orders by day (last 7 days)
    const ordersByDay = generateDailyData(ordersData, "count");

    // Process payment methods
    const paymentMethodCounts = {};
    ordersData.forEach((order) => {
      const method = order.paymentMethod || "unknown";
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    });

    const paymentMethods = Object.keys(paymentMethodCounts).map((method) => ({
      name:
        method === "stripe"
          ? "Stripe"
          : method === "cod"
          ? "Cash on Delivery"
          : method,
      value: paymentMethodCounts[method],
    }));

    setAnalytics({
      statusDistribution,
      revenueByDay,
      ordersByDay,
      paymentMethods,
    });
  };

  const generateDailyData = (ordersData, metric) => {
    const days = 7;
    const result = [];

    // Initialize with the last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      result.push({
        date: dateStr,
        value: 0,
        displayDate: format(date, "MMM dd"),
      });
    }

    // Aggregate data
    ordersData.forEach((order) => {
      if (!order.createdAt) return;

      const orderDate = format(parseISO(order.createdAt), "yyyy-MM-dd");
      const dayIndex = result.findIndex((day) => day.date === orderDate);

      if (dayIndex !== -1) {
        if (metric === "count") {
          result[dayIndex].value += 1;
        } else if (metric === "totalAmount" && order.totalAmount) {
          result[dayIndex].value += order.totalAmount;
        }
      }
    });

    return result;
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

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Order Management
      </h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.statusDistribution.find((s) => s.name === "Pending")
                ?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.statusDistribution.find((s) => s.name === "Paid")
                ?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for fulfillment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {orders
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-4 w-4 text-green-500 mr-1" />
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of orders by current status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow">
                                <p className="font-medium">
                                  {payload[0].name}: {payload[0].value}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.paymentMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {analytics.paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders & Revenue Trends (Last 7 Days)</CardTitle>
                <CardDescription>Daily order count and revenue</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={analytics.ordersByDay}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="value"
                        name="Orders"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        data={analytics.revenueByDay}
                        dataKey="value"
                        name="Revenue ($)"
                        stroke="#82ca9d"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => navigate("/admin/orders/table")}
              className="bg-rose-500 hover:bg-rose-800 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowUpRight size={16} />
              View All Orders Table
            </button>
          </div>
        </TabsContent>
        <TabsContent value="orders">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No orders found.
              </p>
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
                    {orders.map((order) => (
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
                            onClick={() =>
                              console.log("View order:", order._id)
                            }
                            className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300"
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrderManagement;
