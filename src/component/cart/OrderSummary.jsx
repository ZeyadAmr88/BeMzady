import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const OrderSummary = ({ subtotal, shipping, tax, total }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>EGP {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>EGP {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (5%)</span>
                    <span>EGP{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-rose-600">EGP {total.toFixed(2)}</span>
                </div>
            </div>

            <Link
                to="/checkout"
                className="w-full py-3 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 transition-colors flex items-center justify-center"
            >
                Proceed to Checkout <ArrowRight size={16} className="ml-2" />
            </Link>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">We accept:</p>
                <div className="flex space-x-2">
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    )
}

export default OrderSummary
