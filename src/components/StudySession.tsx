import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Flashcard, Deck } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, AlertCircle, Download, FileText, ChevronRight, BrainCircuit, Lightbulb, BookOpen, Layers, UploadCloud } from 'lucide-react';

interface Props {
    content: string;
    title?: string;
    deckId?: string;
}

export default function StudySession({ content, title = "Study Session", deckId }: Props) {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentDeckId, setCurrentDeckId] = useState<string | null>(deckId || null);
    
    // Study queue state
    const [unseen, setUnseen] = useState<Flashcard[]>([]);
    const [needsReview, setNeedsReview] = useState<Flashcard[]>([]);
    const [mastered, setMastered] = useState<Flashcard[]>([]);
    
    const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
    const [flipped, setFlipped] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({ correct: 0, review: 0, attempted: 0 });

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        if (deckId) {
            // Load existing deck
            const stored = JSON.parse(localStorage.getItem('study_decks') || '[]');
            const deck = stored.find((d: Deck) => d.id === deckId);
            if (deck) {
                setFlashcards(deck.cards);
                setUnseen(deck.cards.slice(1));
                setCurrentCard(deck.cards[0] || null);
                // Optionally could load previous stats, but starting fresh session is standard active recall
                setLoading(false);
            } else {
                setErrorMsg("Deck not found.");
                setLoading(false);
            }
            return;
        }

        const interval = setInterval(() => {
            setLoadingStep(prev => prev < 4 ? prev + 1 : prev);
        }, 4000);

        const generate = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/flashcards/generate`, { content, num_cards: 15 });
                if (res.data.success) {
                    const cards = res.data.data.flashcards;
                    setFlashcards(cards);
                    setUnseen(cards);
                    setCurrentCard(cards[0] || null);
                    setUnseen(cards.slice(1));
                    setLoadingStep(4);
                    
                    // Save to local storage
                    const newDeck: Deck = {
                        id: 'deck_' + Date.now(),
                        title: title,
                        cards: cards,
                        stats: { correct: 0, review: 0, attempted: 0 },
                        createdAt: new Date().toISOString(),
                        lastStudied: new Date().toISOString()
                    };
                    const stored = JSON.parse(localStorage.getItem('study_decks') || '[]');
                    localStorage.setItem('study_decks', JSON.stringify([newDeck, ...stored]));
                    setCurrentDeckId(newDeck.id);
                } else {
                    setErrorMsg(res.data.error?.message || "Failed to generate flashcards.");
                }
            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.response?.data?.error?.message || err.message || "Network error while generating flashcards.");
            } finally {
                setTimeout(() => {
                    clearInterval(interval);
                    setLoading(false);
                }, 1000);
            }
        };
        generate();
        return () => clearInterval(interval);
    }, [content, deckId, title]);

    // Update stats in local storage when session ends
    useEffect(() => {
        if (!currentCard && stats.attempted > 0 && currentDeckId) {
            const stored = JSON.parse(localStorage.getItem('study_decks') || '[]');
            const updated = stored.map((d: Deck) => {
                if (d.id === currentDeckId) {
                    return {
                        ...d,
                        stats: {
                            correct: d.stats.correct + stats.correct,
                            review: d.stats.review + stats.review,
                            attempted: d.stats.attempted + stats.attempted
                        },
                        lastStudied: new Date().toISOString()
                    };
                }
                return d;
            });
            localStorage.setItem('study_decks', JSON.stringify(updated));
        }
    }, [currentCard, stats, currentDeckId]);

    const handleExportAnki = async () => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/export/anki`, { flashcards }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'study_buddy_anki.csv');
        document.body.appendChild(link);
        link.click();
    };

    const handleExportPDF = async () => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/export/pdf`, { flashcards }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'study_sheet.pdf');
        document.body.appendChild(link);
        link.click();
    };

    if (loading) {
        const steps = [
            { icon: <UploadCloud className="w-5 h-5"/>, text: "Uploading Document..." },
            { icon: <BookOpen className="w-5 h-5"/>, text: "Extracting Content..." },
            { icon: <BrainCircuit className="w-5 h-5"/>, text: "Understanding Concepts..." },
            { icon: <Lightbulb className="w-5 h-5"/>, text: "Generating Flashcards..." },
            { icon: <CheckCircle2 className="w-5 h-5"/>, text: "Ready!" }
        ];

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 pt-10">
                <div className="relative w-32 h-32 mb-16">
                    <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-white/5"
                    />
                    <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                        {steps[loadingStep].icon}
                    </div>
                </div>
                
                <div className="w-full space-y-3 bg-[#13151D] border border-white/5 p-6 rounded-3xl">
                    {steps.map((step, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: idx <= loadingStep ? 1 : 0.2, x: 0 }}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-500 ${idx === loadingStep ? 'bg-indigo-500/10 text-indigo-300' : 'text-gray-500'}`}
                        >
                            <div className={idx < loadingStep ? "text-emerald-500" : ""}>
                                {idx < loadingStep ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                            </div>
                            <span className={`font-medium text-sm ${idx === loadingStep ? 'text-indigo-200' : ''}`}>{step.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="text-center py-20 max-w-lg mx-auto px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 text-red-400 p-10 rounded-3xl border border-red-500/20">
                    <AlertCircle className="w-14 h-14 mx-auto mb-6 text-red-500" />
                    <h3 className="font-bold text-2xl mb-3 text-white">Generation Failed</h3>
                    <p className="text-red-300/80 mb-8 leading-relaxed">{errorMsg}</p>
                    <button onClick={() => window.location.hash=''} className="bg-red-500/20 text-red-300 font-semibold px-8 py-3 rounded-xl hover:bg-red-500/30 transition-colors">
                        Go Back
                    </button>
                </motion.div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-20 max-w-lg mx-auto px-4">
                <div className="bg-[#13151D] p-12 rounded-3xl border border-white/5 flex flex-col items-center">
                    <Layers className="w-16 h-16 text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">No Cards Found</h3>
                    <p className="text-gray-400 mb-8">We couldn't extract enough valid study material from that document.</p>
                    <button onClick={() => window.location.hash=''} className="bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const answerCard = (correct: boolean) => {
        if (!currentCard) return;

        setStats(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            review: prev.review + (correct ? 0 : 1),
            attempted: prev.attempted + 1
        }));
        
        let newNeedsReview = [...needsReview];
        let newMastered = [...mastered];
        
        if (correct) {
            newMastered.push(currentCard);
        } else {
            newNeedsReview.push(currentCard);
        }

        setFlipped(false);

        if (newNeedsReview.length > 0) {
            const next = newNeedsReview.shift()!;
            setNeedsReview(newNeedsReview);
            setMastered(newMastered);
            setCurrentCard(next);
        } else if (unseen.length > 0) {
            const next = unseen[0];
            setUnseen(unseen.slice(1));
            setNeedsReview(newNeedsReview);
            setMastered(newMastered);
            setCurrentCard(next);
        } else {
            setNeedsReview(newNeedsReview);
            setMastered(newMastered);
            setCurrentCard(null);
        }
    };

    if (!currentCard) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A1D27] p-10 md:p-14 rounded-[2rem] shadow-2xl text-center max-w-3xl mx-auto mt-10 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/20 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white mb-4">Study Session Complete!</h2>
                    <p className="text-lg text-gray-400 mb-12">You've successfully reviewed all your flashcards.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        <div className="bg-[#13151D] p-8 rounded-[1.5rem] border border-white/5">
                            <div className="text-5xl font-black text-white mb-2">{stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0}%</div>
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overall Mastery</div>
                        </div>
                        <div className="bg-[#13151D] p-8 rounded-[1.5rem] border border-white/5 flex flex-col justify-center gap-4">
                            <div className="flex items-center justify-between text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-xl">
                                <span>Got Right</span>
                                <span className="font-bold text-xl">{stats.correct}</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-xl">
                                <span>Needs Review</span>
                                <span className="font-bold text-xl">{stats.review}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleExportAnki} className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95">
                            <Download className="w-5 h-5" /> Export Anki CSV
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center justify-center gap-3 bg-[#13151D] text-gray-300 border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors active:scale-95">
                            <FileText className="w-5 h-5" /> Printable PDF
                        </button>
                        <button onClick={() => window.location.hash='decks'} className="flex items-center justify-center gap-3 bg-[#1A1D27] text-indigo-400 border border-indigo-500/30 px-8 py-4 rounded-xl font-bold hover:bg-indigo-500/10 transition-colors active:scale-95">
                            <Layers className="w-5 h-5" /> Back to Decks
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const totalCardsLeft = unseen.length + needsReview.length + 1;
    const progressPercent = (stats.attempted / (stats.attempted + totalCardsLeft)) * 100;

    return (
        <div className="max-w-4xl mx-auto mt-6 px-4 mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-500/10 blur-[150px] pointer-events-none rounded-full" />
            
            {/* Progress Header */}
            <div className="mb-10 relative z-10">
                <div className="flex justify-between items-end mb-3">
                    <span className="font-bold text-white text-lg">Card {stats.attempted + 1}</span>
                    <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0}% Mastery</span>
                </div>
                <div className="h-2.5 w-full bg-[#1A1D27] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="flex justify-between mt-4 text-sm font-medium text-gray-400">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> {stats.correct} Correct</span>
                    <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-rose-500"/> {needsReview.length} queued for review</span>
                </div>
            </div>

            {/* Flashcard Container */}
            <div style={{ perspective: 2000 }} className="relative z-10">
                <motion.div 
                    className="relative w-full min-h-[500px] cursor-pointer"
                    animate={{ rotateX: flipped ? 180 : 0 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 25 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    onClick={() => !flipped && setFlipped(true)}
                >
                    {/* Front */}
                    <div className="absolute inset-0 bg-[#1A1D27] rounded-[2rem] shadow-2xl border border-white/10 p-8 md:p-14 flex flex-col items-center justify-center group" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="absolute top-8 w-full px-8 md:px-12 flex justify-between items-center">
                            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">{currentCard.topic}</span>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#13151D] px-4 py-2 rounded-xl border border-white/5 shadow-inner">{currentCard.difficulty}</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-5xl font-bold text-center text-white leading-tight mt-10 md:px-10">{currentCard.question}</h3>
                        
                        <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-semibold text-indigo-400 tracking-wide uppercase">Click to reveal</span>
                            <ChevronRight className="w-6 h-6 text-indigo-500 rotate-90" />
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-[#1A1D27] rounded-[2rem] shadow-2xl border border-white/10 p-8 md:p-12 flex flex-col" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar flex flex-col justify-center pb-6">
                            <div className="mb-8">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Answer</span>
                                <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">{currentCard.answer}</p>
                            </div>
                            
                            <div className="bg-[#13151D] p-6 rounded-2xl border border-white/5">
                                <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    <Lightbulb className="w-4 h-4 text-amber-500" /> Explanation
                                </span>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed">{currentCard.explanation}</p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-4 pt-6 border-t border-white/5 shrink-0">
                            <button 
                                onClick={(e) => { e.stopPropagation(); answerCard(false); }} 
                                className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 py-4 md:py-5 rounded-2xl font-bold transition-all active:scale-95 text-lg"
                            >
                                <RotateCcw className="w-5 h-5" /> Needs Review
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); answerCard(true); }} 
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-4 md:py-5 rounded-2xl font-bold transition-all active:scale-95 text-lg"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Got It Right
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
