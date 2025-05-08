"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { messageService } from "../services/api"
import { ArrowLeft, Send, User, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import MessageBubble from "../messages/MessageBubble"
const Conversation = () => {
    const { id: conversationId } = useParams()
    const { user } = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [otherUser, setOtherUser] = useState(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchMessages()

        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000)

        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId])

    useEffect(() => {
        // Scroll to bottom when messages change
        scrollToBottom()
    }, [messages])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const response = await messageService.getMessages(conversationId)
            setMessages(response.data.data || [])

            // Find the other user in the conversation
            const conversation = response.data.conversation || {}
            if (conversation.participants) {
                const other = conversation.participants.find(p => p._id !== user._id)
                setOtherUser(other)
            }

            setError(null)
        } catch (error) {
            console.error("Error fetching messages:", error)
            setError("Failed to load messages. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!newMessage.trim()) return

        try {
            setSending(true)
            await messageService.sendMessage(otherUser._id, newMessage.trim())

            // Refresh messages
            await fetchMessages()

            // Clear input
            setNewMessage("")
        } catch (error) {
            console.error("Error sending message:", error)
            setError("Failed to send message. Please try again.")
        } finally {
            setSending(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    if (loading && !messages.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link to="/messages" className="flex items-center text-rose-600 hover:text-rose-700">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Messages
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    {otherUser ? (
                        <>
                            {otherUser.user_picture ? (
                                <img
                                    src={otherUser.user_picture || "/placeholder.svg"}
                                    alt={otherUser.username}
                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                    <User size={20} className="text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                            <div>
                                <h2 className="font-medium">{otherUser.username}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {otherUser.last_active ? `Last active ${formatDistanceToNow(new Date(otherUser.last_active), { addSuffix: true })}` : ""}
                                </p>
                            </div>
                        </>
                    ) : (
                        <h2 className="font-medium">Conversation</h2>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={message.sender._id === user._id}
                                />
                            ))}
                                <div ref={messagesEndRef} />    
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-r-md px-4 py-2 flex items-center transition-colors disabled:opacity-70"
                            disabled={sending || !newMessage.trim()}
                        >
                            {sending ? (
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Conversation

