import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/api"; // Assuming API service methods are here

// Custom Modal Components
const CreateCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  newCategoryName,
  setNewCategoryName,
  newCategoryImage,
  setNewCategoryImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Create New Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {/* Close Icon - replace with your project's icon component */}
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
                Category Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCategoryImage(e.target.files[0])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-rose-50 file:text-rose-700
                  hover:file:bg-rose-100 dark:file:bg-rose-900 dark:file:text-rose-200 dark:hover:file:bg-rose-800
                  cursor-pointer
                "
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
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  editingCategory,
  editCategoryName,
  setEditCategoryName,
  editCategoryImage,
  setEditCategoryImage,
}) => {
  if (!isOpen || !editingCategory) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Edit Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {/* Close Icon - replace with your project's icon component */}
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
                Category Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                placeholder="Enter category name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Image
              </label>
              {editingCategory?.categoryImage && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current Image:
                  </p>
                  <img
                    src={editingCategory.categoryImage}
                    alt="Current Category Image"
                    className="h-10 w-10 rounded object-cover mt-1"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditCategoryImage(e.target.files[0])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-rose-50 file:text-rose-700
                  hover:file:bg-rose-100 dark:file:bg-rose-900 dark:file:text-rose-200 dark:hover:file:bg-rose-800
                  cursor-pointer
                "
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave blank to keep the current image.
              </p>
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

const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  loading,
  categoryName,
}) => {
  if (!isOpen || !categoryName) return null;

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
            Are you sure you want to delete the category "
            <strong>{categoryName}</strong>"? This action cannot be undone.
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

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // Default limit, can be made configurable
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories(currentPage, limit);
  }, [currentPage, limit]);

  const fetchCategories = async (page, limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories({ page, limit });
      console.log("Categories response:", response);

      const data = response.data;
      console.log("Categories data:", data);

      if (data && Array.isArray(data.data)) {
        setCategories(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        setCategories([]);
        setTotalPages(1);
        console.warn("Unexpected API response format for categories:", data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    const formData = new FormData();
    formData.append("name", newCategoryName);
    if (newCategoryImage) {
      formData.append("categoryImage", newCategoryImage);
    }

    try {
      // Using POST Create Category API: /api/categories
      await categoryService.createCategory(formData);
      setIsCreateModalOpen(false);
      setNewCategoryName("");
      setNewCategoryImage(null);
      fetchCategories(currentPage, limit); // Refresh list
    } catch (err) {
      console.error("Error creating category:", err);
      // Assuming API error response structure might vary, show a generic message or parse error
      setCreateError(
        err.response?.data?.message || "Failed to create category."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    setEditLoading(true);
    setEditError(null);

    const formData = new FormData();
    formData.append("name", editCategoryName);
    // Only append image if a new one is selected
    if (editCategoryImage) {
      formData.append("categoryImage", editCategoryImage);
    }

    try {
      // Using PUT update category by id API: /api/categories/{category_id}
      await categoryService.updateCategory(editingCategory._id, formData);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryImage(null);
      fetchCategories(currentPage, limit); // Refresh list
    } catch (err) {
      console.error("Error updating category:", err);
      setEditError(err.response?.data?.message || "Failed to update category.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setCategoryToDeleteId(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDeleteId) return;

    try {
      // Use DEL delete category by id API: /api/categories/{category_id}
      await categoryService.deleteCategory(categoryToDeleteId);
      setIsDeleteModalOpen(false);
      setCategoryToDeleteId(null);
      fetchCategories(currentPage, limit); // Refresh list
    } catch (err) {
      console.error("Error deleting category:", err);
      // Display error in the modal or as a toast
      alert("Failed to delete category."); // Using alert for simplicity, can be improved
      setIsDeleteModalOpen(false); // Close modal even on error
      setCategoryToDeleteId(null);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImage(null); // Reset image input
    setIsEditModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/admin/categories/${categoryId}/subcategories`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }
  console.log("🦆 categories", categories);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        Manage Categories and SubCategories
      </h2>

      {/* Add Category Button to open modal */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition-colors"
        >
          Add New Category
        </button>
      </div>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        loading={createLoading}
        error={createError}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryImage={newCategoryImage}
        setNewCategoryImage={setNewCategoryImage}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCategory}
        loading={editLoading}
        error={editError}
        editingCategory={editingCategory}
        editCategoryName={editCategoryName}
        setEditCategoryName={setEditCategoryName}
        editCategoryImage={editCategoryImage}
        setEditCategoryImage={setEditCategoryImage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={confirmDelete}
        loading={loading}
        categoryName={
          categories.find((cat) => cat._id === categoryToDeleteId)?.name
        }
      />

      {/* Categories List/Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <tr
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={category.categoryImage}
                    alt={category.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(category);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category._id);
                    }}
                    className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
