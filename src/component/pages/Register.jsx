"use client"

import React, { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard } from "lucide-react"

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
        national_id: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { register } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long")
            return false
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address")
            return false
        }

        // Phone number validation (basic)
        const phoneRegex = /^\d{10,15}$/
        if (!phoneRegex.test(formData.phone_number.replace(/[^0-9]/g, ""))) {
            setError("Please enter a valid phone number")
            return false
        }

        // National ID validation (basic)
        if (formData.national_id.length < 10) {
            setError("National ID must be at least 10 characters")
            return false
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            // Remove confirmPassword as it's not needed for the API
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...registrationData } = formData

            const result = await register(registrationData)

            if (result.success) {
                navigate("/")
            } else {
                setError(result.message)
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.")
            console.error("Registration error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium">
                            First Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                                placeholder="John"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block mb-2 text-sm font-medium">
                            Last Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                                placeholder="Doe"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                            placeholder="johndoe123"
                            required
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

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
                            name="email"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-4">
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
                            name="password"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 pr-10 p-2.5"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={handleChange}
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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 pr-10 p-2.5"
                            placeholder="••••••••"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} className="text-gray-500 dark:text-gray-400" />
                            ) : (
                                <Eye size={18} className="text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="phone_number" className="block mb-2 text-sm font-medium">
                        Phone Number
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                            placeholder="+20 123 456 7890"
                            required
                            value={formData.phone_number}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="national_id" className="block mb-2 text-sm font-medium">
                        National ID
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <CreditCard size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="national_id"
                            name="national_id"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                            placeholder="30333333333334"
                            required
                            value={formData.national_id}
                            onChange={handleChange}
                        />
                    </div>
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
                            Creating account...
                        </span>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-rose-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
