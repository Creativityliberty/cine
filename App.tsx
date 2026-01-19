
import React, { useState, useCallback } from 'react';
import { 
  Sparkles, 
  History, 
  Play, 
  BookOpen, 
  Settings, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { StoryInput } from './components/StoryInput';
import { StoryPlayer } from './components/StoryPlayer';
import { CharacterGallery } from './components/CharacterGallery';
import { generateStoryStructure, generateCharacterAvatars, generateSceneImages, generateSceneAudio } from './services/geminiService';
import { Story, AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'idle',
    progress: 0,
    error: null,
  });
  const [story, setStory] = useState<Story | null>(null);

  const handleStartProcess = async (text: string, style: string, format: string) => {
    try {
      setState({ status: 'analyzing', progress: 10, error: null });
      
      // Étape 1: Structure de l'histoire (en Français)
      const storyData = await generateStoryStructure(text, style, format);
      setStory(storyData);
      
      setState(prev => ({ ...prev, status: 'casting', progress: 30 }));
      
      // Étape 2: Casting (Avatars)
      const storyWithAvatars = await generateCharacterAvatars(storyData);
      setStory(storyWithAvatars);
      
      setState(prev => ({ ...prev, status: 'generating_media', progress: 60 }));
      
      // Étape 3: Visuels & Audio des scènes
      const storyWithImages = await generateSceneImages(storyWithAvatars);
      setStory(storyWithImages);
      
      setState(prev => ({ ...prev, progress: 85 }));
      
      const fullStory = await generateSceneAudio(storyWithImages);
      setStory(fullStory);
      
      setState({ status: 'ready', progress: 100, error: null });
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, status: 'idle', error: err.message || "Une erreur est survenue lors de la conversion cinématographique." }));
    }
  };

  const reset = () => {
    setStory(null);
    setState({ status: 'idle', progress: 0, error: null });
  };

  return (
    <div className="min-h-screen cinematic-gradient pb-20">
      {/* Header */}
      <nav className="p-6 border-b border-slate-800 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="bg-amber-500 p-2 rounded-lg">
              <History className="text-slate-950" size={24} />
            </div>
            <h1 className="font-cinzel text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              CINÉTÉXTE
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Bibliothèque</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Voix</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Aide</span>
          </div>
          
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-semibold transition-all border border-slate-700">
            Exporter JSON
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-12 px-6">
        {state.status === 'idle' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-4">Transformez l'histoire en une <span className="text-amber-500 italic">expérience</span>.</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                Collez n'importe quel texte brut, document ou récit historique. Notre IA analysera, scénarisera et animera le tout dans un voyage cinématographique multi-personnages.
              </p>
            </div>
            <StoryInput onSubmit={handleStartProcess} isLoading={false} />
            
            {state.error && (
              <div className="mt-8 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3 text-red-200">
                <AlertCircle size={20} />
                <p className="text-sm">{state.error}</p>
              </div>
            )}
          </div>
        )}

        {state.status !== 'idle' && state.status !== 'ready' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
              <Loader2 className="animate-spin text-amber-500 relative" size={64} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-cinzel font-bold text-amber-100 uppercase tracking-widest">
                {state.status === 'analyzing' ? 'ANALYSE DES FAITS' : 
                 state.status === 'casting' ? 'CASTING DES VOIX' : 
                 state.status === 'generating_media' ? 'RENDU VISUEL ET AUDIO' : 'PROCESSUS EN COURS'}
              </h3>
              <p className="text-slate-500 font-mono text-sm">Orchestration de la scène {Math.floor(state.progress / 20) + 1}...</p>
            </div>
            <div className="w-full max-w-md bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
               <StatusStep label="Vérification des faits" active={state.status === 'analyzing'} done={state.progress > 15} />
               <StatusStep label="Écriture du script" active={state.status === 'storyboarding'} done={state.progress > 35} />
               <StatusStep label="Casting Personnages" active={state.status === 'casting'} done={state.progress > 55} />
               <StatusStep label="Rendu Cinématique" active={state.status === 'generating_media'} done={state.progress > 85} />
            </div>
          </div>
        )}

        {state.status === 'ready' && story && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                  <CheckCircle size={14} /> Histoire Ingéniée avec Succès
                </div>
                <h2 className="text-4xl md:text-5xl font-cinzel font-black tracking-tight">{story.title}</h2>
                <p className="text-slate-400 mt-2 font-light italic">Converti à partir de vos données brutes</p>
              </div>
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-full font-bold hover:bg-amber-400 transition-all hover:scale-105"
              >
                <Sparkles size={18} /> Nouvelle Histoire
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                 <StoryPlayer story={story} />
              </div>
              <div className="space-y-8">
                <CharacterGallery characters={story.characters} />
                <div className="glass-panel rounded-3xl p-6 border-slate-800 shadow-2xl">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                     <FileText size={16} /> Résumé de Production
                   </h3>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     {story.summary}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-4 text-center text-xs text-slate-600 font-mono pointer-events-none">
        MOTEUR NARRATIF PROPULSÉ PAR GEMINI v2.0 // ASSETS HAUTE-FIDÉLITÉ
      </footer>
    </div>
  );
};

const StatusStep: React.FC<{ label: string; active: boolean; done: boolean }> = ({ label, active, done }) => (
  <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-amber-500/10 border-amber-500/50 scale-105' : done ? 'bg-slate-800/50 border-slate-700 opacity-60' : 'bg-slate-900 border-slate-800 opacity-40'}`}>
    <div className="flex items-center gap-2 mb-1">
      {done ? <CheckCircle size={14} className="text-amber-500" /> : <div className={`w-3 h-3 rounded-full ${active ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>}
      <span className={`text-[10px] uppercase font-bold tracking-tighter ${active ? 'text-amber-400' : 'text-slate-400'}`}>Étape</span>
    </div>
    <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </div>
);

export default App;
