import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, Conversation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useChat(conversationId: string | null) {
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch messages for the current conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      if (!conversationId) throw new Error("No conversation ID");
      
      // Save user message first
      await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content: message, role: "user" }
      });
      
      // Stream AI response
      const sessionId = localStorage.getItem('sessionId');
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (sessionId) {
        headers["Authorization"] = `Bearer ${sessionId}`;
      }

      const streamResponse = await fetch("/api/chat/stream", {
        method: "POST",
        headers,
        body: JSON.stringify({ conversationId, message }),
        credentials: "include",
      });

      if (!streamResponse.ok) throw new Error("Failed to get AI response");
      
      return streamResponse;
    },
    onMutate: () => {
      setIsTyping(true);
      setStreamingMessage("");
    },
    onSuccess: async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            setStreamingMessage(prev => prev + chunk);
          }
        } finally {
          reader.releaseLock();
          setIsTyping(false);
          setStreamingMessage("");
          
          // Refresh messages after streaming is complete
          queryClient.invalidateQueries({ 
            queryKey: ["/api/conversations", conversationId, "messages"] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ["/api/conversations"] 
          });
        }
      }
    },
    onError: () => {
      setIsTyping(false);
      setStreamingMessage("");
    }
  });

  // Create new conversation
  const createNewConversation = useCallback(async (): Promise<string> => {
    const response = await apiRequest("/api/conversations", {
      method: "POST",
      body: { title: "New Conversation" }
    });
    
    const conversation = await response.json() as Conversation;
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    return conversation.id;
  }, [queryClient]);

  const sendMessage = useCallback((message: string) => {
    sendMessageMutation.mutate({ message });
  }, [sendMessageMutation]);

  return {
    messages,
    isLoading,
    sendMessage,
    createNewConversation,
    isTyping,
    streamingMessage,
  };
}