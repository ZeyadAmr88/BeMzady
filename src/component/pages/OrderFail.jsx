import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle, AlertTriangle, RefreshCcw, ShoppingCart, Home } from "lucide-react";
import { toast } from "react-hot-toast";

const OrderFail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [errorInfo, setErrorInfo] = useState({
        errorMessage: "Your payment was not processed successfully.",
        errorCode: "",
        orderId: ""
    });

    useEffect(() => {
        // Display error notification
        toast.error("Payment failed");

        // Try to get detailed error information from sessionStorage
        try {
            const storedError = sessionStorage.getItem('stripe_error');
            if (storedError) {
                const parsedError = JSON.parse(storedError);
                setErrorInfo({
                    errorMessage: parsedError.message || errorInfo.errorMessage,
                    errorCode: parsedError.code || "",
                    orderId: parsedError.orderId || ""
                });

                // Clear the error from storage after reading
                sessionStorage.removeItem('stripe_error');
            }
        } catch (e) {
            console.warn("Could not read error info from storage:", e);
        }

        // If location state has error information, use that (this takes precedence)
        if (location.state?.errorMessage) {
            setErrorInfo({
                errorMessage: location.state.errorMessage,
                errorCode: location.state.errorCode || "",
                orderId: location.state.orderId || ""
            });
        }

        // Clear any other Stripe error data from storage
        try {
            localStorage.removeItem('stripe_error');
        } catch (e) {
            console.warn("Could not clear storage:", e);
        }
    }, [location.state, errorInfo.errorMessage]);

    const handleTryAgain = () => {
        // If we have an order ID, navigate back to checkout with that order
        if (errorInfo.orderId) {
            navigate(`/checkout?order=${errorInfo.orderId}`);
        } else {
            // Otherwise go back to cart
            navigate("/cart");
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 dark:bg-gray-900">
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="bg-red-500 dark:bg-red-600 p-6 text-center">
                    <XCircle className="w-16 h-16 text-white mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-md flex items-start">
                        <AlertTriangle className="text-red-500 dark:text-red-400 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-red-800 dark:text-red-300 font-medium mb-1">There was a problem with your payment</p>
                            <p className="text-red-700 dark:text-red-400">{errorInfo.errorMessage}</p>
                            {errorInfo.errorCode && (
                                <p className="text-sm text-red-600 dark:text-red-500 mt-1">Error code: {errorInfo.errorCode}</p>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Don't worry, no payment has been taken from your account. You can try again with a different payment method or return to your cart.
                    </p>

                    <h2 className="text-lg font-semibold mb-4 dark:text-white">What would you like to do next?</h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleTryAgain}
                            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            <RefreshCcw className="w-5 h-5 mr-2" />
                            Try Payment Again
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Return to Cart
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Go to Home Page
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        If you continue to experience issues, please contact our customer support team for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderFail; 