
import React, { useState } from 'react';
import { Send, Book, Palette, Globe, Loader2 } from 'lucide-react';

interface StoryInputProps {
  onSubmit: (text: string, style: string, format: string) => void;
  isLoading: boolean;
}

const STYLES = [
  { id: 'epic', label: 'Épique & Grandiose', icon: '⚔️' },
  { id: 'dark', label: 'Sombre & Mystérieux', icon: '🌑' },
  { id: 'humor', label: 'Spirituel & Humour', icon: '🎭' },
  { id: 'doc', label: 'Documentaire', icon: '📜' },
  { id: 'noir', label: 'Polar Noir', icon: '🕵️' },
];

const FORMATS = [
  { id: 'movie', label: 'Film Cinématographique', desc: 'Narrateur + Dialogues Dramatiques' },
  { id: 'play', label: 'Pièce de Théâtre', desc: 'Accent sur les interactions entre personnages' },
  { id: 'memoir', label: 'Mémoires Personnelles', desc: 'Perspective à la première personne' },
];

export const StoryInput: React.FC<StoryInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('epic');
  const [format, setFormat] = useState('movie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) {
      alert("Veuillez fournir au moins 50 caractères de texte pour une histoire significative.");
      return;
    }
    onSubmit(text, style, format);
  };

  return (
    <div className="glass-panel p-8 rounded-[2rem] border-slate-800 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Book size={16} /> Texte Source
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez ici votre article historique, transcription ou faits bruts..."
            className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none placeholder:text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Palette size={16} /> Style Cinématographique
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-xl border text-sm flex items-center gap-2 transition-all ${
                    style === s.id 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' 
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={16} /> Format de l'Expérience
            </label>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all group ${
                    format === f.id 
                      ? 'bg-amber-500/10 border-amber-500/50' 
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className={`text-sm font-bold ${format === f.id ? 'text-amber-400' : 'text-slate-200'}`}>{f.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`w-full py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all ${
            isLoading || !text.trim()
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Send size={20} />
              GÉNÉRER L'HISTOIRE CINÉMATIQUE
            </>
          )}
        </button>
      </form>
    </div>
  );
};
