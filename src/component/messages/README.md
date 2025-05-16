# Messaging Components

This directory contains components for the messaging system in BeMazady.

## Components

### 1. `ContactButton`

A button component that allows users to contact another user.

```jsx
import ContactButton from "../messages/ContactButton";

// In your component:
<ContactButton
  recipientId="user123"
  buttonText="Contact Seller"
  showIcon={true}
/>

// OR with recipient object:
<ContactButton
  recipient={sellerInfo}
  className="custom-class-name"
/>
```

**Props:**

- `recipient`: User object with `_id` property
- `recipientId`: ID of the user to contact (alternative to recipient)
- `buttonText`: Custom button text (default: "Contact")
- `showIcon`: Whether to show the message icon (default: true)
- `className`: Additional CSS classes

### 2. `MessageBubble`

Renders a single message in a conversation.

```jsx
import MessageBubble from "../messages/MessageBubble";

// In your component:
<MessageBubble
  message={messageObject}
  isOwn={message.sender._id === currentUser._id}
/>;
```

**Props:**

- `message`: Message object with content, sender, etc.
- `isOwn`: Boolean whether the message is from the current user

### 3. `NewMessageModal`

A modal for composing a new message.

```jsx
import { useState } from "react";
import NewMessageModal from "../messages/NewMessageModal";

// In your component:
const [isModalOpen, setIsModalOpen] = useState(false);

// Then in the return:
<button onClick={() => setIsModalOpen(true)}>New Message</button>;

{
  isModalOpen && (
    <NewMessageModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onMessageSent={() => {
        setIsModalOpen(false);
        // Optional: navigate or refresh
      }}
      preselectedUserId="user123" // Optional
    />
  );
}
```

**Props:**

- `isOpen`: Boolean to control visibility
- `onClose`: Function to call when closing the modal
- `onMessageSent`: Callback for when a message is sent
- `preselectedUserId`: Optional ID to preselect a recipient

## Usage in Other Components

### Adding Contact Button to User Profiles

```jsx
import ContactButton from "../messages/ContactButton";

// In user profile section:
<div className="user-profile">
  <h2>{user.username}</h2>
  <ContactButton recipientId={user._id} />
</div>;
```

### Adding to Product/Auction Details

```jsx
import ContactButton from "../messages/ContactButton";

// In seller info section:
<div className="seller-info">
  <h3>Seller: {item.owner.username}</h3>
  <ContactButton recipientId={item.owner._id} buttonText="Contact Seller" />
</div>;
```

## API Integration

The messaging components use the following API endpoints through `messageService`:

- `getConversations()`: Get all conversations for the logged-in user
- `getMessages(conversationId)`: Get messages in a specific conversation
- `sendMessage(recipientId, content)`: Send a new message
- `createConversation(recipientId)`: Create a new conversation
- `deleteConversation(conversationId)`: Delete a conversation
- `markAsRead(messageId)`: Mark a message as read
- `getUnreadCount()`: Get count of unread messages
