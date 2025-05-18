import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOneUser, updateUser, deleteUser } from "../../services/api";
import EditUserModal from "../admin/EditUserModal";

const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  loading,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Delete User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete the user "{userName}"? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOneUser(userId);
      setUser(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      // Convert national_id to string if it exists
      const updatedData = {
        ...editUserData,
        national_id: editUserData.national_id
          ? String(editUserData.national_id)
          : undefined,
      };

      await updateUser(userId, updatedData);
      setIsEditModalOpen(false);
      setEditUserData({});
      fetchUserDetails(); // Refresh user details
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to update user.";
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(userId);
      navigate("/admin/users"); // Redirect to users list after deletion
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = () => {
    setEditUserData({
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone_number: user.phone_number || "",
      national_id: user.national_id ? String(user.national_id) : "",
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading user details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="space-x-4">
          <button
            onClick={openEditModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit User
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
          >
            Delete User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Username
                </label>
                <p className="mt-1">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Role
                </label>
                <p className="mt-1 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  First Name
                </label>
                <p className="mt-1">{user.first_name || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Name
                </label>
                <p className="mt-1">{user.last_name || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phone Number
                </label>
                <p className="mt-1">{user.phone_number || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  National ID
                </label>
                <p className="mt-1">{user.national_id || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email Verification
                </label>
                <p className="mt-1">
                  {user.verified ? "Verified" : "Not Verified"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Created At
                </label>
                <p className="mt-1">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="mt-1">
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user.favorite_list && user.favorite_list.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Favorite Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.favorite_list.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  {/* Add favorite item details here */}
                  <p>Item {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateUser}
        loading={editLoading}
        error={editError}
        editingUser={user}
        editUserData={editUserData}
        setEditUserData={setEditUserData}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleDeleteUser}
        loading={deleteLoading}
        userName={user.username}
      />
    </div>
  );
};

export default AdminUserDetails;
