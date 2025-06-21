import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  auctionService,
  categoryService,
  subcategoryService,
} from "../../services/api";
import AuctionFormModal from "../../common/AuctionFormModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Toast from "../../common/Toast";
import { convertToUTC } from "../../utils/dateUtils";

const AdminAuctionManagement = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    auctionId: null,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [auctionFormData, setAuctionFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startPrice: "",
    reservePrice: "",
    buyNowPrice: "",
    minimumBidIncrement: "",
    category: "",
    subcategory: "",
    auctionCover: null,
    auctionImages: [],
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionService.getAuctions();
      setAuctions(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError("Failed to load auctions.");
      showToast("Failed to load auctions", "error");
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
    fetchAuctions();
    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    if (currentAuction) {
      setAuctionFormData({
        title: currentAuction.title || "",
        description: currentAuction.description || "",
        startDate: currentAuction.startDate
          ? new Date(currentAuction.startDate).toISOString().slice(0, 16)
          : "",
        endDate: currentAuction.endDate
          ? new Date(currentAuction.endDate).toISOString().slice(0, 16)
          : "",
        startPrice: currentAuction.startPrice || "",
        reservePrice: currentAuction.reservePrice || "",
        buyNowPrice: currentAuction.buyNowPrice || "",
        minimumBidIncrement: currentAuction.minimumBidIncrement || "",
        category: currentAuction.category?._id || currentAuction.category || "",
        subcategory:
          currentAuction.subcategory?._id || currentAuction.subcategory || "",
        auctionCover: null,
        auctionImages: [],
      });
      setSelectedCategoryId(
        currentAuction.category?._id || currentAuction.category || ""
      );
    } else {
      setAuctionFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        startPrice: "",
        reservePrice: "",
        buyNowPrice: "",
        minimumBidIncrement: "",
        category: "",
        subcategory: "",
        auctionCover: null,
        auctionImages: [],
      });
      setSelectedCategoryId("");
    }
  }, [currentAuction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuctionFormData({ ...auctionFormData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "auctionCover") {
      setAuctionFormData({ ...auctionFormData, auctionCover: files[0] });
    } else if (name === "auctionImages") {
      setAuctionFormData({
        ...auctionFormData,
        auctionImages: Array.from(files),
      });
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setAuctionFormData({
      ...auctionFormData,
      category: categoryId,
      subcategory: "",
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAuction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      // Append text fields
      for (const key in auctionFormData) {
        if (
          key !== "auctionCover" &&
          key !== "auctionImages" &&
          auctionFormData[key] !== null &&
          auctionFormData[key] !== ""
        ) {
          // Convert dates to UTC
          if (key === "startDate" || key === "endDate") {
            data.append(key, convertToUTC(auctionFormData[key]));
          } else {
            data.append(key, auctionFormData[key]);
          }
        }
      }

      // Append files
      if (auctionFormData.auctionCover) {
        data.append("auctionCover", auctionFormData.auctionCover);
      }
      if (
        auctionFormData.auctionImages &&
        auctionFormData.auctionImages.length > 0
      ) {
        auctionFormData.auctionImages.forEach((file) => {
          data.append("auctionImages", file);
        });
      }

      if (currentAuction) {
        await auctionService.updateAuction(currentAuction._id, data);
        showToast("Auction updated successfully!", "success");
      } else {
        await auctionService.createAuction(data);
        showToast("Auction created successfully!", "success");
      }

      fetchAuctions();
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting auction form:", err);
      setError(`Failed to ${currentAuction ? "update" : "create"} auction.`);
      showToast(
        `Failed to ${currentAuction ? "update" : "create"} auction`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      auctionId,
    });
  };

  const handleEndAuction = async (auctionId) => {
    setConfirmationModal({
      isOpen: true,
      type: "end",
      auctionId,
    });
  };

  const handleConfirmation = async () => {
    const { type, auctionId } = confirmationModal;
    setLoading(true);
    setError(null);
    try {
      if (type === "delete") {
        await auctionService.deleteAuction(auctionId);
        showToast("Auction deleted successfully!", "success");
      } else if (type === "end") {
        await auctionService.endAuction(auctionId);
        showToast("Auction ended successfully!", "success");
      }
      fetchAuctions();
    } catch (err) {
      console.error(`Error ${type}ing auction:`, err);
      setError(`Failed to ${type} auction.`);
      showToast(`Failed to ${type} auction`, "error");
    } finally {
      setLoading(false);
      setConfirmationModal({ isOpen: false, type: null, auctionId: null });
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, type: null, auctionId: null });
  };

  const handleAuctionClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading auctions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Auction Management
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {auctions.map((auction) => (
              <tr
                key={auction._id}
                onClick={() => handleAuctionClick(auction._id)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">{auction.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {auction.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(auction.startDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(auction.endDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {auction.currentPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {auction.seller?.username || auction.seller || "N/A"}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {auction.status === "active" && (
                    <button
                      onClick={() => handleEndAuction(auction._id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      End
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAuction(auction._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AuctionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={auctionFormData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
        subcategories={subcategories}
        selectedCategoryId={selectedCategoryId}
        isEditing={!!currentAuction}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmation}
        title={
          confirmationModal.type === "delete" ? "Delete Auction" : "End Auction"
        }
        message={
          confirmationModal.type === "delete"
            ? "Are you sure you want to delete this auction? This action cannot be undone."
            : "Are you sure you want to end this auction? This action cannot be undone."
        }
        confirmText={confirmationModal.type === "delete" ? "Delete" : "End"}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
};

export default AdminAuctionManagement;
