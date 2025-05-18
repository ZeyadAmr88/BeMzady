import React, { useState, useEffect } from "react";

const EditUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  editingUser,
  editUserData,
  setEditUserData,
}) => {
  if (!isOpen || !editingUser) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Add more specific validation or input masking if needed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all sm:align-middle sm:max-w-lg">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-md"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Two-column grid for form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={editUserData.username || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editUserData.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={editUserData.first_name || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={editUserData.last_name || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={editUserData.phone_number || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="national_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                National ID
              </label>
              <input
                type="text"
                id="national_id"
                name="national_id"
                value={editUserData.national_id || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Role takes full width on small screens, half on medium */}
            <div className="md:col-span-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={editUserData.role || "buyer"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Add other fields like verified status if editable */}
          </div>
        </form>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
