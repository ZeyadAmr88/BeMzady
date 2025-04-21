"use client"
import React from 'react';

import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem("token") || null)
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

    const login = async (email, password) => {
        try {
            const response = await api.post("/Auth/login", { email, password })
            const { token, data } = response.data

            localStorage.setItem("token", token)
            localStorage.setItem("user_id", data.id)

            setToken(token)
            setUser(data)

            return { success: true }
        } catch (error) {
            console.error("Login error:", error)
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
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed. Please try again.",
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user_id")
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
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
