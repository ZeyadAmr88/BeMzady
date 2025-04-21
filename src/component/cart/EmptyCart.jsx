import { Link } from "react-router-dom"
import { ShoppingCart, ArrowRight } from "lucide-react"

const EmptyCart = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
                <ShoppingCart size={64} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
                to="/auctions"
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 transition-colors"
            >
                Browse Auctions <ArrowRight size={16} className="ml-2" />
            </Link>
        </div>
    )
}

export default EmptyCart
