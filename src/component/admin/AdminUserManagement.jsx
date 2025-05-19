import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import EditUserModal from "./EditUserModal";

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

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage, limit);
  }, [currentPage, limit]);

  const fetchUsers = async (page, limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers({ page, limit });
      console.log("✋response", response);

      const { data, totalUsers, totalPages, currentPage } = response;
      console.log("✋data", data);

      setUsers(data || []);
      setTotalPages(totalPages || 1);
      setCurrentPage(currentPage || 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      await userService.createUser(newUserData);
      setIsCreateModalOpen(false);
      setNewUserData({});
      fetchUsers(currentPage, limit);
    } catch (err) {
      console.error("Error creating user:", err);
      setCreateError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const updatedData = {
        ...editUserData,
        national_id: editUserData.national_id
          ? String(editUserData.national_id)
          : undefined,
      };

      await userService.updateUser(editingUser._id, updatedData);
      setIsEditModalOpen(false);
      setEditingUser(null);
      setEditUserData({});
      fetchUsers(currentPage, limit);
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

  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      await userService.deleteUser(userId);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers(currentPage, limit);
    } catch (err) {
      console.error("Error deleting user:", err);
      // You might want to show an error message to the user here
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`/admin/users?page=${newPage}`);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name || "",
      lastName: user.lastName || "",
      phone_number: user.phone_number || "",
      national_id: user.national_id ? String(user.national_id) : "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      {/* Add User Button Placeholder */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* Users List/Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(user);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(user);
                      }}
                      className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
          setEditError(null);
        }}
        onSubmit={handleUpdateUser}
        loading={editLoading}
        error={editError}
        editingUser={editingUser}
        editUserData={editUserData}
        setEditUserData={setEditUserData}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirmDelete={() => handleDeleteUser(userToDelete?._id)}
        loading={deleteLoading}
        userName={userToDelete?.username}
      />
    </div>
  );
};

export default AdminUserManagement;
