'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendChatMessage, getChatHistory } from '@/lib/api/chat';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const NourishBot = ({ username }: { username: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  // Fetch chat history using TanStack Query
  const { data: chatHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['chatHistory', username],
    queryFn: () => getChatHistory(username),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Convert chat history to messages format using useMemo
  const historicalMessages = useMemo(() => {
    if (chatHistory?.chats && chatHistory.chats.length > 0) {
      return chatHistory.chats.flatMap((chat, index) => [
        {
          id: `user-${index}`,
          text: chat.message,
          sender: 'user' as const,
          timestamp: new Date(chat.createdAt),
        },
        {
          id: `bot-${index}`,
          text: chat.reply,
          sender: 'bot' as const,
          timestamp: new Date(chat.createdAt),
        },
      ]);
    } else if (chatHistory && chatHistory.chats.length === 0) {
      // No history, show welcome message
      return [{
        id: 'welcome',
        text: "Hello! 👋 I'm NourishBot, your food waste reduction assistant. How can I help you today?",
        sender: 'bot' as const,
        timestamp: new Date(),
      }];
    }
    return [];
  }, [chatHistory]);

  // Combine historical and new messages
  const messages = useMemo(() => {
    return [...historicalMessages, ...newMessages];
  }, [historicalMessages, newMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      // Invalidate and refetch chat history to get updated history from backend
      queryClient.invalidateQueries({ queryKey: ['chatHistory', username] });
      // Clear new messages as they're now in the backend history
      setTimeout(() => setNewMessages([]), 500);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorText = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ ${errorText}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setNewMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;

    const messageToSend = inputValue.trim();

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setNewMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Send message using mutation
    sendMessageMutation.mutate({
      username,
      message: messageToSend,
    });
  }, [inputValue, username, sendMessageMutation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-r from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Open NourishBot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-orange-200/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">NourishBot</h3>
                <p className="text-xs text-orange-100">Food Waste Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-orange-50/30 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="wrap-break-word whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-xs ${msg.sender === 'user' ? 'text-orange-100' : 'text-gray-500'} block mt-1`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loadingHistory && messages.length === 0 && (
              <div className="flex justify-center">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                  Loading chat history...
                </div>
              </div>
            )}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about food waste..."
                disabled={sendMessageMutation.isPending}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !inputValue.trim()}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NourishBot;
