import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { User, Mail, Phone, MapPin, Package, Gavel, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfileOverview = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalItems: 0,
        activeAuctions: 0,
        itemsSold: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userService.getProfile();
                setProfile(response.data.data);

                // If user is a seller, fetch seller stats
                if (user?.role === "seller") {
                    const statsResponse = await userService.getSellerOverview();
                    setStats(statsResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile information");
                toast.error("Failed to load profile information");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                            {profile?.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt={profile.username}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User size={40} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2">{profile?.username}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{profile?.email}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile?.phone && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Phone size={18} className="mr-2" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                                {profile?.address && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <MapPin size={18} className="mr-2" />
                                        <span>{profile.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link
                            to="/profile/settings"
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Seller Stats (if user is a seller) */}
                {user?.role === "seller" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                                </div>
                                <Package className="text-rose-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Auctions</p>
                                    <p className="text-2xl font-bold">{stats.activeAuctions}</p>
                                </div>
                                <Gavel className="text-rose-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items Sold</p>
                                    <p className="text-2xl font-bold">{stats.itemsSold}</p>
                                </div>
                                <TrendingUp className="text-rose-600" size={24} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                                </div>
                                <DollarSign className="text-rose-600" size={24} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to="/auctions/create"
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <h3 className="font-medium mb-1">Create Auction</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start a new auction</p>
                        </Link>
                        <Link
                            to="/profile/favorites"
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <h3 className="font-medium mb-1">My Favorites</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View saved items</p>
                        </Link>
                        <Link
                            to="/profile/bids"
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            <h3 className="font-medium mb-1">My Bids</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track your bids</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview; 