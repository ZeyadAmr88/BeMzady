import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { messageService } from "../services/api";
import NewMessageModal from "./NewMessageModal";

/**
 * A button that allows users to contact another user through the messaging system.
 *
 * @param {Object} props - Component props
 * @param {Object} props.recipient - The user to contact
 * @param {String} props.recipientId - The ID of the user to contact (alternative to recipient)
 * @param {String} props.buttonText - Custom button text (default: "Contact")
 * @param {Boolean} props.showIcon - Whether to show the message icon
 * @param {String} props.className - Additional CSS classes
 */
const ContactButton = ({
  recipient,
  recipientId,
  buttonText = "Contact",
  showIcon = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use either the recipient object or just the ID
  const targetId = recipient?._id || recipientId;

  const handleContact = async () => {
    // If not logged in, can't send messages
    if (!user) {
      navigate("/login");
      return;
    }
  
    // Don't allow messaging yourself
    if (user._id === targetId) {
      return;
    }
  
    setLoading(true);
    try {
      // Directly open the modal instead of calling the API
      setIsModalOpen(true);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Don't render if trying to contact yourself or no target specified
  if ((user && user._id === targetId) || !targetId) {
    return null;
  }

  const defaultClasses =
    "flex items-center justify-center px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors";
  const buttonClasses = className || defaultClasses;

  return (
    <>
      <button
        onClick={handleContact}
        disabled={loading}
        className={buttonClasses}
      >
        {showIcon && <MessageSquare size={18} className="mr-2" />}
        {loading ? "Loading..." : buttonText}
      </button>

      {isModalOpen && (
        <NewMessageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          preselectedUserId={targetId}
          onMessageSent={() => {
            setIsModalOpen(false);
            navigate("/messages");
          }}
        />
      )}
    </>
  );
};

export default ContactButton;
