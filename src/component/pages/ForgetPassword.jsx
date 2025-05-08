"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { Mail } from "lucide-react"

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const { forgotPassword } = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const result = await forgotPassword(email)
            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.message)
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.")
            console.error("Forgot password error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

            {success ? (
                <div className="text-center">
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                        Password reset instructions have been sent to your email.
                    </div>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                        Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            ) : (
                <>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
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

                        <button
                            type="submit"
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Instructions"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm">
                            Remember your password?{" "}
                            <Link to="/login" className="text-rose-600 hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}

export default ForgotPassword
