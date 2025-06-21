import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Clock, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";

const OrderSuccess = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Authentication required");
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    "https://be-mazady.vercel.app/api/orders/my-orders",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setOrders(response.data.data);
                    toast.success("Payment successful! Order completed");
                } else {
                    setError("Failed to load orders");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                // Try to display a more helpful error message
                const errorMessage = err.response?.data?.message || err.message || "An error occurred while fetching orders";
                setError(errorMessage);
                toast.error("Could not load order data");
            } finally {
                setLoading(false);
            }
        };

        // Clear any lingering Stripe errors from sessionStorage or localStorage
        try {
            sessionStorage.removeItem('stripe_error');
            localStorage.removeItem('stripe_error');
        } catch (e) {
            console.warn("Could not clear storage:", e);
        }

        fetchOrders();
    }, [navigate]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        try {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            console.warn("Date formatting error:", error);
            // Fallback format if locale services fail
            return date.toISOString().split('T')[0];
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "paid":
                return <CheckCircle className="text-green-500 dark:text-green-400 w-5 h-5" />;
            case "pending":
                return <Clock className="text-yellow-500 dark:text-yellow-400 w-5 h-5" />;
            default:
                return <ShoppingBag className="text-gray-500 dark:text-gray-400 w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Error</h2>
                <p className="dark:text-gray-300">{error}</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
            <div className="mb-12 text-center">
                <CheckCircle className="text-green-500 dark:text-green-400 w-16 h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2 dark:text-white">Payment Successful!</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Your order has been processed successfully. Below are your recent orders.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order._id}
                            className="border dark:border-gray-700 rounded-lg shadow-sm p-6 bg-white dark:bg-gray-800"
                        >
                            <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                                    <p className="font-medium dark:text-gray-200">{order._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="font-medium dark:text-gray-200">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    <div className="flex items-center">
                                        {getStatusIcon(order.status)}
                                        <span className="ml-2 capitalize font-medium dark:text-gray-200">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="font-bold dark:text-white">${order.totalAmount}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-3 dark:text-gray-200">Items</h3>
                                {order.items.map((item, index) => (
                                    <div
                                        key={item._id}
                                        className={`py-3 ${index !== order.items.length - 1 ? "border-b dark:border-gray-700" : ""
                                            }`}
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium dark:text-gray-200">
                                                    {item.itemType === "auction" ? "Auction Item" : "Regular Item"}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium dark:text-gray-200">${item.priceAtPurchase}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-xl text-gray-500 dark:text-gray-400">No orders found</p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors mr-4"
                >
                    Continue Shopping
                </button>
                <button
                    onClick={() => navigate("/my-orders")}
                    className="px-6 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors mr-4"
                >
                    View All Orders
                </button>
                <button
                    onClick={() => navigate("/profile")}
                    className="px-6 py-2 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                    View Profile
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess; 