import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { categoryService, itemService } from "./services/api"
import { AuthContext } from "./contexts/AuthContext"
import { toast } from "react-toastify"
import SubcategorySelector from "./categories/SubcategorySelector"

const AddItem = () => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [categories, setCategories] = useState([])
    // const [subcategories, setsubCategories] = useState([])

    const [loading, setLoading] = useState(false)
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
        is_featured: false
    })

    useEffect(() => {
        // Fetch categories when component mounts
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories({ limit: 100 })
                // Make sure we're accessing the correct data structure
                setCategories(response.data.data || [])
                console.log("Categories fetched:", response.data)
            } catch (error) {
                console.error("Error fetching categories:", error)
                toast.error("Failed to fetch categories")
                // Initialize with empty array to prevent map errors
                setCategories([])
            }
        }
        fetchCategories()
    }, [])
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
        const { name, value } = e.target

        // Special handling for boolean is_featured field
        if (name === "is_featured") {
            setFormData(prev => ({
                ...prev,
                [name]: value === "true" // Convert string "true"/"false" to boolean
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // Function to compress image before upload
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            // If file is not an image or is small enough, don't compress
            if (!file.type.startsWith('image/') || file.size <= 500 * 1024) { // Reduced to 500KB
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
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

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to Blob with reduced quality
                    canvas.toBlob(
                        (blob) => {
                            // Create a new file from the blob
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
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

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size before processing
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size exceeds 5MB. Please choose a smaller image.");
            e.target.value = ''; // Clear the input
            return;
        }

        try {
            const loadingToast = toast.loading("Processing image...");
            const processedFile = await compressImage(file);

            setFormData(prev => ({
                ...prev,
                item_cover: processedFile
            }));

            toast.update(loadingToast, {
                render: "Image processed successfully",
                type: "success",
                isLoading: false,
                autoClose: 1000
            });

            // Show file size information
            const originalSize = (file.size / (1024 * 1024)).toFixed(2);
            const newSize = (processedFile.size / (1024 * 1024)).toFixed(2);

            if (originalSize !== newSize) {
                toast.info(`Image compressed: ${originalSize}MB → ${newSize}MB`);
            }
        } catch (error) {
            console.error("Error processing image:", error);
            toast.error("Failed to process image. Please try another image.");
            e.target.value = ''; // Clear the input
        }
    };

    const handlePicturesChange = async (e) => {
        const files = Array.from(e.target.files);

        // Check total size of all files
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 10 * 1024 * 1024) { // 10MB total limit
            toast.error("Total size of all images exceeds 10MB. Please choose smaller images.");
            e.target.value = ''; // Clear the input
            return;
        }

        try {
            const loadingToast = toast.loading("Processing images...");
            const processedFiles = await Promise.all(files.map(file => compressImage(file)));

            setFormData(prev => ({
                ...prev,
                item_pictures: processedFiles
            }));

            toast.update(loadingToast, {
                render: "Images processed successfully",
                type: "success",
                isLoading: false,
                autoClose: 1000
            });
        } catch (error) {
            console.error("Error processing images:", error);
            toast.error("Failed to process some images. Please try again.");
            e.target.value = ''; // Clear the input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Check if user is authenticated
            const token = localStorage.getItem("token")
            if (!token) {
                toast.error("You must be logged in to create an item")
                navigate("/login")
                return
            }

            // Validate total size of all images
            const totalSize = (formData.item_cover ? formData.item_cover.size : 0) +
                formData.item_pictures.reduce((acc, file) => acc + file.size, 0);

            if (totalSize > 10 * 1024 * 1024) { // 10MB total limit
                toast.error("Total size of all images exceeds 10MB. Please reduce image sizes.");
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData()

            // Add all the text fields
            formDataToSend.append("title", formData.title)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("price", formData.price)
            formDataToSend.append("quantity", formData.quantity)
            formDataToSend.append("category", formData.category)
            formDataToSend.append("subcategory", formData.subcategory)
            // Use 'owner' instead of 'seller' if backend expects it
            const sellerId = user?._id || localStorage.getItem("user_id")
            if (!sellerId) {
                toast.error("User ID not found. Please log in again.")
                navigate("/login")
                return
            }
            formDataToSend.append("owner", sellerId)
            // Convert boolean to string "true" or "false" for FormData
            formDataToSend.append("is_featured", formData.is_featured.toString())

            // Add the image if it exists
            if (formData.item_cover) {
                formDataToSend.append("item_cover", formData.item_cover)
            }
            if (formData.item_pictures && formData.item_pictures.length > 0) {
                formData.item_pictures.forEach((file) => {
                    formDataToSend.append("item_pictures", file)
                })
            }

            // Log the token for debugging (remove in production)
            console.log("Using token:", token.substring(0, 10) + "...")

            // Log form data for debugging
            console.log("Form data being sent:")
            for (let [key, value] of formDataToSend.entries()) {
                if (key === "item_cover" || key === "item_pictures") {
                    console.log(`${key}: [File] ${value.name} (${(value.size / 1024).toFixed(2)} KB)`)
                } else {
                    console.log(`${key}: ${value}`)
                }
            }

            // Show uploading toast
            const uploadingToast = toast.loading("Uploading item data...")

            // Use the itemService to create the item
            const response = await itemService.createItem(formDataToSend)

            // Update toast on success
            toast.update(uploadingToast, {
                render: "Item added successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            })

            console.log("Item created:", response.data)
            navigate("/items")
            toast.success("item created successfully")
        } catch (error) {
            console.error("Error creating item:", error)

            // Handle specific error types
            if (error.code === "ECONNABORTED") {
                toast.error("Request timed out. The server is taking too long to respond. Please try again with a smaller image or check your internet connection.")
            } else if (error.response) {
                // Handle authentication errors
                if (error.response.status === 401) {
                    toast.error("Authentication failed. Please log in again.")
                    localStorage.removeItem("token")
                    localStorage.removeItem("user_id")
                    navigate("/login")
                } else if (error.response.status === 403) {
                    toast.error("You don't have permission to create items.")
                } else {
                    // Other server errors
                    toast.error(error.response.data?.message || `Server error: ${error.response.status}`)
                }
            } else if (error.request) {
                // Request was made but no response received
                toast.error("No response from server. Please check your internet connection.")
            } else {
                // Something else went wrong
                toast.error("Failed to add item: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="subcategory">Subcategory</label>
                    <SubcategorySelector
                        categoryId={formData.category}
                        value={formData.subcategory}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Is Featured</label>
                    <select
                        name="is_featured"
                        value={formData.is_featured.toString()}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Cover</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        required
                    />
                    {formData.item_cover && (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>File: {formData.item_cover.name}</p>
                            <p>Size: {(formData.item_cover.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Pictures</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePicturesChange}
                    />
                    {formData.item_pictures && formData.item_pictures.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                            {formData.item_pictures.map((file, idx) => (
                                <div key={idx}>{file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Item"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddItem