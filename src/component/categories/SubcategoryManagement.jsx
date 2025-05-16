import React, { useState, useEffect, useContext } from 'react';
import { subcategoryService, categoryService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Loader2, Plus, Pencil, Trash2, Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const SubcategoryManagement = () => {
    const { user } = useContext(AuthContext);
    const { showSuccess, showError } = useToast();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10); // Number of subcategories per page

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
    });

    // Check if user is admin
    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        // Fetch categories when component mounts
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 100 });
                setCategories(response.data.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                showError('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, [showError]);

    useEffect(() => {
        // Fetch subcategories when selected category changes or page changes
        const fetchSubcategories = async () => {
            setLoading(true);
            try {
                let response;
                const params = { page: currentPage, limit };

                if (selectedCategory) {
                    response = await subcategoryService.getSubcategoriesByCategory(selectedCategory);
                } else {
                    response = await subcategoryService.getSubcategories(params);
                }

                const data = response.data.data || [];
                setSubcategories(data);

                // Calculate total pages
                const total = response.data.totalSubcategories || response.data.total || 0;
                setTotalPages(Math.ceil(total / limit));

                setError(null);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setError('Failed to load subcategories. Please try again later.');
                setSubcategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [selectedCategory, currentPage, limit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.category) {
            showError('Name and category are required');
            return;
        }

        try {
            if (isEditing) {
                await subcategoryService.updateSubcategory(formData._id, formData);
                showSuccess('Subcategory updated successfully');
            } else {
                await subcategoryService.createSubcategory(formData);
                showSuccess('Subcategory created successfully');
            }

            // Reset form and refresh subcategories
            resetForm();

            // If we're editing a subcategory in the current category, refresh the list
            if (selectedCategory === formData.category) {
                const response = await subcategoryService.getSubcategoriesByCategory(selectedCategory);
                setSubcategories(response.data.data || []);
            } else if (isEditing) {
                // If we changed the category of an edited subcategory, refresh with the current filter
                setCurrentPage(1);
                if (selectedCategory) {
                    const response = await subcategoryService.getSubcategoriesByCategory(selectedCategory);
                    setSubcategories(response.data.data || []);
                } else {
                    const response = await subcategoryService.getSubcategories({ page: 1, limit });
                    setSubcategories(response.data.data || []);
                }
            }
        } catch (error) {
            console.error('Error saving subcategory:', error);
            showError(error.response?.data?.message || 'Failed to save subcategory');
        }
    };

    const handleEdit = (subcategory) => {
        setFormData({
            _id: subcategory._id,
            name: subcategory.name,
            description: subcategory.description || '',
            category: subcategory.category._id || subcategory.category,
        });
        setIsEditing(true);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subcategory?')) {
            try {
                await subcategoryService.deleteSubcategory(id);
                showSuccess('Subcategory deleted successfully');

                // Refresh the subcategories list
                const updatedSubcategories = subcategories.filter(sub => sub._id !== id);
                setSubcategories(updatedSubcategories);

                // If we deleted the last item on the page, go to previous page
                if (updatedSubcategories.length === 0 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            } catch (error) {
                console.error('Error deleting subcategory:', error);
                showError(error.response?.data?.message || 'Failed to delete subcategory');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: selectedCategory || '',
        });
        setIsEditing(false);
        setIsFormOpen(false);
    };

    const filteredSubcategories = subcategories.filter(subcategory =>
        subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">You don't have permission to access this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                    Subcategory Management
                </h1>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                        setIsEditing(false);
                        setFormData({
                            name: '',
                            description: '',
                            category: selectedCategory || '',
                        });
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Add Subcategory
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="w-full md:w-1/3">
                    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter by Category
                    </label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-1/3 relative">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Subcategories
                    </label>
                    <div className="relative">
                        <input
                            id="search"
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Subcategory Form */}
            {isFormOpen && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center"
                            >
                                {isEditing ? (
                                    <>
                                        <Check size={16} className="mr-2" />
                                        Update
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="mr-2" />
                                        Create
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Subcategories List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {loading && subcategories.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : filteredSubcategories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm
                                ? 'No subcategories match your search.'
                                : selectedCategory
                                    ? 'No subcategories found for this category.'
                                    : 'No subcategories available.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredSubcategories.map((subcategory) => (
                                    <tr key={subcategory._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {subcategory.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {subcategory.category?.name || 'Unknown Category'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {subcategory.description || 'No description'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(subcategory)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(subcategory._id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!searchTerm && totalPages > 1 && (
                    <div className="flex justify-center items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-4 text-sm text-gray-700 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubcategoryManagement;