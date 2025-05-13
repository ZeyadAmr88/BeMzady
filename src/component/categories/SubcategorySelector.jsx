import React, { useState, useEffect } from 'react';
import { subcategoryService } from '../services/api';
import { Loader2 } from 'lucide-react';

const SubcategorySelector = ({ categoryId, value, onChange, required = false, className = '' }) => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset subcategories when category changes
        if (!categoryId) {
            setSubcategories([]);
            return;
        }

        const fetchSubcategories = async () => {
            setLoading(true);
            try {
                const response = await subcategoryService.getSubcategoriesByCategory(categoryId);
                setSubcategories(response.data.data || []);
                setError(null);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setError('Failed to load subcategories');
                setSubcategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryId]);

    // If category changes and current subcategory is not in the new list, reset it
    useEffect(() => {
        if (categoryId && value && subcategories.length > 0) {
            const subcategoryExists = subcategories.some(sub => sub._id === value);
            if (!subcategoryExists) {
                onChange({ target: { name: 'subcategory', value: '' } });
            }
        }
    }, [subcategories, value, categoryId, onChange]);

    if (!categoryId) {
        return (
            <select
                disabled
                className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${className}`}
            >
                <option value="">Select a category first</option>
            </select>
        );
    }

    return (
        <div className="relative">
            <select
                name="subcategory"
                value={value || ''}
                onChange={onChange}
                required={required}
                disabled={loading || subcategories.length === 0}
                className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md ${loading ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 ${className}`}
            >
                <option value="">{loading ? 'Loading...' : subcategories.length === 0 ? 'No subcategories available' : 'Select a subcategory'}</option>
                {subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                    </option>
                ))}
            </select>

            {loading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};

export default SubcategorySelector;