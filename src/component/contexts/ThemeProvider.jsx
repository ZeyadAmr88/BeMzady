import React, { useState, useEffect } from "react"
import { ThemeContext } from "./ThemeContext"

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true)

    useEffect(() => {
        document.documentElement.classList.add("dark")
    }, [])

    const toggleTheme = () => {
        setDarkMode(!darkMode)
    }

    return <ThemeContext.Provider value={{ darkMode, toggleTheme }}>{children}</ThemeContext.Provider>
} 