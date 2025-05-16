"use client"
import React from 'react';

import { useContext } from "react"
import { Toaster } from "react-hot-toast"
import { ThemeContext } from "../contexts/ThemeContext"
import { AuthContext } from "../contexts/AuthContext"
import { NotificationContext } from "../contexts/NotificationContext"
import Navbar from "./NavBar"
import Footer from "../layout/Footer"

const Layout = ({ children }) => {
    const { darkMode } = useContext(ThemeContext)
    // eslint-disable-next-line no-unused-vars
    const { user, loading } = useContext(AuthContext)
    // eslint-disable-next-line no-unused-vars
    const { unreadCount } = useContext(NotificationContext)

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode
                ? "dark bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100"
                : "bg-gradient-to-b from-gray-50 to-white text-gray-900"
                }`}
        >
            {/* Toast container */}
            <Toaster
                toastOptions={{
                    className: '',
                    style: {
                        border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                        padding: '16px',
                        color: darkMode ? '#F9FAFB' : '#1F2937',
                        background: darkMode ? '#1F2937' : '#FFFFFF',
                    },
                }}
            />

            <Navbar />
            <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
                <div className="rounded-lg shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 sm:p-6">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Layout
