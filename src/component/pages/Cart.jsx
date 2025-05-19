"use client"

import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, AlertCircle, ArrowRight, Loader } from 'lucide-react'
import { cartService } from "../services/api"
import { AuthContext } from "../contexts/AuthContext"
import { CartContext } from "../contexts/CartContext"
import { useAddress } from "../contexts/AddressContext"
import { toast } from "react-hot-toast"
import { checkStripeRedirect, redirectToStripePayment } from "../utils/stripeHandler"
import CartItem from "../cart/CartItem"

const Cart = () => {
    const { user } = useContext(AuthContext)
    const { cartItems, loading: cartLoading, fetchCart, removeFromCart: removeCartItem, clearCart: clearCartItems } = useContext(CartContext)
    const { address } = useAddress()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [cartSummary, setCartSummary] = useState({
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    })

    // Only fetch cart data once when component mounts
    useEffect(() => {
        const loadCart = async () => {
            try {
                // Check if user is coming back from Stripe checkout
                if (checkStripeRedirect()) {
                    return; // The utility will handle the redirect
                }

                // Proceed with normal cart loading
                if (user) {
                    await fetchCart()
                }
            } catch (err) {
                setError(err.message || "Failed to load cart data")
            } finally {
                setLoading(false)
            }
        }

        loadCart()
    }, [user, fetchCart])

    // Update loading state based on cartContext loading
    useEffect(() => {
        if (!cartLoading) {
            setLoading(false);
        }
    }, [cartLoading]);

    useEffect(() => {
        // Calculate cart summary whenever cartItems changes
        let subtotal = 0;

        if (Array.isArray(cartItems) && cartItems.length > 0) {
            subtotal = cartItems.reduce((total, item) => {
                // Handle the nested item structure
                const itemData = item.item || {}
                // Ensure price is a valid number
                const price = parseFloat(itemData.price || 0);
                if (isNaN(price)) {
                    console.warn("Invalid price for item:", itemData);
                    return total;
                }

                // Ensure quantity is a valid number
                const quantity = parseInt(item.quantity) || 1;
                if (isNaN(quantity)) {
                    console.warn("Invalid quantity for item:", item);
                    return total;
                }

                const itemTotal = price * quantity;
                console.log(`Item ${itemData.title}: Price=${price}, Quantity=${quantity}, Total=${itemTotal}`);
                return total + itemTotal;
            }, 0);
        }

        // Ensure all values are valid numbers
        const validSubtotal = isNaN(subtotal) ? 0 : subtotal;
        const shipping = validSubtotal > 0 ? 10 : 0;
        const tax = validSubtotal * 0.05; // 5% tax
        const total = validSubtotal + shipping + tax;

        console.log("Cart Summary:", { subtotal: validSubtotal, shipping, tax, total });

        setCartSummary({
            subtotal: validSubtotal,
            shipping,
            tax,
            total
        });
    }, [cartItems])

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return

        try {
            setUpdating(true)

            // Find the cart item to get the actual item ID
            const cartItem = cartItems.find(item =>
                (item._id === itemId) || (item.item && item.item._id === itemId)
            );

            if (!cartItem) {
                console.error("Item not found in cart:", itemId);
                setError("Item not found in cart");
                toast.error("Item not found in cart");
                setUpdating(false);
                return;
            }

            // Get the actual item ID from the nested structure
            const actualItemId = cartItem.item?._id || itemId;

            // Ensure quantity is a valid number
            const validQuantity = parseInt(newQuantity) || 0;
            console.log(`Updating item ${actualItemId} quantity to ${validQuantity}`);

            // Remove item if quantity is 0
            if (validQuantity <= 0) {
                const success = await removeCartItem(actualItemId);
                if (success) {
                    console.log(`Removed item ${actualItemId} from cart`);
                    toast.success("Item removed from cart");
                }
            } else {
                // For quantity updates, we use the direct service call
                // First remove the item, then add with new quantity
                await removeCartItem(actualItemId);

                try {
                    // Use the direct API call for adding with new quantity
                    await cartService.addToCart(actualItemId, validQuantity);
                    console.log(`Added item ${actualItemId} with quantity ${validQuantity}`);
                    toast.success(`Updated quantity to ${validQuantity}`);

                    // Refresh cart to update UI - using the context's fetchCart
                    await fetchCart();
                } catch (addError) {
                    console.error("Error adding item with new quantity:", addError);
                    toast.error("Failed to update quantity");
                }
            }
        } catch (error) {
            console.error("Error updating cart:", error)
            setError("Failed to update cart. Please try again.")
            toast.error("Failed to update cart. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdating(true)

            // Find the cart item to get the actual item ID
            const cartItem = cartItems.find(item =>
                (item._id === itemId) || (item.item && item.item._id === itemId)
            );

            if (!cartItem) {
                console.error("Item not found in cart:", itemId);
                setError("Item not found in cart");
                toast.error("Item not found in cart");
                setUpdating(false);
                return;
            }

            // Get the actual item ID from the nested structure
            const actualItemId = cartItem.item?._id || itemId;

            const success = await removeCartItem(actualItemId);
            if (success) {
                toast.success("Item removed from cart");
            }
        } catch (error) {
            console.error("Error removing item from cart:", error)
            setError("Failed to remove item. Please try again.")
            toast.error("Failed to remove item. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleClearCart = async () => {
        try {
            setUpdating(true)
            const success = await clearCartItems();
            if (success) {
                toast.success("Cart cleared successfully");
            }
        } catch (error) {
            console.error("Error clearing cart:", error)
            setError("Failed to clear cart. Please try again.")
            toast.error("Failed to clear cart. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleCheckout = async () => {
        // Check if user has an address
        if (!address || address.trim() === '') {
            toast.error("Please add your address in your profile before proceeding with checkout", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate("/profile");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty")
            return
        }

        try {
            setCheckingOut(true)
            console.log("Starting checkout process...")

            const response = await cartService.checkout()
            console.log("Checkout response:", response.data)

            // Show success message
            toast.success(response.data.message || "Checkout successful")

            // Use our utility to redirect to payment URL
            if (response.data.paymentUrl) {
                redirectToStripePayment(response.data.paymentUrl, () => {
                    console.log("Redirecting to payment URL:", response.data.paymentUrl);
                });
            } else {
                console.warn("No payment URL received in the response")
                toast.warning("Payment URL not received. Please contact support.")
            }
        } catch (error) {
            console.error("Error during checkout:", error)

            // More detailed error logging
            if (error.response) {
                console.error("Response error data:", error.response.data)
                console.error("Response error status:", error.response.status)
                console.error("Response error headers:", error.response.headers)

                const errorMsg = error.response.data?.message || "Failed to process checkout. Please try again."
                toast.error(errorMsg)
                setError(errorMsg)
            } else if (error.request) {
                console.error("No response received:", error.request)

                // Ask user if they want to try direct checkout URL
                if (confirm("Network error occurred. Would you like to try an alternative checkout method?")) {
                    // Redirect to a direct checkout URL
                    window.location.href = "https://be-mazady.vercel.app/api/cart/checkout";
                } else {
                    toast.error("Network error. Please check your connection and try again.")
                    setError("Network error. The server may be unavailable. Please try again later.")
                }
            } else {
                console.error("Error message:", error.message)
                toast.error(error.message || "An unexpected error occurred")
                setError(error.message || "An unexpected error occurred")
            }
        } finally {
            setCheckingOut(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader size={32} className="animate-spin text-rose-600" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-medium mb-2">Please log in to view your cart</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You need to be logged in to access your shopping cart.
                </p>
                <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                    <span>Log In</span>
                    <ArrowRight size={20} className="ml-2" />
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link
                        to="/items"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    >
                        <span>Browse Items</span>
                        <ArrowRight size={20} className="ml-2" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Cart Items</h2>
                                <button
                                    onClick={handleClearCart}
                                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                                    disabled={updating}
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item._id || item.item}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                        disabled={updating}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${cartSummary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>${cartSummary.shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (5%)</span>
                                    <span>${cartSummary.tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>${cartSummary.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full mt-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:bg-rose-400 disabled:cursor-not-allowed"
                                disabled={updating || checkingOut}
                                onClick={handleCheckout}
                            >
                                {checkingOut ? (
                                    <span className="flex items-center justify-center">
                                        <Loader size={20} className="animate-spin mr-2" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Proceed to Checkout"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
