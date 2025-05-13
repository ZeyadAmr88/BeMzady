"use client"

import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { cartService } from "../services/api"
import { ShoppingCart, ArrowRight, AlertCircle, Loader } from 'lucide-react'
import CartItem from "../cart/CartItem"
import { AuthContext } from "../contexts/AuthContext"

const Cart = () => {
    const { user } = useContext(AuthContext)
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [cartSummary, setCartSummary] = useState({
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    })

    useEffect(() => {
        if (user) {
            fetchCart()
        }
    }, [user])

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

    const fetchCart = async () => {
        try {
            setLoading(true)
            const response = await cartService.getCart()
            console.log("Cart response:", response.data)

            // Handle the cart data structure
            let items = []
            if (response.data && response.data.data) {
                // Check if the response has an items array (new structure)
                if (response.data.data.items && Array.isArray(response.data.data.items)) {
                    items = response.data.data.items
                    console.log("Cart items from nested structure:", items)
                } else if (Array.isArray(response.data.data)) {
                    // Fallback to old structure
                    items = response.data.data
                }

                // Log the first item for debugging
                if (items.length > 0) {
                    console.log("First cart item:", items[0])
                }
            }

            setCartItems(items)
            setError(null)
        } catch (error) {
            console.error("Error fetching cart:", error)
            setError("Failed to load your cart. Please try again.")
            setCartItems([])
        } finally {
            setLoading(false)
        }
    }

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
                await cartService.removeFromCart(actualItemId);
                console.log(`Removed item ${actualItemId} from cart`);
            } else {
                // First remove the item, then add with new quantity
                await cartService.removeFromCart(actualItemId);
                console.log(`Removed item ${actualItemId} from cart before updating`);

                await cartService.addToCart(actualItemId, validQuantity);
                console.log(`Added item ${actualItemId} with quantity ${validQuantity}`);
            }

            // Update local state
            setCartItems(prevItems => {
                if (validQuantity <= 0) {
                    return prevItems.filter(item =>
                        (item._id !== itemId) && (item.item?._id !== itemId)
                    );
                } else {
                    return prevItems.map(item => {
                        if (item._id === itemId || (item.item && item.item._id === itemId)) {
                            return { ...item, quantity: validQuantity };
                        }
                        return item;
                    });
                }
            });
        } catch (error) {
            console.error("Error updating cart:", error)
            setError("Failed to update cart. Please try again.")
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
                setUpdating(false);
                return;
            }

            // Get the actual item ID from the nested structure
            const actualItemId = cartItem.item?._id || itemId;

            await cartService.removeFromCart(actualItemId)

            // Update local state
            setCartItems(prevItems => prevItems.filter(item =>
                (item._id !== itemId) && (item.item?._id !== itemId)
            ))
        } catch (error) {
            console.error("Error removing item from cart:", error)
            setError("Failed to remove item. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleClearCart = async () => {
        try {
            setUpdating(true)
            await cartService.clearCart()
            setCartItems([])
        } catch (error) {
            console.error("Error clearing cart:", error)
            setError("Failed to clear cart. Please try again.")
        } finally {
            setUpdating(false)
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
                                className="w-full mt-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                disabled={updating}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
