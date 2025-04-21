/**
 * Utility function to handle API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {string} fallbackMessage - A fallback message to display if the error doesn't have a response
 * @returns {string} A user-friendly error message
 */
export const handleApiError = (error, fallbackMessage = "An error occurred. Please try again.") => {
    // Network errors
    if (error.code === "ERR_NETWORK") {
        return "Network error. Please check your internet connection or the API server may be down."
    }

    // Server returned an error response
    if (error.response) {
        // Get the status code
        const status = error.response.status

        // Handle common status codes
        switch (status) {
            case 400:
                return error.response.data?.message || "Invalid request. Please check your input."
            case 401:
                return "Authentication required. Please log in again."
            case 403:
                return "You don't have permission to access this resource."
            case 404:
                return "The requested resource was not found."
            case 422:
                return error.response.data?.message || "Validation error. Please check your input."
            case 429:
                return "Too many requests. Please try again later."
            case 500:
                return "Server error. Please try again later."
            default:
                return error.response.data?.message || fallbackMessage
        }
    }

    // Request was made but no response was received
    if (error.request) {
        return "No response from server. Please try again later."
    }

    // Something else happened in setting up the request
    return fallbackMessage
}

/**
 * Utility function to display error notifications
 * @param {Error} error - The error object
 * @param {Function} notifyFn - Function to display notifications (optional)
 */
export const displayErrorNotification = (error, notifyFn = null) => {
    const errorMessage = handleApiError(error)

    // If a notification function is provided, use it
    if (notifyFn && typeof notifyFn === "function") {
        notifyFn(errorMessage, { type: "error" })
        return
    }

    // Otherwise, log to console
    console.error(errorMessage)
}
