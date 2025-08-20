import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import type { Message } from "@shared/schema";

interface EnhancedChatInterfaceProps {
  conversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
  className?: string;
}

export default function EnhancedChatInterface({ 
  conversationId, 
  onConversationChange,
  className = ""
}: EnhancedChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    createNewConversation,
    isTyping,
    streamingMessage
  } = useChat(currentConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    let conversationToUse = currentConversationId;

    // Create new conversation if none exists
    if (!conversationToUse) {
      try {
        conversationToUse = await createNewConversation();
        setCurrentConversationId(conversationToUse);
        onConversationChange?.(conversationToUse);
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
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Legal Assistant</h2>
        </div>
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Assistant is typing...
          </div>
        )}
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
                className={`p-4 rounded-lg ${
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
              <div className="p-4 rounded-lg bg-white text-gray-900 border rounded-bl-sm shadow-sm">
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
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about immigration law, our services, or any legal questions..."
              className="min-h-12 max-h-32 resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={isTyping}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}