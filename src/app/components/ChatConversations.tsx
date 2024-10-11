import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatConversationsProps {
    messages: { sender: string; text: string }[];
}

const ChatConversations: React.FC<ChatConversationsProps> = ({ messages }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
            <AnimatePresence>
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <span
                            className={`inline-block px-4 py-2 rounded-lg shadow-md ${msg.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-800'
                                }`}
                        >
                            {msg.text}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatConversations;
