import React, { useState, useEffect } from "react";

const ItemFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  onFileChange,
  onCategoryChange,
  categories,
  subcategories,
  selectedCategoryId,
  isEditing,
}) => {
  const [changes, setChanges] = useState({});

  useEffect(() => {
    // Reset changes when modal opens
    if (isOpen) {
      setChanges({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (formData[name] !== value) {
      setChanges((prev) => ({ ...prev, [name]: value }));
    } else {
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[name];
        return newChanges;
      });
    }
    onInputChange(e);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      // Use the correct field names expected by the backend
      const fieldName = name === "itemCover" ? "item_cover" : "item_pictures";
      setChanges((prev) => ({ ...prev, [fieldName]: files }));
    } else {
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[
          name === "itemCover" ? "item_cover" : "item_pictures"
        ];
        return newChanges;
      });
    }
    onFileChange(e);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    if (selectedCategoryId !== categoryId) {
      setChanges((prev) => ({
        ...prev,
        category: categoryId,
        subcategory: "", // Reset subcategory when category changes
      }));
      // Reset subcategory in form data
      onInputChange({
        target: { name: "subcategory", value: "" },
      });
    } else {
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges.category;
        delete newChanges.subcategory;
        return newChanges;
      });
    }
    onCategoryChange(e);
  };

  const handleSubcategoryChange = (e) => {
    const { value } = e.target;
    if (formData.subcategory !== value) {
      setChanges((prev) => ({ ...prev, subcategory: value }));
    } else {
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges.subcategory;
        return newChanges;
      });
    }
    onInputChange(e);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (formData[name] !== checked) {
      setChanges((prev) => ({ ...prev, [name]: checked }));
    } else {
      setChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[name];
        return newChanges;
      });
    }
    onInputChange({
      target: { name, value: checked },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(changes);
  };

  if (!isOpen) return null;
  console.log("🦆subcategories", subcategories);

  const filteredSubcategories = subcategories.filter(
    (sub) =>
      sub.category?._id === selectedCategoryId ||
      sub.category === selectedCategoryId
  );

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal closing when clicking inside
      >
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Item" : "Create New Item"}
          </h3>
          <div className="mt-2 px-7 py-3 overflow-y-auto max-h-[70vh]">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  required
                ></textarea>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Item Status */}
              <div>
                <label
                  htmlFor="itemStatus"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Item Status
                </label>
                <select
                  name="itemStatus"
                  id="itemStatus"
                  value={formData.itemStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                  required
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Is Featured */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Is Featured
                </label>
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Subcategory
                  </label>
                  <select
                    name="subcategory"
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={handleSubcategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    required
                    disabled={!selectedCategoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Uploads */}
              <div>
                <label
                  htmlFor="itemCover"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Item Cover Image
                </label>
                {isEditing &&
                  formData.itemCover &&
                  typeof formData.itemCover === "string" && (
                    <div className="mb-2">
                      <span className="text-gray-500 text-sm">Current:</span>
                      <img
                        src={formData.itemCover}
                        alt="Current Cover"
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                <input
                  type="file"
                  name="itemCover"
                  id="itemCover"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  accept="image/*"
                  required={!isEditing} // Required only for new items
                />
              </div>
              <div>
                <label
                  htmlFor="itemPictures"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Additional Item Images
                </label>
                {isEditing &&
                  formData.itemPictures &&
                  formData.itemPictures.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="text-gray-500 text-sm w-full">
                        Current:
                      </span>
                      {formData.itemPictures.map(
                        (pic, index) =>
                          typeof pic === "string" && (
                            <img
                              key={index}
                              src={pic}
                              alt={`Current Pic ${index + 1}`}
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          )
                      )}
                    </div>
                  )}
                <input
                  type="file"
                  name="itemPictures"
                  id="itemPictures"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  accept="image/*"
                  multiple
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
                >
                  {isEditing ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemFormModal;
