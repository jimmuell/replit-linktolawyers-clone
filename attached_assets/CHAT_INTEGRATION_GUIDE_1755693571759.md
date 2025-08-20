# Chat Interface Integration Guide

This guide provides step-by-step instructions for integrating the AI chat interface from the LinkToLawyers Immigration Assistant into another Replit application.

## Prerequisites

- Node.js application with TypeScript support
- PostgreSQL database (or ability to use in-memory storage)
- OpenAI API key

## Required Dependencies

Install these packages in your target application:

```bash
npm install openai drizzle-orm drizzle-zod zod @neondatabase/serverless
```

For the frontend components:
```bash
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-textarea @radix-ui/react-toast lucide-react class-variance-authority clsx tailwind-merge
```

## Backend Integration

### 1. OpenAI Service Setup

Create `server/services/openai.ts`:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key-here"
});

interface ChatCompletionOptions {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  stream?: boolean;
}

export async function getChatCompletion(options: ChatCompletionOptions) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: options.messages,
      stream: options.stream || false,
      max_tokens: 2000,
      temperature: 0.7,
    });
    return response;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}

export async function getStreamingChatCompletion(options: ChatCompletionOptions) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: options.messages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    });
    return stream;
  } catch (error) {
    console.error("OpenAI API streaming error:", error);
    throw new Error("Failed to get streaming AI response: " + (error as Error).message);
  }
}
```

### 2. Database Schema

Create `shared/schema.ts`:

```typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// Export types and schemas
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);
export const insertPromptSchema = createInsertSchema(prompts);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof insertConversationSchema._type;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof insertMessageSchema._type;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = typeof insertPromptSchema._type;
```

### 3. Storage Layer

Create `server/storage.ts`:

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { conversations, messages, prompts, type Conversation, type InsertConversation, type Message, type InsertMessage, type Prompt, type InsertPrompt } from "@shared/schema";

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage {
  async initializeStorage() {
    try {
      // Create default prompt if none exists
      const existingPrompts = await db.select().from(prompts).limit(1);
      if (existingPrompts.length === 0) {
        await db.insert(prompts).values({
          name: "Default Assistant",
          content: `You are a helpful AI assistant. Provide clear, accurate, and professional responses to user questions.

Guidelines:
- Be helpful and informative
- Provide clear explanations
- Ask for clarification when needed
- Be concise but thorough
- Maintain a professional tone`,
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error initializing storage:", error);
    }
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Prompts
  async getActivePrompt(): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.isActive, true));
    return prompt || undefined;
  }

  async setActivePrompt(id: string): Promise<boolean> {
    // First, deactivate all prompts
    await db.update(prompts).set({ isActive: false });
    
    // Then activate the specified prompt
    const [updatedPrompt] = await db
      .update(prompts)
      .set({ isActive: true })
      .where(eq(prompts.id, id))
      .returning();
    
    return !!updatedPrompt;
  }
}

export const storage = new DatabaseStorage();
```

### 4. API Routes

Add these routes to your Express app:

```typescript
import { getChatCompletion, getStreamingChatCompletion } from "./services/openai";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";

// Helper function to build system prompt with current date context
async function buildSystemPromptWithDate(): Promise<string> {
  const activePrompt = await storage.getActivePrompt();
  const baseSystemPrompt = activePrompt?.content || "You are a helpful AI assistant.";
  
  // Add current date context to system prompt
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `${baseSystemPrompt}

IMPORTANT CONTEXT: Today's date is ${dateString} (${currentDate.toISOString().split('T')[0]}). Use this as your reference for any date-related questions or calculations.`;
}

// Conversations
app.get("/api/conversations", async (req, res) => {
  try {
    const conversations = await storage.getConversations();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const validatedData = insertConversationSchema.parse(req.body);
    const conversation = await storage.createConversation(validatedData);
    res.json(conversation);
  } catch (error) {
    res.status(400).json({ message: "Invalid conversation data" });
  }
});

// Messages
app.get("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    const messages = await storage.getMessagesByConversationId(req.params.conversationId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

app.post("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    const validatedData = insertMessageSchema.parse({
      ...req.body,
      conversationId: req.params.conversationId,
    });
    const message = await storage.createMessage(validatedData);
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: "Invalid message data" });
  }
});

