import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RightPanelProps {
    nextWords: number;
    setNextWords: (value: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ nextWords, setNextWords }) => {
    const [sliderValue, setSliderValue] = useState(nextWords);

    useEffect(() => {
        setSliderValue(nextWords);
    }, [nextWords]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSliderValue(value);
        setNextWords(value);
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1/4 border-l border-gray-200 bg-gray-50 p-6"
        >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
            <div className="mb-4">
                <label htmlFor="nextWords" className="block mb-2 text-sm font-medium text-gray-700">
                    Number of Words to Generate: {sliderValue}
                </label>
                <div className="relative pt-1">
                    <input
                        type="range"
                        id="nextWords"
                        min="3"
                        max="15"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600 px-2 mt-2">
                        <span>3</span>
                        <span>9</span>
                        <span>15</span>
                    </div>
                </div>
            </div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                className="text-center mt-4 p-3 bg-blue-100 rounded-lg"
            >
                <span className="text-blue-800 font-semibold text-lg">
                    {sliderValue} words
                </span>
            </motion.div>
        </motion.div>
    );
};

export default RightPanel;
