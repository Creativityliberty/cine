
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, Maximize2, ShieldCheck, ListChecks } from 'lucide-react';
import { Story, Scene } from '../types';

interface StoryPlayerProps {
  story: Story;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ story }) => {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFacts, setShowFacts] = useState(false);
  const scene = story.scenes[activeSceneIdx];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextScene = () => {
    if (activeSceneIdx < story.scenes.length - 1) {
      setActiveSceneIdx(activeSceneIdx + 1);
      setIsPlaying(false);
      setShowFacts(false);
    }
  };

  const prevScene = () => {
    if (activeSceneIdx > 0) {
      setActiveSceneIdx(activeSceneIdx - 1);
      setIsPlaying(false);
      setShowFacts(false);
    }
  };

  const togglePlay = () => {
    if (!scene.audioUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.src = scene.audioUrl || '';
    }
  }, [activeSceneIdx, scene.audioUrl]);

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-slate-800 bg-black aspect-video transition-all">
      {/* Visual Content */}
      <div className="absolute inset-0">
        <img 
          src={scene.imageUrl || 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2074&auto=format&fit=crop'} 
          alt={scene.title}
          className={`w-full h-full object-cover transition-all duration-2000 ease-out ${isPlaying ? 'scale-110 blur-[2px] brightness-[0.4]' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 opacity-80"></div>
      </div>

      {/* Truth Lock Badge */}
      <div className="absolute top-6 left-6 z-20">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full backdrop-blur-md">
            <ShieldCheck size={14} className="text-green-400" />
            <span className="text-[10px] font-bold text-green-100 uppercase tracking-widest">Truth Lock: Factuel</span>
         </div>
      </div>

      {/* Narrative Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
        {!isPlaying ? (
           <div className="animate-in fade-in zoom-in duration-700 space-y-6">
              <div className="space-y-2">
                <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em] drop-shadow-lg">SCÈNE {activeSceneIdx + 1} / {story.scenes.length}</span>
                <h3 className="font-cinzel text-5xl md:text-6xl font-black text-white text-glow">
                  {scene.title}
                </h3>
              </div>
              <p className="text-amber-100/90 text-xl font-playfair italic max-w-2xl mx-auto drop-shadow-xl leading-relaxed">
                {scene.description}
              </p>
              <div className="flex items-center justify-center gap-4 pt-6">
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Lieu</span>
                   <span className="px-4 py-1.5 bg-white/10 rounded-lg text-sm font-semibold text-white backdrop-blur-md border border-white/10">{scene.location}</span>
                 </div>
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Époque</span>
                   <span className="px-4 py-1.5 bg-amber-500/20 rounded-lg text-sm font-semibold text-amber-200 backdrop-blur-md border border-amber-500/20">{scene.time}</span>
                 </div>
              </div>
           </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full max-w-4xl space-y-10">
             <div className="space-y-12">
                {scene.dialogues.map((d, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: `${i * 1.5}s` }}>
                    <div className="flex flex-col items-center">
                      <p className="text-amber-500 text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-80">
                        {story.characters.find(c => c.id === d.characterId)?.name || 'Narrateur'}
                      </p>
                      <p className="text-3xl md:text-5xl font-playfair text-white font-medium leading-[1.3] drop-shadow-2xl max-w-3xl">
                        "{d.text}"
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Audio Element */}
      {scene.audioUrl && (
        <audio 
          ref={audioRef} 
          src={scene.audioUrl} 
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Facts Overlay */}
      {showFacts && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-xl p-12 flex flex-col justify-center animate-in fade-in duration-300">
           <div className="max-w-2xl mx-auto space-y-6">
              <h4 className="flex items-center gap-3 text-amber-500 font-cinzel text-2xl font-bold">
                <ListChecks size={24} /> Sources de Vérité
              </h4>
              <ul className="space-y-4">
                {scene.factsUsed.map((fact, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-slate-300 text-lg font-light leading-relaxed">
                    <span className="text-amber-500 font-mono text-sm mt-1">[{idx + 1}]</span>
                    {fact}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowFacts(false)}
                className="mt-8 px-8 py-3 bg-amber-500 text-slate-950 font-bold rounded-full hover:scale-105 transition-all"
              >
                Retour au film
              </button>
           </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 w-full p-8 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-6">
          <button 
            onClick={prevScene} 
            disabled={activeSceneIdx === 0}
            className="p-3 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-10"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-20 h-20 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-transform hover:scale-110 active:scale-95"
          >
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            onClick={nextScene}
            disabled={activeSceneIdx === story.scenes.length - 1}
            className="p-3 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-6">
           <button 
              onClick={() => setShowFacts(!showFacts)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-amber-500/20 rounded-full text-xs font-bold text-slate-300 border border-slate-700 transition-all"
           >
             <ListChecks size={16} className="text-amber-500" /> VÉRIFIER LES FAITS
           </button>
           <div className="text-white font-mono text-xs opacity-40 tracking-widest">
             {activeSceneIdx + 1} // {story.scenes.length}
           </div>
           <button className="p-2 text-white/40 hover:text-white transition-colors">
             <Maximize2 size={20} />
           </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 w-full h-1.5 bg-white/5">
        <div 
          className="h-full bg-amber-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
          style={{ width: `${((activeSceneIdx + 1) / story.scenes.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};