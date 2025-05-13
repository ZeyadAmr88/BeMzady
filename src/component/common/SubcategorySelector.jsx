import React, { useState, useEffect } from 'react';
import { subcategoryService } from '../services/api';

const SubcategorySelector = ({ categoryId, value, onChange, className }) => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupedSubcategories, setGroupedSubcategories] = useState({});

    useEffect(() => {
        // Reset subcategories when category changes
        if (!categoryId) {
            setSubcategories([]);
            setGroupedSubcategories({});
            return;
        }

        const fetchSubcategories = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await subcategoryService.getSubcategoriesByCategory(categoryId);
                // Handle the API response format
                const subcategoriesData = response.data.data || [];
                setSubcategories(subcategoriesData);

                // Group subcategories by their parent category
                const grouped = subcategoriesData.reduce((acc, subcategory) => {
                    // Extract category information from the subcategory
                    const categoryId = subcategory.category._id;
                    const categoryName = subcategory.category.name;

                    if (!acc[categoryId]) {
                        acc[categoryId] = {
                            name: categoryName,
                            subcategories: []
                        };
                    }

                    acc[categoryId].subcategories.push(subcategory);
                    return acc;
                }, {});

                setGroupedSubcategories(grouped);

                // If there's a selected value, verify it exists in the new data
                if (value) {
                    const subcategoryExists = subcategoriesData.some(sub => sub._id === value);
                    if (!subcategoryExists && onChange) {
                        onChange({ target: { name: 'subcategory', value: '' } });
                    }
                }
            } catch (err) {
                console.error('Error fetching subcategories:', err);
                setError('Failed to load subcategories');
                setSubcategories([]);
                setGroupedSubcategories({});
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryId, value, onChange]);

    return (
        <div className="relative">
            {loading ? (
                <select
                    disabled
                    className={`w-full p-2 border rounded-md bg-gray-100 ${className}`}
                >
                    <option>Loading subcategories...</option>
                </select>
            ) : (
                <select
                    value={value || ''}
                    onChange={onChange}
                    name="subcategory"
                    className={`w-full p-2 border rounded-md ${className}`}
                    disabled={!categoryId || subcategories.length === 0}
                >
                    <option value="">Select a subcategory</option>
                    {Object.keys(groupedSubcategories).map((categoryId) => (
                        <optgroup key={categoryId} label={groupedSubcategories[categoryId].name}>
                            {groupedSubcategories[categoryId].subcategories.map((subcategory) => (
                                <option key={subcategory._id} value={subcategory._id}>
                                    {subcategory.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {!loading && !error && subcategories.length === 0 && categoryId && (
                <p className="text-gray-500 text-sm mt-1">No subcategories available for this category</p>
            )}
        </div>
    );
};

export default SubcategorySelector;