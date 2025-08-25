/**
 * Victory audio utility for playing celebration sounds
 * when a lesson is completed with 100% score
 */

/**
 * Plays a victory sound using Web Audio API to create a cheerful melody
 */
export const playVictorySound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('Web Audio API not supported');
        resolve();
        return;
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // Victory melody notes (frequencies in Hz)
      const melody = [
        { freq: 523.25, duration: 0.2 }, // C5
        { freq: 659.25, duration: 0.2 }, // E5
        { freq: 783.99, duration: 0.2 }, // G5
        { freq: 1046.50, duration: 0.4 }, // C6
      ];

      let currentTime = audioContext.currentTime;

      /**
       * Creates and plays a single note
       */
      const playNote = (frequency: number, duration: number, startTime: number) => {
        // Create oscillator for the main tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set frequency and waveform
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'triangle'; // Softer sound than square wave

        // Create envelope (attack, decay, sustain, release)
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1); // Decay
        gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.05); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Release

        // Start and stop the oscillator
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play each note in the melody
      melody.forEach((note) => {
        playNote(note.freq, note.duration, currentTime);
        currentTime += note.duration;
      });

      // Add a final chord for emphasis
      const chordStartTime = currentTime + 0.1;
      const chordDuration = 0.6;
      
      // Play a C major chord (C, E, G)
      [523.25, 659.25, 783.99].forEach(freq => {
        playNote(freq, chordDuration, chordStartTime);
      });

      // Resolve the promise when the sound is complete
      setTimeout(() => {
        audioContext.close();
        resolve();
      }, (chordStartTime + chordDuration + 0.1) * 1000);

    } catch (error) {
      console.warn('Error playing victory sound:', error);
      resolve();
    }
  });
};

/**
 * Plays a simple beep sound as fallback if the main victory sound fails
 */
export const playSimpleVictoryBeep = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        resolve();
        return;
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      setTimeout(() => {
        audioContext.close();
        resolve();
      }, 600);

    } catch (error) {
      console.warn('Error playing simple victory beep:', error);
      resolve();
    }
  });
};