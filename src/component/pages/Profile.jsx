"use client";

import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
// import { useToast } from "../contexts/ToastContext"
import { userService } from "../services/api"
import { User, Mail, Phone, MapPin, Package, Heart, Gavel, Settings, LogOut, Edit, Camera, Save, X, BarChart2 } from 'lucide-react'
import ProfileCompletedAuctions from "./ProfileCompletedAuctions"
import SellerDashboard from "./SellerDashboard"
import { useAddress } from "../contexts/AddressContext"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { updateAddress } = useAddress();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    street: "",
    city: "",
    building: "",
    floor: "",
    address: "",
    phone_number: "",
    national_id: "",
    user_picture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Check if we're on a nested route
  const isNestedRoute =
    location.pathname.includes("/profile/") &&
    location.pathname !== "/profile/";

  useEffect(() => {
    if (user && !isEditing) {
      const addressParts = user.address ? user.address.split(', ') : ['', '', '', ''];
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        street: addressParts[0] || "",
        city: addressParts[1] || "",
        building: addressParts[2] || "",
        floor: addressParts[3] || "",
        address: user.address || "",
        phone_number: user.phone_number || "",
        national_id: user.national_id || "",
        user_picture: null
      }));
      setPreviewImage(user.user_picture);
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value
      };

      // If any address component changes, update the concatenated address
      if (['street', 'city', 'building', 'floor'].includes(name)) {
        const addressComponents = [
          newData.street,
          newData.city,
          newData.building,
          newData.floor
        ].filter(Boolean); // Remove empty values
        newData.address = addressComponents.join(', ');
      }

      return newData;
    });

    // Check username availability when username changes
    if (name === 'username' && value !== user.username) {
      checkUsernameAvailability(value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || trimmedUsername === user?.username) {
      setUsernameError("");
      return;
    }

    try {
      const response = await fetch("https://be-mazady.vercel.app/api/users/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to check username");
      }

      if (data.message === "Username is available") {
        setUsernameError("");
      } else {
        setUsernameError("This username is already taken");
        toast.error("This username is already taken");
      }

    } catch (data) {
      console.error("Error checking username:", data);
      setUsernameError(data.message);
      toast.error(data.message);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        user_picture: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Early return if username is invalid
    if (usernameError) {
      toast.error("Please choose a different username");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await userService.updateProfile(user._id, formDataToSend);

      if (response.data.status === "success") {
        const updatedUser = response.data.data;

        // Update user context first
        updateUser(updatedUser);
        updateAddress(updatedUser.address);

        // Update local state with the new user data
        const addressParts = updatedUser.address ? updatedUser.address.split(', ') : ['', '', '', ''];

        // Update form data using functional update
        setFormData(prev => ({
          ...prev,
          first_name: updatedUser.first_name || "",
          last_name: updatedUser.last_name || "",
          username: updatedUser.username || "",
          email: updatedUser.email || "",
          street: addressParts[0] || "",
          city: addressParts[1] || "",
          building: addressParts[2] || "",
          floor: addressParts[3] || "",
          address: updatedUser.address || "",
          phone_number: updatedUser.phone_number || "",
          national_id: updatedUser.national_id || "",
          user_picture: null
        }));

        // Update preview image
        setPreviewImage(updatedUser.user_picture || null);

        // Close the form before navigation
        setIsEditing(false);

        // Show success message
        toast.success("Profile updated successfully!");

        // Navigate after form is closed
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      // Handle username validation errors
      if (error.response?.data?.errors) {
        const usernameError = error.response.data.errors.find(err => err.path === 'username');
        if (usernameError) {
          setUsernameError(usernameError.msg);
          toast.error(usernameError.msg);
        } else {
          toast.error("Failed to update profile");
        }
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await userService.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Password updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsEditing(false); // Close form immediately after password update
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Replace the address textarea with this new section in both view and edit modes
  const renderAddressSection = () => (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium mb-4">Address Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Street</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter street name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter city name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Building</label>
          <input
            type="text"
            name="building"
            value={formData.building}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter building number/name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Floor</label>
          <input
            type="text"
            name="floor"
            value={formData.floor}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter floor number"
            required
          />
        </div>
      </div>
      {!isEditing && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Full Address</label>
          <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            {formData.address || "No address provided"}
          </p>
        </div>
      )}
    </div>
  );

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
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={formData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold">{formData.username}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {formData.email}
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
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <img
                              src={previewImage || "/placeholder.svg"}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover"
                            />
                            {isEditing && (
                              <label className="absolute bottom-0 right-0 bg-rose-600 text-white p-2 rounded-full cursor-pointer hover:bg-rose-700">
                                <Camera size={20} />
                                <input
                                  type="file"
                                  name="user_picture"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                          {isEditing && previewImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImage(null);
                                setFormData(prev => ({ ...prev, user_picture: null }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              First Name
                            </h3>
                            <p className="mt-1">{formData.first_name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Last Name
                            </h3>
                            <p className="mt-1">{formData.last_name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email
                            </h3>
                            <p className="mt-1">{formData.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone Number
                            </h3>
                            <p className="mt-1">{formData.phone_number}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              National ID
                            </h3>
                            <p className="mt-1">{formData.national_id}</p>
                          </div>
                        </div>

                        {renderAddressSection()}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <img
                              src={previewImage || "/placeholder.svg"}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover"
                            />
                            {isEditing && (
                              <label className="absolute bottom-0 right-0 bg-rose-600 text-white p-2 rounded-full cursor-pointer hover:bg-rose-700">
                                <Camera size={20} />
                                <input
                                  type="file"
                                  name="user_picture"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                          {isEditing && previewImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImage(null);
                                setFormData(prev => ({ ...prev, user_picture: null }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${usernameError ? 'border-red-500' : ''
                                }`}
                              required
                            />
                            {usernameError && (
                              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input
                              type="tel"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">National ID</label>
                            <input
                              type="text"
                              name="national_id"
                              value={formData.national_id}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                              required
                            />
                          </div>
                        </div>

                        {renderAddressSection()}

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !!usernameError}
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Save size={20} className="mr-2" />
                            )}
                            Save Changes
                          </button>
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
