import { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import StudySession from './components/StudySession';
import MyDecks from './components/MyDecks';
import Settings from './components/Settings';
import ProfileModal from './components/ProfileModal';
import { BookOpen, UserCircle, Settings as SettingsIcon, FileText, BrainCircuit, RotateCcw, Download, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const [deckTitle, setDeckTitle] = useState<string>("Study Session");
  const [currentRoute, setCurrentRoute] = useState<'study' | 'decks' | 'settings'>('study');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Simple hash router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'decks') {
        setCurrentRoute('decks');
        setExtractedContent(null);
        setActiveDeckId(null);
      } else if (hash === 'settings') {
        setCurrentRoute('settings');
        setExtractedContent(null);
        setActiveDeckId(null);
      } else if (hash.startsWith('study?deck=')) {
        setCurrentRoute('study');
        setActiveDeckId(hash.split('=')[1]);
        setExtractedContent(null);
      } else {
        setCurrentRoute('study');
        setActiveDeckId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleExtracted = (content: string, title: string) => {
    setExtractedContent(content);
    setDeckTitle(title);
    window.location.hash = 'study';
  };

  const navClass = (route: string) => `hidden sm:block text-sm font-medium transition-colors ${currentRoute === route && !activeDeckId && !extractedContent ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`;

  return (
    <div className="min-h-screen bg-[#0F1117] text-gray-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <header className="bg-[#13151D]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.hash = ''}>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Study Buddy</h1>
          </div>
          
          <nav className="flex items-center gap-8">
            <a href="#" className={navClass('study')}>Study</a>
            <a href="#decks" className={navClass('decks')}>My Decks</a>
            <a href="#settings" className={navClass('settings')}>Settings</a>
            
            {(extractedContent || activeDeckId) && (
              <button 
                onClick={() => {
                  setExtractedContent(null);
                  setActiveDeckId(null);
                  window.location.hash = '';
                }}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2 rounded-full"
              >
                + New Deck
              </button>
            )}
            
            <div className="w-px h-5 bg-white/10 hidden sm:block"></div>
            <button onClick={() => window.location.hash = 'settings'} className="text-gray-400 hover:text-white transition-colors hidden sm:block">
                <SettingsIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="text-gray-400 hover:text-white transition-colors">
                <UserCircle className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20 pt-8 relative z-10">
        {currentRoute === 'decks' && <MyDecks />}
        {currentRoute === 'settings' && <Settings />}
        {currentRoute === 'study' && (
          !extractedContent && !activeDeckId ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-16">
              <UploadSection onExtracted={handleExtracted} />
              
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1A1D27] border border-white/5 p-6 rounded-2xl">
                  <BrainCircuit className="w-6 h-6 text-indigo-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">AI Generated</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">High-value questions extracted automatically from your notes.</p>
                </div>
                <div className="bg-[#1A1D27] border border-white/5 p-6 rounded-2xl">
                  <Zap className="w-6 h-6 text-yellow-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Active Recall</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Learn by remembering and testing yourself, not passive rereading.</p>
                </div>
                <div className="bg-[#1A1D27] border border-white/5 p-6 rounded-2xl">
                  <RotateCcw className="w-6 h-6 text-emerald-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Smart Review</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Weak cards automatically get higher priority in your queue.</p>
                </div>
                <div className="bg-[#1A1D27] border border-white/5 p-6 rounded-2xl">
                  <Download className="w-6 h-6 text-blue-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Export Ready</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Instantly export to Anki CSV or a printable PDF study sheet.</p>
                </div>
              </section>

              <section className="bg-[#13151D] border border-white/5 rounded-3xl p-8 md:p-12 text-center">
                <h2 className="text-2xl font-bold text-white mb-10">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#1A1D27] border border-white/5 flex items-center justify-center mb-6 text-xl font-bold text-gray-500 shadow-xl">01</div>
                    <h4 className="font-semibold text-white mb-2 text-lg">Upload Notes</h4>
                    <p className="text-sm text-gray-400 max-w-[250px]">Upload PDF, DOCX, or paste study text directly.</p>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#1A1D27] border border-white/5 flex items-center justify-center mb-6 text-xl font-bold text-indigo-500 shadow-xl shadow-indigo-500/10">02</div>
                    <h4 className="font-semibold text-white mb-2 text-lg">AI Creates Flashcards</h4>
                    <p className="text-sm text-gray-400 max-w-[250px]">Gemini identifies important concepts and builds active-recall questions.</p>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#1A1D27] border border-white/5 flex items-center justify-center mb-6 text-xl font-bold text-gray-500 shadow-xl">03</div>
                    <h4 className="font-semibold text-white mb-2 text-lg">Practice & Master</h4>
                    <p className="text-sm text-gray-400 max-w-[250px]">Reveal answers, mark cards as Right/Review, and track mastery.</p>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span><strong className="text-gray-300">Privacy-first:</strong> Your uploaded study material is processed temporarily and isn't permanently stored.</span>
              </div>
            </motion.div>
          ) : (
            <StudySession content={extractedContent || ''} title={deckTitle} deckId={activeDeckId || undefined} />
          )
        )}
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default App;
