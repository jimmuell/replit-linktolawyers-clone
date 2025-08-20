import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useChat } from "@/hooks/use-chat";
import type { Message } from "@shared/schema";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    createNewConversation,
    isTyping,
    streamingMessage
  } = useChat(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    let conversationToUse = conversationId;

    // Create new conversation if none exists
    if (!conversationToUse) {
      try {
        conversationToUse = await createNewConversation();
        setConversationId(conversationToUse);
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }

    const messageToSend = message;
    setMessage("");
    sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  console.log("ChatBot is rendering with isOpen:", isOpen);
  console.log("Messages count:", messages.length);
  console.log("Current conversation ID:", conversationId);

  return (
    <>
      {/* Debug overlay to see if anything renders at all */}
      <div 
        className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded z-[9999]"
        style={{ zIndex: 10000 }}
      >
        ChatBot Debug: {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
      
      <div 
        className="fixed bottom-4 right-4 w-[450px] h-[600px] bg-red-500 rounded-lg shadow-2xl border-4 border-blue-500 flex flex-col"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '450px',
          height: '600px',
          backgroundColor: 'red'
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-medium">Legal Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {isTyping && (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Typing...</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Welcome to the Legal Assistant!</p>
            <p className="text-sm mt-2">Ask me anything about immigration law or our services.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex items-start gap-3 max-w-[80%]`}>
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 border rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {isTyping && streamingMessage && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="p-3 rounded-lg bg-white text-gray-900 border rounded-bl-sm shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse"></span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 rounded-b-lg">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about immigration law, our services, or any legal questions..."
            className="flex-1 min-h-12 max-h-32 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="h-12 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
      </div>
    </>
  );
};

export default ChatBot;