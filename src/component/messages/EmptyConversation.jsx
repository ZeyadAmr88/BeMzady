import { MessageSquare } from "lucide-react"

const EmptyConversation = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare size={48} className="text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No conversation selected</h2>
            <p className="text-gray-500 dark:text-gray-400">Select a conversation from the list or start a new one.</p>
        </div>
    )
}

export default EmptyConversation
