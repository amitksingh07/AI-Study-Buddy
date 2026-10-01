import { useState, useEffect } from 'react';
import { UserCircle, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [goal, setGoal] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const profile = JSON.parse(localStorage.getItem('study_profile') || '{}');
            setName(profile.name || '');
            setCollege(profile.college || '');
            setGoal(profile.goal || '');
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('study_profile', JSON.stringify({ name, college, goal }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#1A1D27] w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#13151D]">
                        <div className="flex items-center gap-3">
                            <UserCircle className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-xl font-bold text-white">Student Profile</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Display Name</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g. Alex"
                                className="w-full bg-[#13151D] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">College / Role</label>
                            <input 
                                type="text"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                placeholder="E.g. Computer Science Major"
                                className="w-full bg-[#13151D] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Current Study Goal</label>
                            <input 
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="E.g. Ace finals"
                                className="w-full bg-[#13151D] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-400">{saved ? 'Profile saved!' : ''}</span>
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
