
import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
    isOn: boolean;
    onToggle: () => void;
    label?: string;
    description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, label, description }) => {
    return (
        <div className={`flex justify-between gap-3 pointer-events-auto cursor-pointer ${description ? 'items-start' : 'items-center'}`} onClick={onToggle}>
            {(label || description) && (
                <div className="min-w-0 flex-1">
                    {label && <div className="font-medium text-slate-900 dark:text-white">{label}</div>}
                    {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>}
                </div>
            )}
            <div
                className={`w-11 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors duration-300 ${description ? 'mt-0.5' : ''} ${isOn ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
            >
                <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </div>
        </div>
    );
};

export default ToggleSwitch;
