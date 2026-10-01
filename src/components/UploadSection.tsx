import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, File, X, AlertCircle, Sparkles, Edit3 } from 'lucide-react';

interface Props {
    onExtracted: (content: string, title: string) => void;
}

export default function UploadSection({ onExtracted }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isPasting, setIsPasting] = useState(false);
    const [pastedText, setPastedText] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.txt')) {
            setError('Please upload a PDF, DOCX, or TXT file.');
            return;
        }
        setFile(selectedFile);
        setError('');
        setIsPasting(false);
    };

    const handleUpload = async () => {
        if (!file && !isPasting) return;
        
        if (isPasting) {
            if (!pastedText.trim()) {
                setError('Please paste some text first.');
                return;
            }
            onExtracted(pastedText, "Pasted Notes");
            return;
        }

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file!);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://ai-study-buddy-backend-omega.vercel.app')}/api/documents/upload`, formData);
            if (res.data.success) {
                onExtracted(res.data.data.content, file!.name);
            } else {
                setError(res.data.error.message);
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto pt-10 px-4">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6">
                    <Sparkles className="w-4 h-4" /> AI-Powered Active Recall
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                    Turn your notes into <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">smarter study sessions.</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                    Upload lecture notes and let AI turn them into high-value active-recall flashcards.
                </p>
            </div>

            <motion.div 
                className="bg-[#13151D] p-2 rounded-[2rem] shadow-2xl border border-white/5 relative"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[2rem] pointer-events-none" />

                <div className="bg-[#1A1D27] p-8 md:p-12 rounded-[1.8rem] relative z-10 border border-white/5">
                    {!file && !isPasting ? (
                        <div 
                            className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-[#13151D]/50 hover:bg-[#13151D]'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={`p-4 rounded-2xl mb-6 transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                                <UploadCloud className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Drop your notes here</h3>
                            <p className="text-gray-400 text-sm mb-8">or click to browse</p>
                            
                            <div className="flex gap-4 text-xs font-semibold text-gray-300 mb-6">
                                <span className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><FileText className="w-4 h-4 text-indigo-400" /> PDF</span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><File className="w-4 h-4 text-blue-400" /> DOCX</span>
                            </div>

                            <p className="text-gray-500 text-xs">Up to 20 pages • Your documents are processed temporarily</p>

                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf,.docx,.txt" 
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />
                        </div>
                    ) : isPasting ? (
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Paste your notes</h3>
                                <button onClick={() => setIsPasting(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-48 bg-[#13151D] text-gray-200 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none mb-6 custom-scrollbar"
                                placeholder="Paste your study material here..."
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                            />
                            
                            {error && (
                                <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm font-medium mb-6">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button 
                                onClick={handleUpload}
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                            >
                                Generate Flashcards <Sparkles className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                            <div className="w-full bg-[#13151D] border border-indigo-500/30 rounded-2xl p-6 flex items-center justify-between mb-8 relative overflow-hidden">
                                {loading && (
                                    <motion.div 
                                        className="absolute inset-0 bg-indigo-500/10"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-400">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs text-lg">{file?.name}</h4>
                                        <p className="text-sm text-gray-400">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {!loading && (
                                    <button onClick={() => setFile(null)} className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors relative z-10">
                                        <X className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm font-medium mb-6">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button 
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading Document...
                                    </>
                                ) : (
                                    <>Generate Flashcards <Sparkles className="w-5 h-5" /></>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {!file && !isPasting && (
                        <div className="mt-6 text-center">
                            <button onClick={() => setIsPasting(true)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors">
                                <Edit3 className="w-4 h-4" /> Paste Text Instead
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
