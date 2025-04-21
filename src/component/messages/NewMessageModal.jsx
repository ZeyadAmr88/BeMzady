"use client"

import { useState, useEffect } from "react"
import { X, Search, User } from "lucide-react"
import { messageService } from "../../services/api"

const NewMessageModal = ({ isOpen, onClose, onMessageSent }) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (isOpen && searchQuery.length >= 2) {
            searchUsers()
        }
    }, [searchQuery, isOpen])

    const searchUsers = async () => {
        try {
            setLoading(true)
            // This would be replaced with an actual API call to search users
            // For now, we'll just simulate it
            setTimeout(() => {
                setUsers([
                    { _id: "1", username: "user1", user_picture: null },
                    { _id: "2", username: "user2", user_picture: null },
                    { _id: "3", username: "user3", user_picture: null },
                ])
                setLoading(false)
            }, 500)
        } catch (error) {
            console.error("Error searching users:", error)
            setLoading(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!selectedUser || !message.trim()) return

        try {
            setSending(true)
            setError("")

            await messageService.createConversation(selectedUser._id, message.trim())

            onMessageSent()
            resetForm()
            onClose()
        } catch (error) {
            console.error("Error sending message:", error)
            setError("Failed to send message. Please try again.")
        } finally {
            setSending(false)
        }
    }

    const resetForm = () => {
        setSearchQuery("")
        setUsers([])
        setSelectedUser(null)
        setMessage("")
        setError("")
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold">New Message</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {!selectedUser ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">To:</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for a user..."
                                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <div
                                                key={user._id}
                                                onClick={() => setSelectedUser(user)}
                                                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                            >
                                                {user.user_picture ? (
                                                    <img
                                                        src={user.user_picture || "/placeholder.svg"}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                        <User size={20} className="text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                )}
                                                <span>{user.username}</span>
                                            </div>
                                        ))
                                    ) : searchQuery.length >= 2 ? (
                                        <p className="text-center py-4 text-gray-500 dark:text-gray-400">No users found</p>
                                    ) : searchQuery.length > 0 ? (
                                        <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            Type at least 2 characters to search
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleSendMessage}>
                            <div className="mb-4 flex items-center">
                                <span className="text-sm font-medium mr-2">To:</span>
                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1">
                                    {selectedUser.user_picture ? (
                                        <img
                                            src={selectedUser.user_picture || "/placeholder.svg"}
                                            alt={selectedUser.username}
                                            className="w-6 h-6 rounded-full object-cover mr-2"
                                        />
                                    ) : (
                                        <User size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                                    )}
                                    <span>{selectedUser.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="message" className="block text-sm font-medium mb-1">
                                    Message:
                                </label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    placeholder="Type your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-70"
                                    disabled={sending || !message.trim()}
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NewMessageModal
