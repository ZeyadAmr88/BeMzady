import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { Calendar, Package, CreditCard, ArrowRight } from 'lucide-react';

const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const MyOrders = () => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const { orders, loading, error } = useOrders(selectedStatus);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0 text-white">My Orders</h1>
                <div className="w-full md:w-auto">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                        Filter by Status
                    </label>
                    <select
                        id="status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="block w-full md:w-64 rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-lg shadow-sm">
                    <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-xl text-gray-400">No orders found</p>
                    <p className="text-gray-500 mt-2">Your order history will appear here</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-700"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Order #{order._id}</h3>
                                        <div className="flex items-center text-gray-400 mt-1">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-400">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Total Amount</span>
                                        <span className="font-semibold text-white">${order.totalAmount}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders; 