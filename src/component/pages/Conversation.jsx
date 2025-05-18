"use client";

import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { messageService } from "../services/api";
import { ArrowLeft, Send, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MessageBubble from "../messages/MessageBubble";

const Conversation = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [lastSentMessage, setLastSentMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom only when messages change and there are messages
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const container = document.querySelector(".messages-container");
    if (!container) return;

    const handleScroll = () => {
      setShowScrollButton(!isNearBottom());
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchMessages = async () => {
    const wasAtBottom = isNearBottom();

    try {
      setLoading(true);
      console.log(`Fetching messages for conversation: ${conversationId}`);

      const timeoutId = setTimeout(() => {
        console.warn("Message fetch operation taking longer than expected");
      }, 5000);

      const response = await messageService.getMessages(conversationId);
      clearTimeout(timeoutId);
      console.log("🖊️response:", response);

      let messagesData = [];

      if (response && Array.isArray(response)) {
        messagesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        messagesData = response.data.data;
      } else if (
        response.data &&
        response.data.messages &&
        Array.isArray(response.data.messages)
      ) {
        messagesData = response.data.messages;
      }

      console.log(`Received ${messagesData.length} messages:`, messagesData);

      if (messagesData.length > 0 || messages.length === 0) {
        setMessages(messagesData);
      } else {
        console.log("No messages returned, keeping existing messages");
      }

      // 🔧 FIXED: Build conversation manually if missing
      let conversation = response.data || {};

      if (!conversation.participants && messagesData.length > 0) {
        const firstMessage = messagesData[0];
        console.log("🖊️firstMessage:", firstMessage);

        if (firstMessage.conversation) {
          conversation = firstMessage.conversation;
        } else {
          const senderInfo = firstMessage.sender || {};

          const recipientInfo = firstMessage.recipient;

          console.log("🖊️senderInfo:", senderInfo);
          console.log("🖊️recipientInfo:", recipientInfo);

          const potentialParticipants = [senderInfo, recipientInfo].filter(
            (p) => p && p._id
          );
          console.log("🖊️potentialParticipants:", potentialParticipants);

          conversation = {
            participants: potentialParticipants,
          };
        }
      }

      console.log("Conversation data:", conversation);

      if (
        !otherUser ||
        (conversation.participants && Array.isArray(conversation.participants))
      ) {
        if (
          conversation.participants &&
          Array.isArray(conversation.participants)
        ) {
          const other = conversation.participants.find(
            (p) => p._id !== user?._id && p._id
          );
          if (other) {
            console.log("Other user found:", other);
            setOtherUser(other);
          } else {
            console.warn("Could not find other user in participants");

            if (messagesData.length > 0) {
              const userSet = new Set();
              messagesData.forEach((msg) => {
                if (
                  msg.sender &&
                  msg.sender._id &&
                  msg.sender._id !== user?._id
                ) {
                  userSet.add(JSON.stringify(msg.sender));
                }
                if (
                  msg.recipient &&
                  typeof msg.recipient === "object" &&
                  msg.recipient._id &&
                  msg.recipient._id !== user?._id
                ) {
                  userSet.add(JSON.stringify(msg.recipient));
                }
              });

              if (userSet.size === 1) {
                const otherUserData = JSON.parse(Array.from(userSet)[0]);
                console.log("Found other user from messages:", otherUserData);
                setOtherUser(otherUserData);
              }
            }
          }
        } else {
          console.warn("No participants found in conversation data");
        }
      }

      if (messagesData.length > 0) {
        markMessagesAsRead(messagesData);
      }

      if (wasAtBottom) {
        scrollToBottom();
      }

      setShowScrollButton(!wasAtBottom);
      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.code === "ECONNABORTED") {
        setError(
          "Request timed out. The server is taking too long to respond."
        );
      } else if (error.response?.status === 404) {
        setError("Conversation not found. You can still send a message.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this conversation.");
      } else if (error.response?.status === 400) {
        setError(
          "The API is having trouble loading messages, but you can still send new ones."
        );
      } else if (!navigator.onLine) {
        setError(
          "You appear to be offline. Please check your internet connection."
        );
      } else {
        setError(
          "Couldn't load messages from server, but you can still send new ones."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (messagesArray) => {
    try {
      // Find unread messages that are not from the current user
      const unreadMessages = messagesArray.filter(
        (msg) => !msg.isRead && msg.sender._id !== user._id
      );

      // Mark each unread message as read
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg._id);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Helper function to add a temporary message to the UI
  const addTemporaryMessage = (content, recipientUser) => {
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: content,
      sender: user,
      recipient: recipientUser || otherUser,
      createdAt: new Date().toISOString(),
      isRead: false,
      isTemporary: true, // Flag to identify temporary messages
    };

    console.log("Adding temporary message to UI:", tempMessage);
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setLastSentMessage(tempMessage);
    return tempMessage;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setSending(true);
      setError(null); // Clear any previous errors

      // Log important debugging info
      console.log("Sending message to conversation:", conversationId);
      console.log("Message content:", messageContent);
      console.log("Current otherUser:", otherUser);

      // Add a temporary message immediately for better UX
      if (otherUser) {
        const tempMsg = addTemporaryMessage(messageContent, otherUser);
        console.log("Added temporary message:", tempMsg);
      }

      // Try direct message approach which is the only working one
      // if (conversationId) {
      //   try {
      //     // Try sending to the conversation first
      //     await messageService.sendMessage(conversationId, messageContent);
      //     console.log("Message sent to conversation successfully");

      //     // If successful, refresh messages
      //     try {
      //       await fetchMessages();
      //     } catch (refreshError) {
      //       console.error(
      //         "Could not refresh messages, but message was sent:",
      //         refreshError
      //       );
      //       // We already have a temp message, so just show that
      //     }
      //     return;
      //   } catch (error) {
      //     console.error("Error sending to conversation:", error);
      //     // If conversation ID doesn't work, try user ID
      //   }
      // }

      // Try sending directly to the user if we have otherUser
      if (otherUser && otherUser._id) {
        try {
          console.log("Trying to send directly to user:", otherUser._id);
          await messageService.sendMessage(otherUser._id, messageContent);
          console.log("Message sent to user successfully");

          // If successful, try to refresh
          try {
            await fetchMessages();
          } catch (refreshError) {
            console.error(
              "Could not refresh messages, but message was sent:",
              refreshError
            );
            // We already have a temp message, so just show that
          }
          return;
        } catch (finalError) {
          console.error("Failed to send message to user:", finalError);
          throw finalError;
        }
      } else {
        // No otherUser to try with
        setError(
          "Cannot identify the recipient. Please refresh the page and try again."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // More detailed error handling
      if (error.response && error.response.status === 400) {
        setError(
          "Failed to send message. The API couldn't process the request."
        );
      } else if (error.response && error.response.status === 404) {
        setError(
          "Conversation not found. The API endpoint might have changed."
        );
      } else if (error.response && error.response.status === 401) {
        setError(
          "You need to be logged in to send messages. Please log in again."
        );
      } else if (error.response && error.response.status === 403) {
        setError("You don't have permission to send this message.");
      } else if (!navigator.onLine) {
        setError(
          "You appear to be offline. Please check your internet connection."
        );
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  // Add a dedicated scroll function for manual control
  const scrollToBottom = (behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: behavior,
        block: "end",
      });
    }
  };

  // Replace the previous scrollToBottom function with this implementation
  const handleScrollToBottom = () => {
    scrollToBottom("auto"); // Use "auto" for an immediate scroll without animation
  };

  // Update isNearBottom function to work with the scroll container
  const isNearBottom = () => {
    if (!messagesEndRef.current) return true; // Default to true if ref not available

    const container = document.querySelector(".messages-container");
    if (!container) return true; // Default to true if container not found

    const scrollBottom = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // If we're within 100px of the bottom, consider it "near bottom"
    return scrollHeight - scrollBottom < 100;
  };

  if (loading && !messages.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/messages"
          className="flex items-center text-rose-600 hover:text-rose-700"
        >
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
                  <User
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </div>
              )}
              <div>
                <h2 className="font-medium">{otherUser.username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {otherUser.last_active
                    ? `Last active ${formatDistanceToNow(
                        new Date(otherUser.last_active),
                        { addSuffix: true }
                      )}`
                    : ""}
                </p>
              </div>
            </>
          ) : (
            <h2 className="font-medium">Conversation</h2>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 messages-container relative">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                // Check if message has proper _id, use index as fallback
                const messageKey =
                  message._id || `msg-${messages.indexOf(message)}`;

                // Determine if message is from current user by checking sender ID
                const senderId = message.sender?._id || message.sender?.id;
                const isOwnMessage =
                  senderId === user?._id || senderId === user?.id;

                return (
                  <MessageBubble
                    key={messageKey}
                    message={message}
                    isOwn={isOwnMessage}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Add a scroll-to-bottom button within the messages container */}
          {showScrollButton && (
            <button
              onClick={handleScrollToBottom}
              className="absolute bottom-6 right-6 bg-rose-600 text-white rounded-full p-2 shadow-md hover:bg-rose-700 transition-colors z-10"
              aria-label="Scroll to bottom"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
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
  );
};

export default Conversation;
