"use client";

import React, { useState, useEffect } from "react";
import { X, Search, User } from "lucide-react";
import { messageService } from "../services/api";

const NewMessageModal = ({
  isOpen,
  onClose,
  onMessageSent,
  preselectedUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [preselectedUserLoading, setPreselectedUserLoading] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery.length >= 2) {
      searchUsers();
    }
  }, [searchQuery, isOpen]);

  // If preselectedUserId is provided, fetch and select that user
  useEffect(() => {
    if (isOpen && preselectedUserId && !selectedUser) {
      fetchPreselectedUser(preselectedUserId);
    }
  }, [isOpen, preselectedUserId, selectedUser]);

  const fetchPreselectedUser = async (userId) => {
    try {
      setPreselectedUserLoading(true);

      // Check if userId is valid
      if (!userId) {
        console.error("Invalid userId provided:", userId);
        setPreselectedUserLoading(false);
        return;
      }

      // Try to get user details from the API
      try {
        // First attempt: try user service directly
        const userResponse = await messageService.getUserById(userId);
        console.log("User details response:", userResponse);

        if (userResponse?.data) {
          // Extract user data
          const userData = userResponse.data.data || userResponse.data;
          setSelectedUser(userData);
          return;
        }
      } catch (firstError) {
        console.error(
          "Error fetching user details from user service:",
          firstError
        );

        // Second attempt: try searching for the user
        try {
          // Search by ID prefix (first few characters)
          const searchResponse = await messageService.searchUsers(
            userId.substring(0, 5)
          );
          console.log("User search response:", searchResponse);

          if (searchResponse?.data) {
            let users = [];

            // Handle different response formats
            if (Array.isArray(searchResponse.data)) {
              users = searchResponse.data;
            } else if (
              searchResponse.data.data &&
              Array.isArray(searchResponse.data.data)
            ) {
              users = searchResponse.data.data;
            }

            // Find a user matching our ID
            const matchingUser = users.find((u) => u._id === userId);
            if (matchingUser) {
              setSelectedUser(matchingUser);
              return;
            }
          }
        } catch (secondError) {
          console.error("Error searching for user:", secondError);
        }
      }

      // Fallback: Create a basic user object with the ID
      console.log("Using fallback user data for:", userId);
      const user = {
        _id: userId,
        username: `User ${userId.substring(0, 5)}`,
        user_picture: null,
      };
      setSelectedUser(user);
    } finally {
      setPreselectedUserLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setLoading(true);

      // Use the actual API endpoint to search users
      const response = await messageService.searchUsers(searchQuery);
      console.log("User search response:", response);

      // Handle different possible response structures
      let usersData = [];

      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        usersData = response.data.data;
      } else if (response.data && typeof response.data === "object") {
        // Extract users if it's an object with user data
        usersData = Object.values(response.data).filter(
          (item) => item && typeof item === "object" && item.username
        );
      }

      // If we couldn't get users from the API, provide fallback data
      if (usersData.length === 0) {
        console.log("No users found from API, using fallback data");
        // Fallback data for testing
        usersData = [
          { _id: "1", username: "user1", user_picture: null },
          { _id: "2", username: "user2", user_picture: null },
          { _id: "3", username: "user3", user_picture: null },
        ];
      }

      console.log("Setting users:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error searching users:", error);
      // Fallback data in case of error
      setUsers([
        { _id: "1", username: "user1", user_picture: null },
        { _id: "2", username: "user2", user_picture: null },
        { _id: "3", username: "user3", user_picture: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedUser || !message.trim()) return;

    try {
      setSending(true);
      setError("");

      // Store the message content
      const messageContent = message.trim();


        // Try one more time with direct message if there was any error
        try {
          console.log("Trying fallback direct message to:", selectedUser._id);
          const directResponse = await messageService.sendMessage(
            selectedUser._id,
            messageContent
          );
          console.log("Direct message response:", directResponse);
          

          if (directResponse.status >= 200 && directResponse.status < 300) {
            onMessageSent?.(selectedUser._id);
            resetForm();
            onClose();
            return;
          }
        } catch (finalError) {
          console.error("All message sending approaches failed:", finalError);
          throw finalError;
        }
      

      // If we get here, all approaches failed
      throw new Error("All message sending approaches failed");
    } catch (error) {
      console.error("Error sending message:", error);

      if (error.response?.status === 403) {
        setError(
          "You don't have permission to message this user. You might need to log in again."
        );
      } else if (error.response?.status === 401) {
        setError("Authentication error. Please log in again.");
      } else if (!navigator.onLine) {
        setError(
          "You appear to be offline. Please check your internet connection."
        );
      } else {
        setError("Failed to send message. Please try again later.");
      }
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setUsers([]);
    setSelectedUser(null);
    setMessage("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">  
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {preselectedUserLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
            </div>
          ) : !selectedUser ? (
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
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
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
                            <User
                              size={20}
                              className="text-gray-500 dark:text-gray-400"
                            />
                          </div>
                        )}
                        <span>{user.username}</span>
                      </div>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No users found
                    </p>
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
                    <User
                      size={16}
                      className="text-gray-500 dark:text-gray-400 mr-2"
                    />
                  )}
                  <span>{selectedUser.username}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1"
                >
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
  );
};

export default NewMessageModal;
