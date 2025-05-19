import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  categoryService
} from "../services/api";

// Custom Modal Components (will be defined below)
const CreateSubcategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  subcategoryName,
  setSubcategoryName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Create New Subcategory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {/* Close Icon */}
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

        <form onSubmit={onSubmit}>
          <div className="p-4">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter subcategory name"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSubcategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  editingSubcategory,
  editSubcategoryName,
  setEditSubcategoryName,
}) => {
  if (!isOpen || !editingSubcategory) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Edit Subcategory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {/* Close Icon */}
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

        <form onSubmit={onSubmit}>
          <div className="p-4">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter subcategory name"
                value={editSubcategoryName}
                onChange={(e) => setEditSubcategoryName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteSubcategoryModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  loading,
  subcategoryName,
}) => {
  if (!isOpen || !subcategoryName) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={loading}
          >
            {/* Close Icon */}
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
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the subcategory "
            <strong>{subcategoryName}</strong>"? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSubcategoryManagement = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // State for delete modal will be added later
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subcategoryToDeleteId, setSubcategoryToDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Fetch subcategories for the given categoryId here later
    console.log("Fetching subcategories for category:", categoryId);
    fetchSubcategories(categoryId);
  }, [categoryId]); // Refetch when categoryId changes

  const fetchSubcategories = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getSubcategoriesByCategory(id);
      // Assuming the response data is an array of subcategories
      setSubcategories(response.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setError("Failed to fetch subcategories.");
      setSubcategories([]); // Clear subcategories on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    const subcategoryData = {
      name: newSubcategoryName,
      category: categoryId, // Associate with the current category
    };

    try {
      // Using POST Create Subcategory API: /api/subcategories
      await categoryService.createSubcategory(subcategoryData);
      setIsCreateModalOpen(false);
      setNewSubcategoryName("");
      fetchSubcategories(categoryId); // Refresh list
    } catch (err) {
      console.error("Error creating subcategory:", err);
      setCreateError(
        err.response?.data?.message || "Failed to create subcategory."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    if (!editingSubcategory) return;

    setEditLoading(true);
    setEditError(null);

    const updatedSubcategoryData = {
      name: editSubcategoryName,
      category: categoryId, // Ensure category ID is included if needed by the update API
    };

    try {
      // Using PUT update subcategory API: /api/subcategories/:subcategoryId
      await categoryService.updateSubcategory(editingSubcategory._id, updatedSubcategoryData);
      setIsEditModalOpen(false);
      setEditingSubcategory(null);
      setEditSubcategoryName("");
      fetchSubcategories(categoryId); // Refresh list
    } catch (err) {
      console.error("Error updating subcategory:", err);
      setEditError(
        err.response?.data?.message || "Failed to update subcategory."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubcategory = (subcategoryId) => {
    setSubcategoryToDeleteId(subcategoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subcategoryToDeleteId) return;

    setDeleteLoading(true);
    try {
      // Use DEL delete subcategory API: /api/subcategories/:subcategoryId
      await categoryService.deleteSubcategory(subcategoryToDeleteId);
      setIsDeleteModalOpen(false);
      setSubcategoryToDeleteId(null);
      fetchSubcategories(categoryId); // Refresh list
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      // Display error in the modal or as a toast
      alert("Failed to delete subcategory."); // Using alert for simplicity, can be improved
      setIsDeleteModalOpen(false); // Close modal even on error
      setSubcategoryToDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (subcategory) => {
    setEditingSubcategory(subcategory);
    setEditSubcategoryName(subcategory.name);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading subcategories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Manage Subcategories</h2>
      <p className="mb-4">Subcategories for Category ID: {categoryId}</p>

      {/* Subcategory list/table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subcategories.length === 0 ? (
              <tr>
                <td
                  colSpan="2"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No subcategories found for this category.
                </td>
              </tr>
            ) : (
              subcategories.map((subcategory) => (
                <tr key={subcategory._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {subcategory.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Edit and Delete buttons will go here */}
                    <button
                      onClick={() => openEditModal(subcategory)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(subcategory._id)}
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

      {/* Add Subcategory Button/Form Placeholder */}
      <div className="mb-6 mt-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
        >
          Add New Subcategory
        </button>
      </div>

      {/* Modals for create/edit/delete will go here */}
      <CreateSubcategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubcategory}
        loading={createLoading}
        error={createError}
        subcategoryName={newSubcategoryName}
        setSubcategoryName={setNewSubcategoryName}
      />
      <EditSubcategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateSubcategory}
        loading={editLoading}
        error={editError}
        editingSubcategory={editingSubcategory}
        editSubcategoryName={editSubcategoryName}
        setEditSubcategoryName={setEditSubcategoryName}
      />
      <DeleteSubcategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={confirmDelete}
        loading={deleteLoading}
        subcategoryName={
          subcategoryToDeleteId
            ? subcategories.find((s) => s._id === subcategoryToDeleteId)?.name
            : null
        }
      />
    </div>
  );
};

export default AdminSubcategoryManagement;
