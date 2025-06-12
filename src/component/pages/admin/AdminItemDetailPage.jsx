import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  itemService,
  categoryService,
  subcategoryService,
} from "../../services/api";
import ItemFormModal from "../../common/ItemFormModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Toast from "../../common/Toast";
import { formatCairoFullDateTime } from "../../utils/dateUtils";

const AdminItemDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await itemService.getItemById(itemId);
      console.log("🦆response", response);
      setItem(response.data.data || response.data);
      // Pre-fill form data for editing
      const fetchedItem = response.data.data || response.data;
      console.log("🦆fetchedItem", fetchedItem);
      setItemFormData({
        title: fetchedItem.title || "",
        description: fetchedItem.description || "",
        itemStatus: fetchedItem.item_status || "",
        price: fetchedItem.price || "",
        isFeatured: fetchedItem.is_featured || false,
        category: fetchedItem.category?._id || fetchedItem.category || "",
        subcategory:
          fetchedItem.subcategory && fetchedItem.subcategory.length > 0
            ? fetchedItem.subcategory[0]._id || fetchedItem.subcategory[0]
            : "",
        itemCover: fetchedItem.item_cover || null,
        itemPictures: fetchedItem.item_pictures || [],
      });
      setSelectedCategoryId(
        fetchedItem.category?._id || fetchedItem.category || ""
      );
    } catch (err) {
      console.error("Error fetching item:", err);
      setError("Failed to load item details.");
      showToast("Failed to load item details", "error");
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
    if (itemId) {
      fetchItem();
      fetchCategoriesAndSubcategories();
    }
  }, [itemId]);

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
    // Refresh item data after closing modal in case of update
    fetchItem();
  };

  const handleSubmit = async (changes) => {
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();

      // Always include the title field for slug generation
      if (!changes.title && itemFormData.title) {
        data.append("title", itemFormData.title);
      }

      // Handle category and subcategory updates
      if (changes.category) {
        data.append("category", changes.category);
        // If category changes, we need to handle subcategory
        if (changes.subcategory) {
          data.append("subcategory", changes.subcategory);
        } else {
          // If category changes but no subcategory selected, send empty string
          data.append("subcategory", "");
        }
      } else if (changes.subcategory) {
        // If only subcategory changes, include both category and subcategory
        data.append("category", selectedCategoryId);
        data.append("subcategory", changes.subcategory);
      }

      // Handle file uploads
      if (changes.item_cover) {
        if (changes.item_cover instanceof FileList) {
          data.append("item_cover", changes.item_cover[0]);
        } else if (changes.item_cover instanceof File) {
          data.append("item_cover", changes.item_cover);
        }
      }

      if (changes.item_pictures) {
        if (changes.item_pictures instanceof FileList) {
          Array.from(changes.item_pictures).forEach((file) => {
            data.append("item_pictures", file);
          });
        } else if (changes.item_pictures instanceof File) {
          data.append("item_pictures", changes.item_pictures);
        }
      }

      // Handle other changes
      for (const [key, value] of Object.entries(changes)) {
        // Skip fields we've already handled
        if (
          ["category", "subcategory", "item_cover", "item_pictures"].includes(
            key
          )
        )
          continue;

        if (value !== null && value !== "") {
          data.append(key, value);
        }
      }

      await itemService.updateItem(itemId, data);
      showToast("Item updated successfully!", "success");

      // Refresh the item data after successful update
      await fetchItem();

      handleCloseModal();
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item.");
      showToast("Failed to update item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
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
        navigate("/admin/items"); // Go back to item management after deletion
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

  const getFilteredSubcategories = () => {
    if (!selectedCategoryId) {
      return [];
    }
    return subcategories.filter(
      (sub) => sub && sub.category && sub.category._id === selectedCategoryId
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading item details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Item not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Item Details: {item.title}
        </h1>
        <button
          onClick={() => navigate("/admin/items")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            ></path>
          </svg>
          <span>Back to Items</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {item.item_cover && (
              <img
                src={item.item_cover}
                alt={item.title}
                className="w-full h-80 object-contain rounded-lg shadow-lg mb-6 border border-gray-200 dark:border-gray-700"
              />
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
              {item.item_pictures &&
                item.item_pictures.length > 0 &&
                item.item_pictures.map((pic, index) => (
                  <img
                    key={index}
                    src={pic}
                    alt={`${item.title} ${index + 1}`}
                    className="w-28 h-28 object-cover rounded-lg shadow-md cursor-pointer transform transition-transform duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-500"
                  />
                ))}
            </div>
          </div>
          <div className="space-y-4">
            {item.owner && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Owner Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {item.owner.profile_picture && (
                      <img
                        src={item.owner.profile_picture}
                        alt={item.owner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <button
                        onClick={() =>
                          navigate(`/admin/users/${item.owner._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                      >
                        {item.owner.username}
                      </button>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.owner.email}
                      </p>
                    </div>
                  </div>
                  {item.owner.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Phone: {item.owner.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Description:
              </span>{" "}
              {item.description}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Price:
              </span>{" "}
              <span className="text-green-600 font-bold text-xl">
                ${item.price}
              </span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Status:
              </span>
              <span
                className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                ${item.item_status === "available"
                    ? "bg-green-100 text-green-800"
                    : item.item_status === "sold"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {item.item_status}
              </span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Featured:
              </span>
              {item.is_featured ? (
                <span className="ml-2 text-green-500 font-bold">✔ Yes</span>
              ) : (
                <span className="ml-2 text-red-500 font-bold">✖ No</span>
              )}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Category:
              </span>{" "}
              {item.category?.name || "N/A"}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Subcategory:
              </span>
              {item.subcategory && item.subcategory.length > 0
                ? item.subcategory.map((sub) => sub.name).join(", ")
                : "N/A"}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-4">
              <span className="font-semibold">Created At:</span>{" "}
              {formatCairoFullDateTime(item.createdAt)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-semibold">Last Updated:</span>{" "}
              {formatCairoFullDateTime(item.updatedAt)}
            </p>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
                <span>Edit Item</span>
              </button>
              <button
                onClick={handleDeleteItem}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
                <span>Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
        isEditing={true}
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

export default AdminItemDetailPage;
