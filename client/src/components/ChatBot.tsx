import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import EnhancedChatInterface from './EnhancedChatInterface';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[450px] h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-medium">Legal Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Enhanced Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <EnhancedChatInterface 
          conversationId={conversationId}
          onConversationChange={setConversationId}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default ChatBot;