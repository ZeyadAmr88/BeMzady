"use client";

import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import { userService } from "../services/api"
import { User, Mail, Phone, MapPin, Package, Heart, Gavel, Settings, LogOut, Edit, Camera, Save, X, BarChart2 } from 'lucide-react'
import ProfileCompletedAuctions from "./ProfileCompletedAuctions"
import SellerDashboard from "./SellerDashboard"

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if we're on a nested route
  const isNestedRoute =
    location.pathname.includes("/profile/") &&
    location.pathname !== "/profile/";

  const [profileData, setProfileData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    country: "",
    bio: "",
    user_picture: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        bio: user.bio || "",
        user_picture: user.user_picture || null,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          user_picture: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append all profile data
      Object.keys(profileData).forEach((key) => {
        if (
          key !== "user_picture" ||
          (key === "user_picture" && profileData[key] instanceof File)
        ) {
          formData.append(key, profileData[key]);
        }
      });

      await userService.updateProfile(formData);
      showSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(
        error.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await userService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      showSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      showError(
        error.response?.data?.message ||
        "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {profileData.user_picture ? (
                    <img
                      src={
                        profileData.user_picture ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold">{profileData.username}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {profileData.email}
              </p>
            </div>

            <nav className="space-y-1">


              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "info"
                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <User size={18} className="mr-3" />
                <span>Personal Information</span>
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "dashboard"
                  ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <BarChart2 size={18} className="mr-3" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === "security"
                  ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <Settings size={18} className="mr-3" />
                <span>Security</span>
              </button>

              {/* <Link
                to="/profile/auctions"
                className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Package size={18} className="mr-3" />
                <span>My Auctions</span>
              </Link> */}

              <Link
                to="/profile/completed-auctions"
                className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Gavel size={18} className="mr-3" />
                <span>Completed Auctions</span>
              </Link>

              <Link
                to="/profile/bids"
                className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Gavel size={18} className="mr-3" />
                <span>My Bids</span>
              </Link>

              <Link
                to="/profile/favorites"
                className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Heart size={18} className="mr-3" />
                <span>Favorites</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} className="mr-3" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Render content based on route or tab */}
          {isNestedRoute ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {location.pathname.includes("/auctions")
                  ? "My Auctions"
                  : location.pathname.includes("/completed-auctions")
                    ? "Completed Auctions"
                    : location.pathname.includes("/bids")
                      ? "My Bids"
                      : location.pathname.includes("/favorites")
                        ? "My Favorites"
                        : "Profile"}
              </h2>
              {location.pathname.includes("/completed-auctions") ? (
                <ProfileCompletedAuctions />
              ) : (
                <p>Content for {location.pathname} would go here</p>
              )}
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && <SellerDashboard />}

              {/* Personal Information Tab */}
              {activeTab === "info" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Personal Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-rose-600 hover:text-rose-700"
                      >
                        <Edit size={18} className="mr-1" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X size={18} className="mr-1" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  <div className="p-6">
                    {!isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Username
                            </h3>
                            <p className="mt-1">{profileData.username}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email
                            </h3>
                            <p className="mt-1">{profileData.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              First Name
                            </h3>
                            <p className="mt-1">
                              {profileData.first_name || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Last Name
                            </h3>
                            <p className="mt-1">
                              {profileData.last_name || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone Number
                            </h3>
                            <p className="mt-1">
                              {profileData.phone_number || "Not provided"}
                            </p>
                          </div>
                        </div>


                      </div>
                    ) : (
                      <form onSubmit={handleUpdateProfile}>
                        <div className="space-y-6">
                          <div className="flex justify-center mb-6">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {profileData.user_picture ? (
                                  <img
                                    src={
                                      profileData.user_picture ||
                                      "/placeholder.svg?height=96&width=96"
                                    }
                                    alt={profileData.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <label
                                htmlFor="profile-picture"
                                className="absolute bottom-0 right-0 bg-rose-600 text-white p-1 rounded-full cursor-pointer"
                              >
                                <Camera size={16} />
                              </label>
                              <input
                                type="file"
                                id="profile-picture"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-1"
                              >
                                Username
                              </label>
                              <input
                                type="text"
                                id="username"
                                name="username"
                                value={profileData.username}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                disabled
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Email cannot be changed
                              </p>
                            </div>
                            <div>
                              <label
                                htmlFor="first_name"
                                className="block text-sm font-medium mb-1"
                              >
                                First Name
                              </label>
                              <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="last_name"
                                className="block text-sm font-medium mb-1"
                              >
                                Last Name
                              </label>
                              <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="phone_number"
                                className="block text-sm font-medium mb-1"
                              >
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={profileData.phone_number}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium mb-2">
                              Address
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                <label
                                  htmlFor="address"
                                  className="block text-sm font-medium mb-1"
                                >
                                  Street Address
                                </label>
                                <input
                                  type="text"
                                  id="address"
                                  name="address"
                                  value={profileData.address}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="city"
                                  className="block text-sm font-medium mb-1"
                                >
                                  City
                                </label>
                                <input
                                  type="text"
                                  id="city"
                                  name="city"
                                  value={profileData.city}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="country"
                                  className="block text-sm font-medium mb-1"
                                >
                                  Country
                                </label>
                                <input
                                  type="text"
                                  id="country"
                                  name="country"
                                  value={profileData.country}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label
                              htmlFor="bio"
                              className="block text-sm font-medium mb-1"
                            >
                              Bio
                            </label>
                            <textarea
                              id="bio"
                              name="bio"
                              rows={4}
                              value={profileData.bio}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              placeholder="Tell others about yourself..."
                            ></textarea>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors flex items-center"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={18} className="mr-1" />
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Security Settings</h2>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">
                      Change Password
                    </h3>
                    <form onSubmit={handleUpdatePassword}>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium mb-1"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium mb-1"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium mb-1"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            required
                          />
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
                            disabled={loading}
                          >
                            {loading ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
