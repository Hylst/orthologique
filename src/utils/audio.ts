import * as Tone from 'tone';

let audioContext: AudioContext | null = null;
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
export const speak = (text: string, lang: string = 'fr-FR'): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }
};

export const stopSpeech = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};

// Fonction pour vider la file d'attente des sons (utile pour les changements de page)
export const clearSoundQueue = (): void => {
  soundQueue = [];
  isProcessingQueue = false;
};