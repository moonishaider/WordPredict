import React from 'react';
import { motion } from 'framer-motion';

interface LeftPanelProps {
    chatHistory: string[];
    onNewChat: () => void;
    onSelectChat: (index: number) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ chatHistory, onNewChat, onSelectChat }) => {
    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1/4 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewChat}
                className="mb-6 w-full bg-blue-500 text-white py-3 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-600"
            >
                New Chat
            </motion.button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Chat History</h2>
            <ul className="space-y-2">
                {chatHistory.map((chat, index) => (
                    <motion.li
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectChat(index)}
                        className="cursor-pointer p-3 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    >
                        Chat {index + 1}
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default LeftPanel;