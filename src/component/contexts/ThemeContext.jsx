"use client"
import React from 'react';

import { createContext } from "react"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const darkMode = true; // Always dark mode

    React.useEffect(() => {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
    }, [])

    return <ThemeContext.Provider value={{ darkMode }}>{children}</ThemeContext.Provider>
}
