"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { cartService } from "../services/api"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, AlertCircle } from 'lucide-react'

const Cart = () => {
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
        fetchCart()
    }, [])

    useEffect(() => {
        // Calculate cart summary whenever cartItems changes
        const subtotal = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) : 0
        const shipping = subtotal > 0 ? 10 : 0
        const tax = subtotal * 0.05 // 5% tax
        const total = subtotal + shipping + tax

        setCartSummary({
            subtotal,
            shipping,
            tax,
            total
        })
    }, [cartItems])

    const fetchCart = async () => {
        try {
            setLoading(true)
            const response = await cartService.getCart()
            setCartItems(Array.isArray(response.data.data) ? response.data.data : [])
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

            // Remove item if quantity is 0
            if (newQuantity === 0) {
                await cartService.removeFromCart(itemId)
            } else {
                // First remove the item, then add with new quantity
                await cartService.removeFromCart(itemId)
                await cartService.addToCart(itemId, newQuantity)
            }

            // Update local state
            setCartItems(prevItems =>
                newQuantity === 0
                    ? prevItems.filter(item => item._id !== itemId)
                    : prevItems.map(item =>
                        item._id === itemId
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
            )
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
            await cartService.removeFromCart(itemId)

            // Update local state
            setCartItems(prevItems => prevItems.filter(item => item._id !== itemId))
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
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
                        to="/auctions"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    >
                        <span>Browse Auctions</span>
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
                                    <div key={item._id} className="p-4">
                                        <div className="flex items-start">
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-md object-cover"
                                            />
                                            <div className="ml-4 flex-1">
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.description}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            disabled={updating}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="mx-2">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            disabled={updating}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                                        <button
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            disabled={updating}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
