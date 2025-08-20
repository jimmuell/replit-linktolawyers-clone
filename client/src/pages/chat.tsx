import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, ArrowLeft } from 'lucide-react';
import { useChat } from "@/hooks/use-chat";
import { Link } from 'wouter';

const ChatPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Legal Assistant</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by AI
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Bot className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to Legal Assistant!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                I'm here to help you with immigration law questions, visa processes, 
                and information about our legal services. Ask me anything!
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer"
                     onClick={() => setMessage("What types of immigration cases do you handle?")}>
                  <h3 className="font-medium text-gray-800 mb-2">Immigration Cases</h3>
                  <p className="text-sm text-gray-600">Learn about our case types</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer"
                     onClick={() => setMessage("How does the attorney matching process work?")}>
                  <h3 className="font-medium text-gray-800 mb-2">Attorney Matching</h3>
                  <p className="text-sm text-gray-600">Understand our process</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer"
                     onClick={() => setMessage("What are your fees and pricing structure?")}>
                  <h3 className="font-medium text-gray-800 mb-2">Pricing Info</h3>
                  <p className="text-sm text-gray-600">Get pricing details</p>
                </div>
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" 
                    ? "bg-blue-600" 
                    : "bg-gray-200"
                }`}>
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-700" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-3xl ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isTyping && streamingMessage && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="inline-block px-4 py-3 rounded-2xl bg-white text-gray-800 border border-gray-200">
                    <div className="whitespace-pre-wrap break-words">
                      {streamingMessage}
                      <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about immigration law, our services, or any legal questions..."
                  className="w-full min-h-12 max-h-32 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </p>
              {isTyping && (
                <p className="text-xs text-blue-600">
                  AI is typing...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;