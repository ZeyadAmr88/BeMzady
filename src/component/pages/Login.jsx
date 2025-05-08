"use client"

import React, { useState, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()

    // Get redirect path from location state or default to home
    const from = location.state?.from?.pathname || "/"

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await login(email, password)

            if (result.success) {
                navigate(from, { replace: true })
            } else {
                setError(result.message)
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.")
            console.error("Login error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Log in to BeMazady</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 pr-10 p-2.5"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={18} className="text-gray-500 dark:text-gray-400" />
                            ) : (
                                <Eye size={18} className="text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            className="w-4 h-4 text-rose-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-rose-500"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm">
                            Remember me
                        </label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-rose-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : (
                        "Log in"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-rose-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login
