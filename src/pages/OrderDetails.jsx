import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails, useUserProfile } from '../hooks/useOrders';
import { ArrowLeft, Package, Truck, CreditCard, Calendar, MapPin, Receipt, Phone } from 'lucide-react';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { order, loading: orderLoading, error: orderError } = useOrderDetails(orderId);
    const { profile, loading: profileLoading, error: profileError } = useUserProfile();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    if (orderLoading || profileLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (orderError || profileError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">
                    Error: {orderError || profileError}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-gray-400 bg-gray-800 p-4 rounded-lg">Order not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/my-orders')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Orders
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Order #{order._id}</h1>
                            <div className="flex items-center text-gray-400 mt-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Placed on {formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Order Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-700">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Receipt className="w-5 h-5 mr-2 text-indigo-400" />
                                Order Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Amount</span>
                                    <span className="font-semibold text-white">${order.totalAmount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Payment Method</span>
                                    <span className="font-medium text-white">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Payment Status</span>
                                    <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
                                Shipping Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-400">Address</span>
                                    <span className="text-white text-right">{profile?.address || 'No address provided'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Phone Number</span>
                                    <div className="flex items-center text-white">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{profile?.phone_number || 'No phone number provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-indigo-400" />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white">{item.name}</h3>
                                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                        <p className="text-sm text-gray-400">Price: ${item.priceAtPurchase}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">
                                            ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Timeline */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-indigo-400" />
                        Order Timeline
                    </h2>
                    <div className="relative pl-8 space-y-6">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                        <div className="relative">
                            <div className="absolute -left-8 w-4 h-4 rounded-full bg-indigo-500"></div>
                            <div className="text-sm text-gray-400">Order Placed</div>
                            <div className="text-sm font-medium text-white">{formatDate(order.createdAt)}</div>
                        </div>
                        {order.status === 'paid' && (
                            <div className="relative">
                                <div className="absolute -left-8 w-4 h-4 rounded-full bg-green-500"></div>
                                <div className="text-sm text-gray-400">Payment Confirmed</div>
                                <div className="text-sm font-medium text-white">{formatDate(order.updatedAt)}</div>
                            </div>
                        )}
                        {order.status === 'shipped' && (
                            <div className="relative">
                                <div className="absolute -left-8 w-4 h-4 rounded-full bg-purple-500"></div>
                                <div className="text-sm text-gray-400">Order Shipped</div>
                                <div className="text-sm font-medium text-white">{formatDate(order.updatedAt)}</div>
                            </div>
                        )}
                        {order.status === 'delivered' && (
                            <div className="relative">
                                <div className="absolute -left-8 w-4 h-4 rounded-full bg-green-500"></div>
                                <div className="text-sm text-gray-400">Order Delivered</div>
                                <div className="text-sm font-medium text-white">{formatDate(order.updatedAt)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails; 