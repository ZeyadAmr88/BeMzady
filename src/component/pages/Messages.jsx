"use client"

import React from "react";
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import { messageService } from "../services/api"
import { Search, MessageSquare, Trash2, User, Clock, AlertCircle, PlusCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import NewMessageModal from "../messages/NewMessageModal"
import ErrorBoundary from "../common/ErrorBoundary"

const Messages = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(null)
  // const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await messageService.getConversations()
      console.log("Conversations API response:", response)

      // Handle different possible response structures
      let conversationsData = []
      if (response.data && Array.isArray(response.data)) {
        conversationsData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        conversationsData = response.data.data
      } else if (response.data && typeof response.data === "object") {
        // Extract conversations if it's an object with conversation data
        conversationsData = Object.values(response.data).filter(
          (item) => item && typeof item === "object" && item.participants,
        )
      }

      console.log("Processed conversations data:", conversationsData)
      setConversations(conversationsData)
      setError(null)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("Failed to load conversations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (conversationId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Validate the conversation ID before setting it
    if (conversationId) {
      setDeleteConfirmationId(conversationId)
    } else {
      console.error("Invalid conversation ID for deletion")
      setError("Cannot delete this conversation. Invalid ID.")
    }
  }

  const confirmDelete = async () => {
    try {
      if (!deleteConfirmationId) {
        console.error("No conversation ID to delete")
        return
      }

      await messageService.deleteConversation(deleteConfirmationId)

      // Update conversations state safely
      setConversations((prev) =>
        Array.isArray(prev) ? prev.filter((conv) => conv && conv._id !== deleteConfirmationId) : [],
      )

      if (selectedConversation && selectedConversation._id === deleteConfirmationId) {
        setSelectedConversation(null)
      }

      setDeleteConfirmationId(null) // Close the modal
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setError("Failed to delete conversation. Please try again.")
      setDeleteConfirmationId(null) // Close the modal
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter((conversation) => {
      // Skip invalid conversation objects
      if (!conversation || !conversation.participants || !Array.isArray(conversation.participants)) {
        console.warn("Invalid conversation format:", conversation)
        return false
      }

      // Get the other user in the conversation
      const otherUser = conversation.participants.find((participant) => participant && participant._id !== user?._id)

      // If no other user found or they don't have a username, skip
      if (!otherUser || !otherUser.username) {
        console.warn("No other user found in conversation:", conversation)
        return false
      }

      // Filter by username if search query provided
      return searchQuery ? otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) : true
    })
    : []

  const handleSelectConversation = (conversation) => {
    navigate(`/messages/${conversation._id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          {/* <button
            onClick={() => setIsNewMessageModalOpen(true)}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            New Message
          </button> */}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">No messages yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery
                  ? "No conversations match your search."
                  : "When you have conversations, they'll appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredConversations.map((conversation) => {
                const otherUser = conversation.participants.find((participant) => participant._id !== user._id)
                const lastMessage = conversation.lastMessage || {}
                const isUnread = conversation.unreadCount > 0

                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isUnread ? "bg-rose-50 dark:bg-rose-900/10" : ""
                      }`}
                  >
                    <div className="relative mr-4">
                      {otherUser.user_picture ? (
                        <img
                          src={otherUser.user_picture || "/placeholder.svg"}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User size={24} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      {isUnread && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-rose-600 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{otherUser.username}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-2 whitespace-nowrap">
                          <Clock size={12} className="mr-1" />
                          {lastMessage.createdAt
                            ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
                            : "No messages"}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${isUnread ? "font-medium" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {lastMessage.content || "No messages yet"}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conversation._id, e)}
                      className="ml-2 p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* {isNewMessageModalOpen && (
          <NewMessageModal
            isOpen={isNewMessageModalOpen}
            onClose={() => setIsNewMessageModalOpen(false)}
            onMessageSent={(conversationId) => {
              setIsNewMessageModalOpen(false)
              // Refresh conversations or navigate to the new conversation
              if (conversationId) {
                navigate(`/messages/${conversationId}`)
              } else {
                fetchConversations()
              }
            }}
          />
        )} */}
        {deleteConfirmationId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium mb-4">Delete Conversation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Messages
