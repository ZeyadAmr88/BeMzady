"use client"

import { formatDistanceToNow } from "date-fns"
import { User, Check, CheckCheck } from "lucide-react"

const MessageBubble = ({ message, isOwn }) => {
    const formattedTime = message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : ""

    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className="flex items-end max-w-[75%]">
                {!isOwn && (
                    <div className="flex-shrink-0 mr-2">
                        {message.sender.user_picture ? (
                            <img
                                src={message.sender.user_picture || "/placeholder.svg"}
                                alt={message.sender.username}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User size={16} className="text-gray-500 dark:text-gray-400" />
                            </div>
                        )}
                    </div>
                )}

                <div
                    className={`rounded-lg px-4 py-2 ${isOwn ? "bg-rose-600 text-white rounded-br-none" : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                        }`}
                >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div
                        className={`text-xs mt-1 flex items-center ${isOwn ? "text-rose-200" : "text-gray-500 dark:text-gray-400"}`}
                    >
                        <span>{formattedTime}</span>
                        {isOwn && <span className="ml-1">{message.read ? <CheckCheck size={12} /> : <Check size={12} />}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