// Streaming chat completion
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Get conversation messages
    const messages = await storage.getMessagesByConversationId(conversationId);
    
    // Get system prompt with current date context
    const systemPrompt = await buildSystemPromptWithDate();

    // Build OpenAI messages array
    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ];

    // Get streaming response
    const stream = await getStreamingChatCompletion({ messages: openaiMessages });
    
    let fullResponse = "";
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }

    res.end();

    // Save complete AI response as message
    if (fullResponse.trim()) {
      await storage.createMessage({
        conversationId,
        content: fullResponse,
        role: "assistant"
      });

      // Update conversation timestamp
      await storage.updateConversation(conversationId, { updatedAt: new Date() });
    }

  } catch (error) {
    console.error("Streaming chat error:", error);
    res.status(500).json({ message: "Failed to get streaming AI response" });
  }
});
```

## Frontend Integration

### 1. Chat Hook

Create `hooks/use-chat.ts`:

```typescript
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, Conversation } from "@shared/schema";

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
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, role: "user" }),
      });
      
      if (!response.ok) throw new Error("Failed to send message");
      
      // Stream AI response
      const streamResponse = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
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
        }
      }
    },
    onError: () => {
      setIsTyping(false);
      setStreamingMessage("");
    }
  });

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Conversation" }),
    });
    
    if (!response.ok) throw new Error("Failed to create conversation");
    
    const conversation = await response.json();
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
```

### 2. Basic Chat Interface Component

Create `components/chat-interface.tsx`:

```typescript
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
}

export default function ChatInterface({ conversationId, onConversationChange }: ChatInterfaceProps) {
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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3/4 p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-3/4 p-3 rounded-lg bg-gray-100 text-gray-800">
              <p className="whitespace-pre-wrap">{streamingMessage}</p>
              <div className="w-2 h-4 bg-gray-500 animate-pulse inline-block ml-1"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-12 max-h-32"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="h-12"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Environment Variables

Add these to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (if using PostgreSQL)
DATABASE_URL=your_postgresql_connection_string_here
```

## Customizing the AI Prompt

To customize the AI behavior, you can either:

1. **Modify the default prompt** in the storage initialization
2. **Add a prompt management system** to allow dynamic prompt updates
3. **Use environment variables** for the system prompt

### Example Custom Immigration Law Prompt:

```typescript
const immigrationPrompt = `You are an expert immigration law assistant for LinkToLawyers. Your role is to provide helpful, accurate, and professional guidance on immigration matters including visas, green cards, citizenship, family immigration, work authorization, and related legal processes.

Guidelines:
- Provide clear, accurate information about immigration law and procedures
- Always remind users that this is general information and not legal advice
- Suggest consulting with a qualified immigration attorney for specific cases
- Be empathetic and understanding of the stress immigration processes can cause
- Use professional but accessible language
- When uncertain, clearly state limitations and recommend professional consultation
- Focus on U.S. immigration law unless otherwise specified
- Provide step-by-step guidance when appropriate
- Include relevant timelines and requirements when known

Remember: You are providing educational information to help users understand immigration processes, but you cannot provide specific legal advice or represent clients.`;
```

## Database Migration

If using PostgreSQL, run these SQL commands to create the tables:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create prompts table
CREATE TABLE prompts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default prompt
INSERT INTO prompts (name, content, is_active) VALUES (
  'Default Assistant',
  'You are a helpful AI assistant. Provide clear, accurate, and professional responses to user questions.',
  TRUE
);
```

## Next Steps

1. **Install dependencies** in your target application
2. **Set up environment variables** with your OpenAI API key
3. **Configure database** (PostgreSQL recommended, or modify storage for in-memory)
4. **Copy and adapt the code** files to your project structure
5. **Initialize storage** by calling `storage.initializeStorage()` on app startup
6. **Add the routes** to your Express server
7. **Integrate the chat interface** component into your frontend

## Optional Enhancements

- Add user authentication and conversation ownership
- Implement conversation persistence and history
- Add file upload capabilities
- Include conversation export features
- Add typing indicators and message status
- Implement conversation search and filtering

This integration provides a complete AI chat interface with streaming responses, conversation management, and customizable AI prompts.