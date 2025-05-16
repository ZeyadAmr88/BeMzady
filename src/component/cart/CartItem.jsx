/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus } from "lucide-react"

const CartItem = ({ item, onUpdateQuantity, onRemove, disabled }) => {
    // Handle the specific cart response structure
    const cartItem = item.item || {};
    // eslint-disable-next-line no-unused-vars
    const itemId = item._id || cartItem._id || "";

    // Extract item details from the nested structure
    const title = cartItem.title || "Unnamed Item";
    const description = cartItem.description || "";

    // Ensure price is a valid number
    let price = 0;
    try {
        price = parseFloat(cartItem.price);
        if (isNaN(price)) price = 0;
    } catch (e) {
        console.warn("Error parsing price:", e);
        price = 0;
    }

    // Ensure quantity is a valid number
    let quantity = 1;
    try {
        quantity = parseInt(item.quantity);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
    } catch (e) {
        console.warn("Error parsing quantity:", e);
        quantity = 1;
    }

    const itemCover = cartItem.item_cover || "/placeholder.svg?height=96&width=96";
    const ownerName = "Unknown seller";

    // Calculate item total
    const itemTotal = price * quantity;

    return (
        <div className="p-6 flex flex-col sm:flex-row">
            <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 flex-shrink-0">
                <img
                    src={itemCover}
                    alt={title}
                    className="w-full h-full object-cover rounded-md"
                />
            </div>

            <div className="flex-grow sm:ml-6">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                        <h3 className="text-lg font-medium mb-1">
                            <Link to={`/items/${cartItem._id}`} className="hover:text-rose-600">
                                {title}
                            </Link>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            Seller: {ownerName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {description}
                        </p>
                    </div>

                    <div className="text-right mt-2 sm:mt-0">
                        <div className="text-rose-600 font-semibold">${price.toFixed(2)}</div>
                        {quantity > 1 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total: ${(price * quantity).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => onUpdateQuantity(cartItem._id, quantity - 1)}
                            disabled={disabled || quantity <= 1}
                            className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="mx-3 min-w-[2rem] text-center">{quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(cartItem._id, quantity + 1)}
                            disabled={disabled}
                            className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => onRemove(cartItem._id)}
                        disabled={disabled}
                        className="text-gray-500 hover:text-rose-600 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CartItem
