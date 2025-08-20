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

    // Simulate bot response with a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(userMessage.content),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // If we have an active prompt, use it as context for responses
    if (activePrompt) {
      // Simple rule-based responses that work with the prompt context
      if (input.includes('immigration') || input.includes('visa') || input.includes('green card')) {
        return 'I can help with various immigration matters including family-based visas, employment visas, naturalization, and more. Would you like me to connect you with qualified immigration attorneys in your area?';
      }
      
      if (input.includes('cost') || input.includes('price') || input.includes('fee')) {
        return 'Legal fees vary depending on your case type and complexity. Our platform allows you to compare quotes from multiple attorneys to find the best fit for your budget. Would you like to submit a request to get quotes?';
      }
      
      if (input.includes('attorney') || input.includes('lawyer')) {
        return 'Our network includes verified immigration attorneys across the United States. I can help you find attorneys based on your location and case type. What type of legal assistance do you need?';
      }
      
      if (input.includes('how it works') || input.includes('process')) {
        return 'Here\'s how it works: 1) Submit your legal request with case details, 2) We match you with qualified attorneys, 3) Receive and compare quotes, 4) Choose the attorney that\'s right for you. The process typically takes 24-48 hours.';
      }
      
      if (input.includes('hello') || input.includes('hi') || input.includes('help')) {
        return 'Hello! I\'m here to help with your legal questions. I can assist with information about immigration services, connecting with attorneys, understanding our process, or answering general legal questions. What would you like to know?';
      }
      
      return 'Thank you for your question. I\'d be happy to help you find the right attorney for your specific situation. You can submit a detailed request on our platform, and we\'ll connect you with qualified legal professionals. Is there anything specific about your case you\'d like to discuss?';
    }
    
    // Fallback if no active prompt is available
    return 'I\'m here to help with your legal questions. Please feel free to ask about our services or legal assistance needs.';
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