import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, ShieldCheck, Database, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const [cleared, setCleared] = useState(false);

    const handleClearData = () => {
        if (confirm("Are you sure you want to clear all your local study data? This cannot be undone.")) {
            localStorage.clear();
            setCleared(true);
            setTimeout(() => setCleared(false), 3000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-[#1A1D27] p-3 rounded-2xl border border-white/5">
                    <SettingsIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Settings</h2>
                    <p className="text-gray-400">Manage your study preferences and local data.</p>
                </div>
            </div>

            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1A1D27] p-6 md:p-8 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <Layout className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">Appearance</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#13151D] rounded-xl border border-white/5">
                        <div>
                            <div className="font-semibold text-white">Dark Theme</div>
                            <div className="text-sm text-gray-400">Currently locked to Premium Dark Mode</div>
                        </div>
                        <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Active</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1A1D27] p-6 md:p-8 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <Database className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Data Management</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        Your study decks and progress are stored entirely locally in your browser to protect your privacy. Clearing your data will permanently delete all your decks.
                    </p>
                    
                    <button 
                        onClick={handleClearData}
                        className="flex items-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-6 py-3 rounded-xl font-medium transition-colors border border-rose-500/20"
                    >
                        <Trash2 className="w-4 h-4" /> Clear Local Study Data
                    </button>
                    {cleared && <p className="text-emerald-400 text-sm mt-4">Local data cleared successfully.</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1A1D27] p-6 md:p-8 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-xl font-bold text-white">About AI Study Buddy</h3>
                    </div>
                    <div className="text-sm text-gray-400 space-y-4 leading-relaxed">
                        <p>Version 1.0 (Hackathon MVP)</p>
                        <p>Built with React, Tailwind CSS, FastAPI, and Google Gemini.</p>
                        <p>This application was designed to convert passive rereading into active recall, leveraging generative AI to build high-value spaced repetition flashcards from your academic notes.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
