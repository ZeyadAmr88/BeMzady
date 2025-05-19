import React, { useState, useEffect } from "react";

const AuctionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  handleFileChange,
  handleCategoryChange,
  categories,
  subcategories,
  selectedCategoryId,
  isEditing,
}) => {
  if (!isOpen) return null;

  const filteredSubcategories = subcategories.filter(
    (sub) =>
      sub.category?._id === selectedCategoryId ||
      sub.category === selectedCategoryId
  );

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent modal closing when clicking inside
      >
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            {isEditing ? "Edit Auction" : "Create New Auction"}
          </h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                ></textarea>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="startPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Price
                  </label>
                  <input
                    type="number"
                    name="startPrice"
                    id="startPrice"
                    value={formData.startPrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reservePrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Reserve Price
                  </label>
                  <input
                    type="number"
                    name="reservePrice"
                    id="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label
                    htmlFor="buyNowPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Buy Now Price
                  </label>
                  <input
                    type="number"
                    name="buyNowPrice"
                    id="buyNowPrice"
                    value={formData.buyNowPrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Minimum Bid Increment */}
              <div>
                <label
                  htmlFor="minimumBidIncrement"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Min Bid Increment
                </label>
                <input
                  type="number"
                  name="minimumBidIncrement"
                  id="minimumBidIncrement"
                  value={formData.minimumBidIncrement}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Subcategory
                  </label>
                  <select
                    name="subcategory"
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  htmlFor="auctionCover"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Auction Cover Image
                </label>
                <input
                  type="file"
                  name="auctionCover"
                  id="auctionCover"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  accept="image/*"
                />
              </div>
              <div>
                <label
                  htmlFor="auctionImages"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Additional Images
                </label>
                <input
                  type="file"
                  name="auctionImages"
                  id="auctionImages"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 rounded-md cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  accept="image/*"
                  multiple
                />
              </div>

              {/* Submit Button */}
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {isEditing ? "Save Changes" : "Create Auction"}
                </button>
                <button
                  type="button"
                  className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionFormModal;
