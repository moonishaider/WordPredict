'use client'

import { useState } from 'react';
import axios from 'axios';
import LeftPanel from './components/LeftPanel';
import ChatConversations from './components/ChatConversations';
import InputArea from './components/InputArea';
import RightPanel from './components/RightPanel';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Home() {
  const [seedText, setSeedText] = useState('');
  const [nextWords, setNextWords] = useState(8);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [currentChat, setCurrentChat] = useState<number | null>(null);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChat(chatHistory.length);
    setChatHistory([...chatHistory, `Chat ${chatHistory.length + 1}`]);
  };

  const handleSelectChat = (index: number) => {
    setCurrentChat(index);
    // Load messages for the selected chat if stored separately
    // For simplicity, resetting messages
    setMessages([]);
  };

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setMessages([...messages, { sender: 'user', text: prompt }]);

    try {
      const response = await axios.post('http://localhost:8000/generate_text', {
        seed_text: prompt,
        next_words: nextWords,
      });
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.generated_text }]);
    } catch (error) {
      console.error('Error generating text:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'An error occurred while generating text.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side Panel */}
      <LeftPanel
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Center - Chat Conversations */}
      <div className="flex flex-col flex-1">
        <ChatConversations messages={messages} />
        <InputArea onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Right Side Panel */}
      <RightPanel
        nextWords={nextWords}
        setNextWords={setNextWords}
      />
    </div>
  );
}