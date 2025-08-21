import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, ArrowLeft, FileText, Mail, Trash2, Loader2, CheckCircle, File } from 'lucide-react';
import { useChat } from "@/hooks/use-chat";
import { Link } from 'wouter';
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const ChatPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [hasCheckedLegalRequest, setHasCheckedLegalRequest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Check for legal request creation after messages update
  useEffect(() => {
    const checkForLegalRequest = async () => {
      if (!conversationId || hasCheckedLegalRequest) return;
      
      // Wait a moment after messages load to check for legal request
      if (messages && messages.length > 2) {
        // Look for an assistant message containing "Attorney Intake Summary"
        const summaryMessage = messages.find(msg => 
          msg.role === 'assistant' && 
          (msg.content.includes('Attorney Intake Summary') || msg.content.includes('Case Summary:'))
        );
        
        if (summaryMessage) {
          try {
            const response = await fetch(`/api/conversations/${conversationId}/legal-request`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.hasLegalRequest) {
                toast({
                  title: "Legal Request Created! 📋",
                  description: `Your case has been documented as ${result.requestNumber}. You'll receive an email confirmation shortly.`,
                  duration: 8000,
                });
                setHasCheckedLegalRequest(true);
              }
            }
          } catch (error) {
            console.error('Error checking legal request:', error);
          }
        }
      }
    };

    // Delay check to ensure legal request creation has completed
    const timeoutId = setTimeout(checkForLegalRequest, 2000);
    return () => clearTimeout(timeoutId);
  }, [messages, conversationId, hasCheckedLegalRequest, toast]);

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

  const handleExportPDF = async () => {
    if (!messages.length) {
      alert('No conversation to export');
      return;
    }

    setIsExportingPDF(true);
    
    try {
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Helper function to wrap text
      const wrapText = (text: string, maxWidth: number) => {
        return doc.splitTextToSize(text, maxWidth);
      };

      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Legal Assistant Conversation Report', margin, yPosition);
      yPosition += 15;

      // Add date and time
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const now = new Date();
      doc.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, margin, yPosition);
      yPosition += 10;

      // Add conversation ID if available
      if (conversationId) {
        doc.text(`Conversation ID: ${conversationId}`, margin, yPosition);
        yPosition += 15;
      }

      // Add separator line
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Extract user information from first user message if it contains intake data
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      let userInfo = '';
      if (firstUserMessage?.content) {
        const content = firstUserMessage.content;
        if (content.includes('my name is') && content.includes('email is')) {
          userInfo = content;
        }
      }

      // Add case summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Case Summary', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (userInfo) {
        const wrappedInfo = wrapText(`Client Information: ${userInfo}`, pageWidth - 2 * margin);
        doc.text(wrappedInfo, margin, yPosition);
        yPosition += wrappedInfo.length * 5 + 5;
      }

      // Generate case summary from conversation
      const conversationText = messages.map(msg => 
        `${msg.role === 'user' ? 'Client' : 'Assistant'}: ${msg.content}`
      ).join(' ').slice(0, 500);

      const summaryText = `This conversation involved legal assistance regarding immigration matters. The client engaged with the AI legal assistant to discuss their case and receive guidance on immigration law procedures.`;
      const wrappedSummary = wrapText(summaryText, pageWidth - 2 * margin);
      doc.text(wrappedSummary, margin, yPosition);
      yPosition += wrappedSummary.length * 5 + 15;

      // Add conversation section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      checkNewPage(20);
      doc.text('Conversation History', margin, yPosition);
      yPosition += 10;

      // Add each message
      messages.forEach((msg, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        const role = msg.role === 'user' ? 'Client' : 'Legal Assistant';
        const timestamp = new Date(msg.createdAt || Date.now()).toLocaleString();
        
        checkNewPage(15);
        doc.text(`${role} (${timestamp}):`, margin, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        const wrappedContent = wrapText(msg.content, pageWidth - 2 * margin - 5);
        
        checkNewPage(wrappedContent.length * 5 + 10);
        doc.text(wrappedContent, margin + 5, yPosition);
        yPosition += wrappedContent.length * 5 + 10;
        
        // Add separator line between messages
        if (index < messages.length - 1) {
          checkNewPage(5);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
        }
      });

      // Add footer on each page
      const totalPages = (doc as any).internal.pages.length - 1; // jsPDF API
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        doc.text('LinkToLawyers - Legal Assistant Report', margin, pageHeight - 10);
      }

      // Generate filename with timestamp
      const filename = `Legal_Conversation_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!conversationId || !messages.length) {
      toast({
        title: "Cannot Send Email",
        description: "No conversation data available to send.",
        variant: "destructive",
      });
      return;
    }

    // Extract user information from the first intake message
    const intakeMessage = messages.find(msg => 
      msg.role === 'user' && 
      msg.content.includes('Hello, my name is') && 
      msg.content.includes('I need help with')
    );

    if (!intakeMessage) {
      toast({
        title: "Cannot Send Email",
        description: "Unable to find user information in conversation.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send email with conversation data
      const response = await fetch('/api/chat/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          intakeMessage: intakeMessage.content
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Email Sent Successfully! 📧",
          description: `Confirmation email sent to ${result.recipientEmail}${result.requestNumber ? ` with tracking link for ${result.requestNumber}` : ''}.`,
          duration: 6000,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Email Failed",
          description: error.error || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Failed",
        description: "Network error while sending email",
        variant: "destructive",
      });
    }
  };

  const handleSendTemplate = () => {
    // TODO: Implement send template functionality
    console.log("Send Template clicked");
    toast({
      title: "Send Template",
      description: "Template functionality coming soon!",
    });
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
                disabled={isExportingPDF || !messages.length}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-1" />
                )}
                {isExportingPDF ? "Generating..." : "Export PDF"}
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
                onClick={() => handleSendTemplate()}
                className="text-gray-600 hover:text-gray-800"
              >
                <File className="w-4 h-4 mr-1" />
                Send Template
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