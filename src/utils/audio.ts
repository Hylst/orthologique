import * as Tone from 'tone';

let audioContext: AudioContext | Tone.BaseContext | null = null;
let synth: Tone.Synth | null = null;

// File d'attente pour les sons
interface SoundQueueItem {
  type: 'success' | 'error' | 'click' | 'progress';
  timestamp: number;
}

let soundQueue: SoundQueueItem[] = [];
let isProcessingQueue = false;

export const initAudio = async (): Promise<void> => {
  try {
    if (!audioContext) {
      await Tone.start();
      audioContext = Tone.context;
      synth = new Tone.Synth().toDestination();
    }
  } catch (error) {
    console.error('Erreur initialisation audio:', error);
  }
};

// Traitement de la file d'attente des sons
const processSoundQueue = async (): Promise<void> => {
  if (isProcessingQueue || soundQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (soundQueue.length > 0) {
    const soundItem = soundQueue.shift();
    if (!soundItem) break;
    
    // Évite les sons trop rapprochés (moins de 100ms)
    const now = Date.now();
    if (now - soundItem.timestamp < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - (now - soundItem.timestamp)));
    }
    
    switch (soundItem.type) {
      case 'success':
        await playSuccessSoundImmediate();
        break;
      case 'error':
        await playErrorSoundImmediate();
        break;
      case 'click':
        await playClickSoundImmediate();
        break;
      case 'progress':
        await playProgressSoundImmediate();
        break;
    }
    
    // Pause entre les sons pour éviter la superposition
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  isProcessingQueue = false;
};

// Ajoute un son à la file d'attente
const queueSound = (type: SoundQueueItem['type']): void => {
  soundQueue.push({ type, timestamp: Date.now() });
  processSoundQueue();
};

// Fonctions de lecture immédiate (utilisées par la file d'attente)
const playSuccessSoundImmediate = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!synth) {
      resolve();
      return;
    }
    
    synth.triggerAttackRelease('C5', '8n');
    setTimeout(() => {
      if (synth) synth.triggerAttackRelease('E5', '8n');
    }, 150);
    setTimeout(() => {
      if (synth) synth.triggerAttackRelease('G5', '8n');
      resolve();
    }, 300);
  });
};

const playErrorSoundImmediate = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!synth) {
      resolve();
      return;
    }
    
    synth.triggerAttackRelease('F4', '4n');
    setTimeout(() => {
      if (synth) synth.triggerAttackRelease('D4', '4n');
      resolve();
    }, 200);
  });
};

const playClickSoundImmediate = (): Promise<void> => {
  return new Promise((resolve) => {
    if (synth) {
      synth.triggerAttackRelease('C4', '16n');
    }
    resolve();
  });
};

const playProgressSoundImmediate = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!synth) {
      resolve();
      return;
    }
    
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    notes.forEach((note, index) => {
      setTimeout(() => {
        if (synth) synth.triggerAttackRelease(note, '16n');
        if (index === notes.length - 1) resolve();
      }, index * 80);
    });
  });
};

// Fonctions publiques qui utilisent la file d'attente
export const playSuccessSound = (): void => {
  queueSound('success');
};

export const playErrorSound = (): void => {
  queueSound('error');
};

export const playClickSound = (): void => {
  queueSound('click');
};

export const playProgressSound = (): void => {
  queueSound('progress');
};

// Synthèse vocale
// Enhanced speech synthesis configuration
interface SpeechConfig {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

// Default speech configuration
const defaultSpeechConfig: SpeechConfig = {
  rate: 0.8,
  pitch: 1.0,
  volume: 0.8
};

// Get available French voices with quality preference
export const getAvailableFrenchVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) return [];
  
  const voices = speechSynthesis.getVoices();
  return voices
    .filter(voice => voice.lang.startsWith('fr'))
    .sort((a, b) => {
      // Prioritize local voices over remote ones
      if (a.localService && !b.localService) return -1;
      if (!a.localService && b.localService) return 1;
      
      // Prioritize higher quality voices (neural/premium)
      const aQuality = a.name.toLowerCase().includes('neural') || a.name.toLowerCase().includes('premium') ? 1 : 0;
      const bQuality = b.name.toLowerCase().includes('neural') || b.name.toLowerCase().includes('premium') ? 1 : 0;
      
      return bQuality - aQuality;
    });
};

// Get the best available French voice
export const getBestFrenchVoice = (): SpeechSynthesisVoice | null => {
  const frenchVoices = getAvailableFrenchVoices();
  return frenchVoices.length > 0 ? frenchVoices[0] : null;
};

// Enhanced speak function with better voice selection and error handling
export const speak = (text: string, lang: string = 'fr-FR', config?: Partial<SpeechConfig>): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const finalConfig = { ...defaultSpeechConfig, ...config };
    
    // Set language
    utterance.lang = lang;
    
    // Apply configuration
    utterance.rate = Math.max(0.1, Math.min(2.0, finalConfig.rate));
    utterance.pitch = Math.max(0, Math.min(2.0, finalConfig.pitch));
    utterance.volume = Math.max(0, Math.min(1.0, finalConfig.volume));
    
    // Set the best available voice
    if (finalConfig.voice) {
      utterance.voice = finalConfig.voice;
    } else {
      const bestVoice = getBestFrenchVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    // Event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      reject(new Error(`Speech synthesis failed: ${event.error}`));
    };
    
    // Add a timeout to prevent hanging
    const timeout = setTimeout(() => {
      speechSynthesis.cancel();
      reject(new Error('Speech synthesis timeout'));
    }, 30000); // 30 second timeout
    
    utterance.onend = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    utterance.onerror = (event) => {
      clearTimeout(timeout);
      console.error('Speech synthesis error:', event.error);
      reject(new Error(`Speech synthesis failed: ${event.error}`));
    };

    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      clearTimeout(timeout);
      console.error('Failed to start speech synthesis:', error);
      reject(error);
    }
  });
};

// Stop current speech synthesis
export const stopSpeech = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};

// Pause current speech synthesis
export const pauseSpeech = (): void => {
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
};

// Resume paused speech synthesis
export const resumeSpeech = (): void => {
  if ('speechSynthesis' in window && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
};

// Check if speech synthesis is currently speaking
export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && speechSynthesis.speaking;
};

// Check if speech synthesis is paused
export const isPaused = (): boolean => {
  return 'speechSynthesis' in window && speechSynthesis.paused;
};

// Speak with slow rate for better comprehension (useful for learning)
export const speakSlowly = (text: string, lang: string = 'fr-FR'): Promise<void> => {
  return speak(text, lang, { rate: 0.6, pitch: 1.0 });
};

// Speak with emphasis (higher pitch and slightly slower)
export const speakWithEmphasis = (text: string, lang: string = 'fr-FR'): Promise<void> => {
  return speak(text, lang, { rate: 0.7, pitch: 1.2 });
};

// Initialize voices (call this when the app starts)
export const initializeVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Voices might not be loaded immediately
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('Available French voices:', getAvailableFrenchVoices().map(v => v.name));
        resolve();
      } else {
        // Wait a bit more for voices to load
        setTimeout(loadVoices, 100);
      }
    };

    // Some browsers fire this event when voices are loaded
    speechSynthesis.onvoiceschanged = loadVoices;
    
    // Start checking immediately
    loadVoices();
  });
};

// Fonction pour vider la file d'attente des sons (utile pour les changements de page)
export const clearSoundQueue = (): void => {
  soundQueue = [];
  isProcessingQueue = false;
};