import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  itemService,
  categoryService,
  subcategoryService,
} from "../../services/api";
import ItemFormModal from "../../common/ItemFormModal"; // We will create this
import ConfirmationModal from "../../common/ConfirmationModal";
import Toast from "../../common/Toast";

const AdminItemManagement = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    itemId: null,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [itemFormData, setItemFormData] = useState({
    title: "",
    description: "",
    itemStatus: "available",
    price: "",
    isFeatured: false,
    category: "",
    subcategory: "",
    itemCover: null,
    itemPictures: [],
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getItems();
      setItems(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items.");
      showToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const categoriesResponse = await categoryService.getCategories();
      setCategories(
        categoriesResponse.data.data || categoriesResponse.data || []
      );
      const subcategoriesResponse = await subcategoryService.getSubcategories();
      setSubcategories(
        subcategoriesResponse.data.data || subcategoriesResponse.data || []
      );
    } catch (err) {
      console.error("Error fetching categories or subcategories:", err);
      showToast("Failed to load categories and subcategories", "error");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    if (currentItem) {
      setItemFormData({
        title: currentItem.title || "",
        description: currentItem.description || "",
        itemStatus: currentItem.itemStatus || "available",
        price: currentItem.price || "",
        isFeatured: currentItem.isFeatured || false,
        category: currentItem.category?._id || currentItem.category || "",
        subcategory:
          currentItem.subcategory?._id || currentItem.subcategory || "",
        itemCover: null,
        itemPictures: [],
      });
      setSelectedCategoryId(
        currentItem.category?._id || currentItem.category || ""
      );
    } else {
      setItemFormData({
        title: "",
        description: "",
        itemStatus: "available",
        price: "",
        isFeatured: false,
        category: "",
        subcategory: "",
        itemCover: null,
        itemPictures: [],
      });
      setSelectedCategoryId("");
    }
  }, [currentItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemFormData({ ...itemFormData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "itemCover") {
      setItemFormData({ ...itemFormData, itemCover: files[0] });
    } else if (name === "itemPictures") {
      setItemFormData({
        ...itemFormData,
        itemPictures: Array.from(files),
      });
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setItemFormData({
      ...itemFormData,
      category: categoryId,
      subcategory: "",
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      // Append text fields
      for (const key in itemFormData) {
        if (
          key !== "itemCover" &&
          key !== "itemPictures" &&
          itemFormData[key] !== null &&
          itemFormData[key] !== ""
        ) {
          data.append(key, itemFormData[key]);
        }
      }

      // Append files
      if (itemFormData.itemCover) {
        data.append("itemCover", itemFormData.itemCover);
      }
      if (itemFormData.itemPictures && itemFormData.itemPictures.length > 0) {
        itemFormData.itemPictures.forEach((file) => {
          data.append("itemPictures", file);
        });
      }

      if (currentItem) {
        await itemService.updateItem(currentItem._id, data);
        showToast("Item updated successfully!", "success");
      } else {
        await itemService.createItem(data);
        showToast("Item created successfully!", "success");
      }

      fetchItems();
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting item form:", err);
      setError(`Failed to ${currentItem ? "update" : "create"} item.`);
      showToast(`Failed to ${currentItem ? "update" : "create"} item`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (itemId) => {
    // Prevent event propagation to avoid triggering the row click
    event?.stopPropagation();
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      itemId,
    });
  };

  const handleConfirmation = async () => {
    const { type, itemId } = confirmationModal;
    setLoading(true);
    setError(null);
    try {
      if (type === "delete") {
        await itemService.deleteItem(itemId);
        showToast("Item deleted successfully!", "success");
        // Remove the deleted item from the local state
        setItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
      }
    } catch (err) {
      console.error(`Error ${type}ing item:`, err);
      setError(`Failed to ${type} item.`);
      showToast(`Failed to ${type} item`, "error");
    } finally {
      setLoading(false);
      setConfirmationModal({ isOpen: false, type: null, itemId: null });
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, type: null, itemId: null });
  };

  const handleItemClick = (itemId) => {
    navigate(`/admin/items/${itemId}`);
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const getFilteredSubcategories = () => {
    if (!selectedCategoryId) {
      return [];
    }
    return subcategories.filter(
      (sub) => sub.category._id === selectedCategoryId
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Item Management
      </h1>

      {loading && <p className="text-center text-gray-500">Loading items...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-center text-gray-500">No items found.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleItemClick(item._id)}
                >
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    {item.item_cover && (
                      <img
                        src={item.item_cover}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover shadow-sm"
                      />
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {item.title}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    {item.category?.name || "N/A"}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    {item.subcategory && item.subcategory.length > 0
                      ? item.subcategory.map((sub) => sub.name).join(", ")
                      : "N/A"}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold text-green-600">
                      ${item.price}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        item.item_status === "available"
                          ? "bg-green-100 text-green-800"
                          : item.item_status === "sold"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.item_status}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                    {item.is_featured ? (
                      <span className="text-green-500 font-bold">✔</span>
                    ) : (
                      <span className="text-red-500 font-bold">✖</span>
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <div className="flex space-x-3 items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item._id);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-100"
                        title="View/Edit Item"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L10.5 20.5H3V13.5L15.232 5.232z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item._id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-100"
                        title="Delete Item"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ItemFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={itemFormData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        categories={categories}
        subcategories={getFilteredSubcategories()}
        onCategoryChange={handleCategoryChange}
        selectedCategoryId={selectedCategoryId}
        isEditing={!!currentItem}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmation}
        message={`Are you sure you want to delete this item?`}
        confirmText="Delete"
      />

      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default AdminItemManagement;
