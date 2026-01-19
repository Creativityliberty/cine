
import React from 'react';
import { User, Mic2 } from 'lucide-react';
import { Character } from '../types';

interface CharacterGalleryProps {
  characters: Character[];
}

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({ characters }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border-slate-800 shadow-2xl">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
        <User size={16} /> Dramatic Persona
      </h3>
      <div className="space-y-6">
        {characters.map((char) => (
          <div key={char.id} className="flex gap-4 group cursor-default">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-lg border-2 border-slate-950">
                <Mic2 size={10} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-cinzel font-bold text-amber-200 text-sm tracking-wide truncate">{char.name}</h4>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">{char.role}</p>
              <p className="text-xs text-slate-400 leading-tight line-clamp-2 italic">"{char.bio}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
