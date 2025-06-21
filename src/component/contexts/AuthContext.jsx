"use client"
import React from 'react';

import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    // Only use the token from localStorage if persistentLogin is set or we're in an active session
    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("token")
        const isPersistent = localStorage.getItem("persistentLogin") === "true"

        // If there's no persistent login flag and we're loading the page fresh,
        // we should only use the token if the user explicitly asked to be remembered
        if (!isPersistent && savedToken) {
            // Check if this is a page refresh/new tab or a completely new session
            const isNewSession = !sessionStorage.getItem("activeSession")

            if (isNewSession) {
                // Clear token if this is a new session and remember me wasn't checked
                localStorage.removeItem("token")
                localStorage.removeItem("user_id")
                return null
            } else {
                // Keep token for page refreshes within the same session
                return savedToken
            }
        }

        // Set session flag
        sessionStorage.setItem("activeSession", "true")
        return savedToken || null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get("/users/MyProfile", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    setUser(response.data.data)
                } catch (error) {
                    console.error("Error fetching user profile:", error)
                    logout()
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
            }
        }

        fetchUser()
    }, [token])

    const login = async (email, password, rememberMe = false) => {
        try {
            const response = await api.post("/Auth/login", { email, password })
            const { token, data } = response.data

            // Store token and user data in localStorage
            localStorage.setItem("token", token)
            localStorage.setItem("user_id", data?.id)
            localStorage.setItem("user", JSON.stringify(data))

            // If remember me is checked, store a flag to indicate persistent login
            if (rememberMe) {
                localStorage.setItem("persistentLogin", "true")
            } else {
                localStorage.removeItem("persistentLogin")
            }

            // Always set the session flag when logging in
            sessionStorage.setItem("activeSession", "true")

            setToken(token)
            setUser(data)

            return { success: true }
        } catch (error) {
            console.error("Login error:", error)
            // Clear any existing auth data on error
            localStorage.removeItem("token")
            localStorage.removeItem("user_id")
            localStorage.removeItem("user")
            localStorage.removeItem("persistentLogin")
            sessionStorage.removeItem("activeSession")

            return {
                success: false,
                message: error.response?.data?.message || "Login failed. Please try again.",
            }
        }
    }

    const register = async (userData) => {
        try {
            const response = await api.post("/Auth/register", userData)
            const { token } = response.data

            localStorage.setItem("token", token)
            setToken(token)

            return { success: true }
        } catch (error) {
            console.error("Registration error:", error)

            // Check if we have an array of validation errors
            if (error.response?.data?.errors) {
                return {
                    success: false,
                    errors: error.response.data.errors // Return the full error objects for field-specific handling
                }
            }

            // Fallback to a general error message if no structured errors
            return {
                success: false,
                errors: [{
                    path: 'general',
                    msg: error.response?.data?.message || "Registration failed. Please try again."
                }]
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user_id")
        localStorage.removeItem("user")
        localStorage.removeItem("persistentLogin")
        sessionStorage.removeItem("activeSession")
        // Don't remove rememberedEmail to keep the email field pre-filled
        // even after logout if the user had checked "Remember me"
        setToken(null)
        setUser(null)
    }

    const forgotPassword = async (email) => {
        try {
            await api.post("/Auth/forgotpassword", { email })
            return { success: true }
        } catch (error) {
            console.error("Forgot password error:", error)
            return {
                success: false,
                message: error.response?.data?.message || "Failed to send reset code. Please try again.",
            }
        }
    }

    const verifyResetCode = async (resetCode) => {
        try {
            await api.post("/Auth/verify", { resetCode })
            return { success: true }
        } catch (error) {
            console.error("Verify reset code error:", error)
            return {
                success: false,
                message: error.response?.data?.message || "Invalid reset code. Please try again.",
            }
        }
    }

    const resetPassword = async (email, newPassword) => {
        try {
            const response = await api.put("/Auth/resetpassword", { email, newPassword })
            const { token } = response.data

            localStorage.setItem("token", token)
            setToken(token)

            return { success: true }
        } catch (error) {
            console.error("Reset password error:", error)
            return {
                success: false,
                message: error.response?.data?.message || "Failed to reset password. Please try again.",
            }
        }
    }

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData)
        localStorage.setItem("user", JSON.stringify(updatedUserData))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                forgotPassword,
                verifyResetCode,
                resetPassword,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
