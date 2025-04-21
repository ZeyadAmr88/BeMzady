"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { Eye, EyeOff, Lock } from "lucide-react"

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const resetCode = searchParams.get("code")
    const email = searchParams.get("email")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [codeVerified, setCodeVerified] = useState(false)
    const [verifying, setVerifying] = useState(true)

    const { verifyResetCode, resetPassword } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        const verifyCode = async () => {
            if (!resetCode) {
                setError("Invalid reset code")
                setVerifying(false)
                return
            }

            try {
                const result = await verifyResetCode(resetCode)
                if (result.success) {
                    setCodeVerified(true)
                } else {
                    setError(result.message || "Invalid reset code")
                }
            } catch (error) {
                setError("Failed to verify reset code")
                console.error("Verify code error:", error)
            } finally {
                setVerifying(false)
            }
        }

        verifyCode()
    }, [resetCode, verifyResetCode])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        setLoading(true)
        setError("")

        try {
            const result = await resetPassword(email, password)
            if (result.success) {
                navigate("/login", {
                    state: { message: "Password reset successful. You can now log in with your new password." },
                })
            } else {
                setError(result.message)
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.")
            console.error("Reset password error:", error)
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                </div>
                <p className="text-center mt-4">Verifying reset code...</p>
            </div>
        )
    }

    if (!codeVerified) {
        return (
            <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Invalid Reset Link</h1>
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                    {error || "The password reset link is invalid or has expired."}
                </div>
                <p className="mb-6 text-center">Please request a new password reset link.</p>
                <Link
                    to="/forgot-password"
                    className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                    Request New Link
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium">
                        New Password
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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 pr-10 p-2.5"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
