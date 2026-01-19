
export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface Character {
  id: string;
  name: string;
  role: string;
  bio: string;
  voice: VoiceName;
  gender: 'male' | 'female';
  avatarPrompt: string;
  avatarUrl?: string;
}

export interface DialogueLine {
  characterId: string;
  text: string;
  emotion: string;
}

export interface Scene {
  id: number;
  title: string;
  location: string;
  time: string;
  description: string;
  visualPrompt: string;
  imageUrl?: string;
  dialogues: DialogueLine[];
  audioUrl?: string;
  factsUsed: string[];
}

export interface Story {
  title: string;
  narrativeStyle: string;
  summary: string;
  characters: Character[];
  scenes: Scene[];
}

export interface AppState {
  status: 'idle' | 'analyzing' | 'storyboarding' | 'casting' | 'generating_media' | 'ready';
  progress: number;
  error: string | null;
}