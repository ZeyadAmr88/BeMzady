import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService, itemService } from "./services/api";
import { AuthContext } from "./contexts/AuthContext";
import { toast } from "react-toastify";
import SubcategorySelector from "./categories/SubcategorySelector";
import {
  Upload,
  DollarSign,
  Tag,
  Package,
  Star,
  AlertCircle,
} from "lucide-react";

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  // const [subcategories, setsubCategories] = useState([])

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    subcategory: "",
    seller: user?._id || localStorage.getItem("user_id") || "",
    item_cover: null,
    item_pictures: [],
    is_featured: false,
  });
  const [errors, setErrors] = useState({});
  const [previewCover, setPreviewCover] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({ limit: 100 });
        // Make sure we're accessing the correct data structure
        setCategories(response.data.data || []);
        console.log("Categories fetched:", response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
        // Initialize with empty array to prevent map errors
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  // useEffect(() => {
  //     // Fetch categories when component mounts
  //     const fetchSubCategories = async () => {
  //         try {
  //             const response = await categoryService.getSubcategoriesByCategory({ limit: 100 })
  //             // Make sure we're accessing the correct data structure
  //             setsubCategories(response.data.data || [])
  //             console.log("Categories fetched:", response.data)
  //         } catch (error) {
  //             console.error("Error fetching categories:", error)
  //             toast.error("Failed to fetch categories")
  //             // Initialize with empty array to prevent map errors
  //             setCategories([])
  //         }
  //     }
  //     fetchSubCategories()
  // }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for boolean is_featured field
    if (name === "is_featured") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Function to compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // If file is not an image or is small enough, don't compress
      if (!file.type.startsWith("image/") || file.size <= 500 * 1024) {
        // Reduced to 500KB
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const MAX_WIDTH = 800; // Reduced from 1200
          const MAX_HEIGHT = 800; // Reduced from 1200

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to Blob with reduced quality
          canvas.toBlob(
            (blob) => {
              // Create a new file from the blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            0.6 // Reduced quality to 60%
          );
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subcategory)
      newErrors.subcategory = "Subcategory is required";
    if (!formData.item_cover) newErrors.item_cover = "Cover image is required";

    // Price validation
    if (formData.price && Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Quantity validation
    if (formData.quantity && Number(formData.quantity) < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB. Please choose a smaller image.");
      e.target.value = "";
      return;
    }

    try {
      const loadingToast = toast.loading("Processing image...");
      const processedFile = await compressImage(file);

      setFormData((prev) => ({
        ...prev,
        item_cover: processedFile,
      }));

      // Create preview URL
      setPreviewCover(URL.createObjectURL(processedFile));

      toast.update(loadingToast, {
        render: "Image processed successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });

      const originalSize = (file.size / (1024 * 1024)).toFixed(2);
      const newSize = (processedFile.size / (1024 * 1024)).toFixed(2);

      if (originalSize !== newSize) {
        toast.info(`Image compressed: ${originalSize}MB → ${newSize}MB`);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try another image.");
      e.target.value = "";
    }
  };

  const handlePicturesChange = async (e) => {
    const files = Array.from(e.target.files);

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      toast.error(
        "Total size of all images exceeds 10MB. Please choose smaller images."
      );
      e.target.value = "";
      return;
    }

    try {
      const loadingToast = toast.loading("Processing images...");
      const processedFiles = await Promise.all(
        files.map((file) => compressImage(file))
      );

      setFormData((prev) => ({
        ...prev,
        item_pictures: processedFiles,
      }));

      // Create preview URLs
      setPreviewImages(processedFiles.map((file) => URL.createObjectURL(file)));

      toast.update(loadingToast, {
        render: "Images processed successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Failed to process some images. Please try again.");
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to create an item");
        navigate("/login");
        return;
      }

      const totalSize =
        (formData.item_cover ? formData.item_cover.size : 0) +
        formData.item_pictures.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > 10 * 1024 * 1024) {
        toast.error(
          "Total size of all images exceeds 10MB. Please reduce image sizes."
        );
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Add all the text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subcategory", formData.subcategory);

      const sellerId = user?._id || localStorage.getItem("user_id");
      if (!sellerId) {
        toast.error("User ID not found. Please log in again.");
        navigate("/login");
        return;
      }
      formDataToSend.append("owner", sellerId);
      formDataToSend.append("is_featured", formData.is_featured.toString());

      if (formData.item_cover) {
        formDataToSend.append("item_cover", formData.item_cover);
      }
      if (formData.item_pictures && formData.item_pictures.length > 0) {
        formData.item_pictures.forEach((file) => {
          formDataToSend.append("item_pictures", file);
        });
      }

      const uploadingToast = toast.loading("Uploading item data...");
      const response = await itemService.createItem(formDataToSend);

      toast.update(uploadingToast, {
        render: "Item added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      navigate("/items");
    } catch (error) {
      console.error("Error creating item:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.code === "ECONNABORTED") {
      toast.error(
        "Request timed out. Please try again with a smaller image or check your internet connection."
      );
    } else if (error.response) {
      if (error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        navigate("/login");
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to create items.");
      } else {
        toast.error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      }
    } else if (error.request) {
      toast.error(
        "No response from server. Please check your internet connection."
      );
    } else {
      toast.error("Failed to add item: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Add New Item
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fill in the details below to create a new item listing
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.title
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter item title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <DollarSign size={20} />
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.price
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.price}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.description
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter item description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Quantity and Featured Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <Package size={20} />
                  </span>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.quantity
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="1"
                    min="1"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Status
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <Star size={20} />
                  </span>
                  <select
                    name="is_featured"
                    value={formData.is_featured.toString()}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <option value="true">Featured</option>
                    <option value="false">Not Featured</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category and Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <Tag size={20} />
                  </span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.category
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <Tag size={20} />
                  </span>
                  <SubcategorySelector
                    categoryId={formData.category}
                    value={formData.subcategory}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.subcategory
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.subcategory && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.subcategory}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="item_cover"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="item_cover"
                          name="item_cover"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {previewCover && (
                  <div className="mt-4">
                    <img
                      src={previewCover}
                      alt="Cover preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {errors.item_cover && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.item_cover}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="item_pictures"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="item_pictures"
                          name="item_pictures"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handlePicturesChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB total
                    </p>
                  </div>
                </div>
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
