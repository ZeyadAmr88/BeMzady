"use client"
import React, { createContext, useContext } from "react"
import toast from "react-hot-toast"

// Create the context
export const ToastContext = createContext()

// Custom hook for using the toast context
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }) => {
  // Success toast function
  const showSuccess = (message) => {
    return toast.success(message, {
      duration: 4000,
      position: "center",
      style: {
        background: "#10B981",
        color: "#FFFFFF",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#FFFFFF",
        secondary: "#10B981",
      },
    })
  }

  // Error toast function
  const showError = (message) => {
    return toast.error(message, {
      duration: 5000,
      position: "center",
      style: {
        background: "#EF4444",
        color: "#FFFFFF",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#FFFFFF",
        secondary: "#EF4444",
      },
    })
  }

  // Info toast function
  const showInfo = (message) => {
    return toast(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#3B82F6",
        color: "#FFFFFF",
        fontWeight: "500",
      },
      icon: "ℹ️",
    })
  }

  // Warning toast function
  const showWarning = (message) => {
    return toast(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#F59E0B",
        color: "#FFFFFF",
        fontWeight: "500",
      },
      icon: "⚠️",
    })
  }

  // Dismiss all toasts
  const dismissAll = () => {
    toast.dismiss()
  }

  // Provide the toast functions to the context
  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
        dismissAll,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}
