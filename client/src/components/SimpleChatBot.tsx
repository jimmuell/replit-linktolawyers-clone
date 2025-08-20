import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useChat } from "@/hooks/use-chat";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        height: '500px',
        backgroundColor: 'white',
        border: '2px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '15px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} />
          <span style={{ fontWeight: '600' }}>Legal Assistant</span>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div 
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          backgroundColor: '#f9fafb'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
            <Bot size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
            <p style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 8px' }}>
              Welcome to Legal Assistant!
            </p>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Ask me about immigration law, visa processes, or our legal services.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === "user" ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '85%' }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} style={{ color: '#2563eb' }} />
                </div>
              )}
              
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: msg.role === "user" ? '#2563eb' : 'white',
                  color: msg.role === "user" ? 'white' : '#1f2937',
                  border: msg.role === "assistant" ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} style={{ color: '#6b7280' }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isTyping && streamingMessage && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '85%' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={16} style={{ color: '#2563eb' }} />
              </div>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {streamingMessage}
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '16px',
                  backgroundColor: '#2563eb',
                  marginLeft: '4px',
                  animation: 'pulse 1s infinite'
                }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about immigration law, our services..."
            disabled={isTyping}
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '100px',
              resize: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            style={{
              height: '40px',
              width: '40px',
              backgroundColor: message.trim() && !isTyping ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: message.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          margin: '8px 0 0',
          textAlign: 'center'
        }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default SimpleChatBot;