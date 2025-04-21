"use client"
import { Link } from "react-router-dom"
import { Trash2, Plus, Minus } from "lucide-react"

const CartItem = ({ item, onUpdateQuantity, onRemove, disabled }) => {
    return (
        <div className="p-6 flex flex-col sm:flex-row">
            <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 flex-shrink-0">
                <img
                    src={item.item_cover || "/placeholder.svg?height=96&width=96"}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-md"
                />
            </div>

            <div className="flex-grow sm:ml-6">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                        <h3 className="text-lg font-medium mb-1">
                            <Link to={`/auctions/${item.auction_id}`} className="hover:text-rose-600">
                                {item.title}
                            </Link>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            {item.seller ? `Seller: ${item.seller.username}` : "Unknown seller"}
                        </p>
                    </div>

                    <div className="text-rose-600 font-semibold mt-2 sm:mt-0">${item.price.toFixed(2)}</div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={disabled || item.quantity <= 1}
                            className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="mx-3 min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={disabled}
                            className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => onRemove(item._id)}
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
