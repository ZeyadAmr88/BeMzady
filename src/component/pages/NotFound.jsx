import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    const { darkMode } = useContext(ThemeContext);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                        404
                    </h1>
                    <h2 className={`text-2xl font-semibold mt-4 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                        Page Not Found
                    </h2>
                    <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${darkMode
                                ? "bg-rose-600 hover:bg-rose-700 text-white"
                                : "bg-rose-600 hover:bg-rose-700 text-white"
                            }`}
                    >
                        <Home size={20} className="mr-2" />
                        Go to Homepage
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${darkMode
                                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            }`}
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Go Back
                    </button>
                </div>

                <div className={`mt-8 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <p>Need help? Contact our support team</p>
                    <Link
                        to="/contact"
                        className={`mt-2 inline-block underline ${darkMode ? "text-rose-400 hover:text-rose-300" : "text-rose-600 hover:text-rose-500"
                            }`}
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 