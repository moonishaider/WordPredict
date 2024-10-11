import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputAreaProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSubmit(prompt);
            setPrompt('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your prompt..."
                    required
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-3 rounded-r-lg transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </motion.button>
            </div>
        </form>
    );
};

export default InputArea;
