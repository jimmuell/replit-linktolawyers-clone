import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the active chatbot prompt
  const { data: activePrompt, isLoading: isLoadingPrompt } = useQuery<{ prompt: string; name: string }>({
    queryKey: ['/api/chatbot-prompts/active'],
    enabled: isOpen,
  });

  // Initialize messages when component opens or prompt loads
  useEffect(() => {
    if (isOpen && activePrompt && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: 'Hello! I\'m your legal assistant. I can help you understand immigration law, guide you through our services, or answer questions about your legal needs. How can I help you today?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, activePrompt, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response from OpenAI
      const response = await getBotResponse(userMessage.content);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment, or feel free to submit a detailed request through our platform for attorney assistance.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = async (userInput: string): Promise<string> => {
    try {
      // Create the conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add the current user message
      conversationHistory.push({
        role: 'user',
        content: userInput
      });

      // Use the active prompt as system message, or fallback
      const systemPrompt = activePrompt?.prompt || 
        'You are a helpful legal assistant chatbot for LinkToLawyers. Help users understand immigration law, guide them through services, and answer questions about legal needs. Be professional and helpful.';

      // Call the backend API to get OpenAI response
      const result = await apiRequest('/api/chatbot/response', { 
        method: 'POST', 
        body: { 
          messages: conversationHistory,
          systemPrompt: systemPrompt
        }
      });

      return result.response || 'I apologize, but I\'m having trouble responding right now. Please try again.';
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 bg-white">
                <AvatarFallback className="text-primary">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="text-white">Legal Assistant</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-primary-foreground/80 text-sm">
            Online • Ready to help with legal questions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className={message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-muted">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-2 bg-muted">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="rounded-full px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is a demo bot. For real legal advice, please consult with qualified attorneys.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}