
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, Character, Scene, VoiceName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STORY_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

export async function generateStoryStructure(text: string, style: string, format: string): Promise<Story> {
  const prompt = `
    TON RÔLE: Tu es un expert en narration historique et "Truth Lock". 
    TA MISSION: Transformer le texte brut suivant en un storyboard d'histoire cinématographique immersif.
    RÈGLE D'OR: Chaque scène doit être ancrée dans des faits réels extraits du texte. Ne pas inventer de faits historiques majeurs non présents.
    
    LANGUE: Réponds exclusivement en FRANÇAIS pour le contenu narratif.
    TEXTE SOURCE: ${text}
    STYLE VISUEL/TON: ${style}
    FORMAT: ${format}

    Consignes spécifiques:
    1. Structure l'histoire en 3 à 5 scènes clés.
    2. Pour chaque scène, liste explicitement dans "factsUsed" les faits du texte source qui justifient la scène.
    3. Crée 2 à 3 personnages charismatiques (mélange de figures historiques réelles ou témoins représentatifs).
    4. Assigne des voix TTS spécifiques (Puck, Charon, Kore, Fenrir, Zephyr). Kore est la seule voix féminine disponible.
    5. Les "visualPrompt" doivent être en ANGLAIS et très descriptifs pour un modèle de génération d'image (ex: "cinematic wide shot, 18th century Paris, moody lighting, 8k").
  `;

  const response = await ai.models.generateContent({
    model: STORY_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          narrativeStyle: { type: Type.STRING },
          summary: { type: Type.STRING },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                bio: { type: Type.STRING },
                voice: { type: Type.STRING, description: "Puck, Charon, Kore, Fenrir, Zephyr" },
                gender: { type: Type.STRING },
                avatarPrompt: { type: Type.STRING }
              },
              required: ["id", "name", "role", "voice", "gender", "avatarPrompt"]
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                title: { type: Type.STRING },
                location: { type: Type.STRING },
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                factsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                dialogues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      characterId: { type: Type.STRING },
                      text: { type: Type.STRING },
                      emotion: { type: Type.STRING }
                    },
                    required: ["characterId", "text"]
                  }
                }
              },
              required: ["id", "title", "description", "visualPrompt", "dialogues", "factsUsed"]
            }
          }
        },
        required: ["title", "summary", "characters", "scenes"]
      }
    }
  });

  const responseText = response.text;
  if (!responseText) throw new Error("Échec de la génération structurelle.");
  return JSON.parse(responseText);
}

export async function generateCharacterAvatars(story: Story): Promise<Story> {
  const updatedCharacters = await Promise.all(story.characters.map(async (char) => {
    try {
      const resp = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: `Cinematic professional character portrait of ${char.name}, ${char.avatarPrompt}. Dramatic rim lighting, shallow depth of field, high detail, masterpiece.`,
      });
      
      let avatarUrl = '';
      if (resp.candidates?.[0]?.content?.parts) {
        for (const part of resp.candidates[0].content.parts) {
          if (part.inlineData) {
            avatarUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      return { ...char, avatarUrl };
    } catch (e) {
      return char;
    }
  }));

  return { ...story, characters: updatedCharacters };
}

export async function generateSceneImages(story: Story): Promise<Story> {
  const updatedScenes = await Promise.all(story.scenes.map(async (scene) => {
    try {
      const resp = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: `Masterpiece cinematic wide shot: ${scene.visualPrompt}. Dynamic composition, atmosphere, 8k resolution, photorealistic.`,
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      let imageUrl = '';
      if (resp.candidates?.[0]?.content?.parts) {
        for (const part of resp.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      return { ...scene, imageUrl };
    } catch (e) {
      return scene;
    }
  }));

  return { ...story, scenes: updatedScenes };
}

export async function generateSceneAudio(story: Story): Promise<Story> {
  const updatedScenes = await Promise.all(story.scenes.map(async (scene) => {
    try {
      const promptText = `Génère l'audio TTS pour cette scène en FRANÇAIS:
        ${scene.dialogues.map(d => {
          const char = story.characters.find(c => c.id === d.characterId);
          return `${char?.name || 'Narrateur'}: ${d.text}`;
        }).join('\n')}
      `;

      const speakerConfigs = story.characters.map(c => ({
        speaker: c.name,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice } }
      }));

      if (!speakerConfigs.find(s => s.speaker === 'Narrateur')) {
        speakerConfigs.push({
          speaker: 'Narrateur',
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
        });
      }

      const resp = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakerConfigs }
          }
        }
      });

      const audioBase64 = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
          return { ...scene, audioUrl: await pcmToBase64Wav(audioBase64) };
      }
      return scene;
    } catch (e) {
      return scene;
    }
  }));

  return { ...story, scenes: updatedScenes };
}

async function pcmToBase64Wav(pcmBase64: string): Promise<string> {
  const binary = atob(pcmBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 24000 * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, bytes.length, true);

  const combined = new Uint8Array(wavHeader.byteLength + bytes.length);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, 44);

  const blob = new Blob([combined], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}