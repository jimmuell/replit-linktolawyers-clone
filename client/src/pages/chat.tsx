import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, ArrowLeft, FileText, Mail, Trash2, Loader2 } from 'lucide-react';
import { useChat } from "@/hooks/use-chat";
import { Link } from 'wouter';
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const ChatPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch active prompt for initial greeting
  const { data: activePrompt } = useQuery<{
    id: number;
    name: string;
    prompt: string;
    initialGreeting?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>({
    queryKey: ['/api/chatbot-prompts/active'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

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

  // Auto-create conversation and handle intake data when page loads
  useEffect(() => {
    const initializeChat = async () => {
      if (!conversationId && activePrompt !== undefined) {
        try {
          // Check for intake data in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const intakeParam = urlParams.get('intake');
          
          let newConversationId: string;
          
          if (intakeParam) {
            // Process intake data
            try {
              const intakeData = JSON.parse(decodeURIComponent(intakeParam));
              
              // Submit intake data to backend
              const response = await fetch('/api/chat/intake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(intakeData)
              });
              
              if (response.ok) {
                const result = await response.json();
                newConversationId = result.conversationId;
                setConversationId(newConversationId);
                
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Refresh messages to show the intake message
                queryClient.invalidateQueries({ 
                  queryKey: ["/api/conversations", newConversationId, "messages"] 
                });
                
                return; // Exit early since intake handled everything
              }
            } catch (error) {
              console.error('Error processing intake data:', error);
              // Fall back to normal conversation creation
            }
          }
          
          // Normal conversation creation (no intake data)
          newConversationId = await createNewConversation();
          setConversationId(newConversationId);
          
          // Add automatic greeting message from assistant using active prompt greeting or fallback
          setTimeout(async () => {
            const greetingContent = activePrompt?.initialGreeting || 
              "Hello! I'm your Legal Assistant AI. I'm here to help you with questions about immigration law, our legal services, or any other legal matters you'd like to discuss. How can I assist you today?";
            
            await fetch(`/api/conversations/${newConversationId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ 
                content: greetingContent, 
                role: "assistant" 
              })
            });
            
            // Refresh messages to show the greeting
            queryClient.invalidateQueries({ 
              queryKey: ["/api/conversations", newConversationId, "messages"] 
            });
          }, 500);
        } catch (error) {
          console.error("Failed to initialize chat:", error);
        }
      }
    };

    initializeChat();
  }, [activePrompt, conversationId]); // Re-run when activePrompt or conversationId changes

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

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Export PDF clicked");
  };

  const handleSendEmail = () => {
    // TODO: Implement send email functionality
    console.log("Send Email clicked");
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    
    // Clear the current conversation and create a new one with greeting
    setConversationId(null);
    
    // Create new conversation and add greeting
    try {
      const newConversationId = await createNewConversation();
      setConversationId(newConversationId);
      
      // Add automatic greeting message from assistant using active prompt greeting or fallback
      const greetingContent = activePrompt?.initialGreeting || 
        "Hello! I'm your Legal Assistant AI. I'm here to help you with questions about immigration law, our legal services, or any other legal matters you'd like to discuss. How can I assist you today?";
      
      await fetch(`/api/conversations/${newConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          content: greetingContent, 
          role: "assistant" 
        })
      });
      
      // Refresh messages to show the greeting
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", newConversationId, "messages"] 
      });
    } catch (error) {
      console.error("Failed to clear and reset chat:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Legal Assistant</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportPDF()}
                className="text-gray-600 hover:text-gray-800"
              >
                <FileText className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSendEmail()}
                className="text-gray-600 hover:text-gray-800"
              >
                <Mail className="w-4 h-4 mr-1" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearChat}
                disabled={isClearing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                {isClearing ? "Clearing..." : "Clear"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          {/* Messages Area - Scrollable */}
          <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">


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
        </div>
      </div>

      {/* Sticky Footer - Input Area */}
      <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about immigration law, our services, or any legal questions..."
                className="w-full min-h-12 max-h-32 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                disabled={isTyping}
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            {isTyping && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                AI is typing...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;