import { useState, useEffect } from 'react';
import { Deck } from '../types';
import { BookOpen, Trash2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyDecks() {
    const [decks, setDecks] = useState<Deck[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('study_decks');
        if (stored) {
            setDecks(JSON.parse(stored));
        }
    }, []);

    const deleteDeck = (id: string) => {
        const updated = decks.filter(d => d.id !== id);
        setDecks(updated);
        localStorage.setItem('study_decks', JSON.stringify(updated));
    };

    if (decks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-[#13151D] border border-white/5 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
                    <Layers className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">No study decks yet</h2>
                <p className="text-gray-400 mb-8 max-w-sm">Generate your first active-recall deck from your lecture notes to start studying.</p>
                <button onClick={() => window.location.hash = '#'} className="bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors">
                    Create Flashcards
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-8">My Decks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={deck.id} className="bg-[#1A1D27] border border-white/5 p-6 rounded-[2rem] relative group hover:border-indigo-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <button onClick={() => deleteDeck(deck.id)} className="text-gray-500 hover:text-red-400 bg-[#13151D] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 truncate" title={deck.title}>{deck.title}</h3>
                        <p className="text-sm text-gray-400 mb-6">{deck.cards.length} cards • Last studied {new Date(deck.lastStudied).toLocaleDateString()}</p>
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mastery</div>
                            <div className="text-lg font-bold text-emerald-400">
                                {deck.stats.attempted ? Math.round((deck.stats.correct / deck.stats.attempted) * 100) : 0}%
                            </div>
                        </div>

                        <button onClick={() => window.location.hash = `#study?deck=${deck.id}`} className="w-full bg-[#13151D] border border-white/5 text-white font-medium py-3 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                            Continue Study
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
