import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { cartService } from "../services/api";
import { toast } from "react-hot-toast";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch cart items whenever user changes
    useEffect(() => {
        if (user) {
            // Only fetch cart if we haven't initialized yet or when the user changes
            if (!isInitialized) {
                fetchCart();
                setIsInitialized(true);
            }
        } else {
            setCartItems([]);
            setCartCount(0);
            setIsInitialized(false);
        }
    }, [user]);

    const fetchCart = useCallback(async () => {
        if (!user || loading) return;

        try {
            setLoading(true);
            const response = await cartService.getCart();

            // Handle the cart data structure
            let items = [];
            if (response.data && response.data.data) {
                // Check if the response has an items array (new structure)
                if (response.data.data.items && Array.isArray(response.data.data.items)) {
                    items = response.data.data.items;
                } else if (Array.isArray(response.data.data)) {
                    // Fallback to old structure
                    items = response.data.data;
                }
            }

            setCartItems(items);

            // Calculate total number of items in cart
            const count = items.reduce((total, item) => {
                return total + (parseInt(item.quantity) || 0);
            }, 0);

            setCartCount(count);
        } catch (error) {
            console.error("Error fetching cart:", error);
            // Silent fail - don't show error toast for background fetches
        } finally {
            setLoading(false);
        }
    }, [user, loading]);

    const addToCart = useCallback(async (itemId, quantity = 1) => {
        if (!user) {
            toast.error("Please log in to add items to cart");
            return false;
        }

        try {
            setLoading(true);
            await cartService.addToCart(itemId, quantity);

            // Refresh cart to get updated count
            await fetchCart();

            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error(error.response?.data?.message || "Failed to add item to cart");
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart]);

    const removeFromCart = useCallback(async (itemId) => {
        if (!user) return false;

        try {
            setLoading(true);
            await cartService.removeFromCart(itemId);

            // Refresh cart to get updated count
            await fetchCart();

            return true;
        } catch (error) {
            console.error("Error removing from cart:", error);
            toast.error(error.response?.data?.message || "Failed to remove item from cart");
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, fetchCart]);

    const clearCart = useCallback(async () => {
        if (!user) return false;

        try {
            setLoading(true);
            await cartService.clearCart();

            setCartItems([]);
            setCartCount(0);

            return true;
        } catch (error) {
            console.error("Error clearing cart:", error);
            toast.error(error.response?.data?.message || "Failed to clear cart");
            return false;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        cartItems,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart
    }), [cartItems, cartCount, loading, fetchCart, addToCart, removeFromCart, clearCart]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}; 