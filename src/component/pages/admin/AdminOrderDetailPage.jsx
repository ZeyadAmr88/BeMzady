import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderService, userService } from "../../services/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await orderService.getOrderDetail(orderId);
        const fetchedOrder = response.data.data || response.data;
        setOrder(fetchedOrder);
        setNewStatus(fetchedOrder?.status);

        if (fetchedOrder?.user?._id) {
          try {
            const userResponse = await userService.getUserById(
              fetchedOrder.user._id
            );
            setUserDetails(userResponse.data.data || userResponse.data);
          } catch (userErr) {
            console.error("Error fetching user details:", userErr);
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      const nextAllowed = getAllowedNextStatuses();
      if (nextAllowed.length > 0) {
        setNewStatus(nextAllowed[0].value);
      } else {
        setNewStatus(order.status);
      }
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    console.log("handleStatusUpdate called");
    console.log("Current Order Status:", order.status);
    console.log("New Status to update:", newStatus);
    setIsUpdating(true);
    setUpdateError(null);
    setSuccessMessage(null);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const response = await orderService.getOrderDetail(orderId);
      setOrder(response.data.data || response.data);
      setNewStatus(response.data.data?.status || response.data?.status);
      setSuccessMessage("Order status updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating order status:", err);
      setUpdateError("Failed to update order status. Please try again.");
      setTimeout(() => setUpdateError(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAllowedNextStatuses = () => {
    switch (order?.status) {
      case "paid":
        return [
          { value: "shipped", label: "Shipped" },
          { value: "cancelled", label: "Cancelled" },
        ];
      case "shipped":
        return [
          { value: "delivered", label: "Delivered" },
          { value: "cancelled", label: "Cancelled" },
        ];
      default:
        return [];
    }
  };

  const allowedStatuses = getAllowedNextStatuses();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Order Details: {order._id}
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Order Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-gray-700 dark:text-gray-300 text-sm">
          <p>
            <strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-semibold ${
                order.status === "pending"
                  ? "text-yellow-600"
                  : order.status === "paid"
                  ? "text-green-600"
                  : order.status === "shipped"
                  ? "text-blue-600"
                  : order.status === "delivered"
                  ? "text-purple-600"
                  : order.status === "cancelled"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {order.createdAt ? format(new Date(order.createdAt), "PPP") : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {order.updatedAt ? format(new Date(order.updatedAt), "PPP") : "N/A"}
          </p>
        </div>
        {order.status === "pending" && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
            <p>
              <strong>Note:</strong> Waiting for user to complete purchase.
            </p>
          </div>
        )}
      </div>

      {/* Status Update Section */}
      {allowedStatuses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Update Status
          </h2>
          {updateError && (
            <div className="text-red-500 mb-4">{updateError}</div>
          )}
          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}
          <div className="flex items-center gap-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isUpdating}
            >
              {allowedStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {console.log(
              `Button disabled: ${
                isUpdating || newStatus === order.status
              } (isUpdating: ${isUpdating}, newStatus: ${newStatus}, order.status: ${
                order.status
              })`
            )}
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === order.status}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-gray-700 dark:text-gray-300 text-sm">
          <p>
            <strong>User ID:</strong> {order.user?._id || "N/A"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {userDetails?.email || order.user?.email || "N/A"}
          </p>
          {userDetails && (
            <>
              <p>
                <strong>Name:</strong>{" "}
                <Link
                  to={`/admin/users/${userDetails._id}`}
                  className="text-rose-600 hover:underline"
                >
                  {userDetails.first_name || ""}{" "}
                  {userDetails.last_name || "N/A"}
                </Link>
              </p>
              <p>
                <strong>Username:</strong> {userDetails.username || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {userDetails.phone_number
                  ? `0${String(userDetails.phone_number).replace(/^0+/, "")}`
                  : "N/A"}
              </p>
              {userDetails.address && (
                <p>
                  <strong>Address:</strong> {userDetails.address}
                </p>
              )}
              {userDetails.user_picture && (
                <div className="mt-4">
                  <strong>Profile Picture:</strong>
                  <img
                    src={userDetails.user_picture}
                    alt="User Profile"
                    className="w-20 h-20 rounded-full object-cover mt-2"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Items
        </h2>
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Item Type
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Price At Purchase
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Seller ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {item.itemType}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <Link
                        to={
                          item.itemType === "auction"
                            ? `/auctions/${item.item}`
                            : `/items/${item.item}`
                        }
                        className="text-rose-600 hover:underline whitespace-no-wrap"
                      >
                        {item.item}
                      </Link>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {item.quantity}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        ${item.priceAtPurchase?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <p className="text-gray-900 dark:text-white whitespace-no-wrap">
                        {item.seller}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No items found for this order.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
