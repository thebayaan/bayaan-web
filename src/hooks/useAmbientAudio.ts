'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface AmbientSound {
  id: string;
  name: string;
  src: string;
  category: 'effect' | 'ambient' | 'feedback';
  defaultVolume: number;
}

// Predefined ambient sounds for the app
const AMBIENT_SOUNDS: AmbientSound[] = [
  // UI Sound Effects
  {
    id: 'click',
    name: 'Gentle Click',
    src: '/sounds/click.mp3',
    category: 'effect',
    defaultVolume: 0.3,
  },
  {
    id: 'page_turn',
    name: 'Page Turn',
    src: '/sounds/page-turn.mp3',
    category: 'effect',
    defaultVolume: 0.4,
  },
  {
    id: 'bookmark',
    name: 'Bookmark',
    src: '/sounds/bookmark.mp3',
    category: 'feedback',
    defaultVolume: 0.5,
  },
  {
    id: 'notification',
    name: 'Gentle Bell',
    src: '/sounds/notification.mp3',
    category: 'feedback',
    defaultVolume: 0.6,
  },

  // Ambient Background Sounds
  {
    id: 'rain',
    name: 'Gentle Rain',
    src: '/sounds/ambient/rain.mp3',
    category: 'ambient',
    defaultVolume: 0.2,
  },
  {
    id: 'nature',
    name: 'Forest Birds',
    src: '/sounds/ambient/nature.mp3',
    category: 'ambient',
    defaultVolume: 0.3,
  },
  {
    id: 'wind',
    name: 'Soft Wind',
    src: '/sounds/ambient/wind.mp3',
    category: 'ambient',
    defaultVolume: 0.25,
  },
];

export function useAmbientAudio() {
  const audioContextRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [isEnabled, setIsEnabled] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [currentAmbient, setCurrentAmbient] = useState<string | null>(null);

  // Initialize volumes from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('bayaan-ambient-audio-enabled') === 'true';
    const savedVolumes = localStorage.getItem('bayaan-ambient-audio-volumes');

    setIsEnabled(savedEnabled);

    if (savedVolumes) {
      try {
        setVolumes(JSON.parse(savedVolumes));
      } catch {
        // Use defaults
        const defaultVolumes: Record<string, number> = {};
        AMBIENT_SOUNDS.forEach(sound => {
          defaultVolumes[sound.id] = sound.defaultVolume;
        });
        setVolumes(defaultVolumes);
      }
    } else {
      const defaultVolumes: Record<string, number> = {};
      AMBIENT_SOUNDS.forEach(sound => {
        defaultVolumes[sound.id] = sound.defaultVolume;
      });
      setVolumes(defaultVolumes);
    }
  }, []);

  // Create audio element for a sound
  const createAudio = useCallback((soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound) return null;

    const audio = new Audio(sound.src);
    audio.preload = 'auto';
    audio.volume = volumes[soundId] ?? sound.defaultVolume;

    audioContextRef.current.set(soundId, audio);
    return audio;
  }, [volumes]);

  // Fade out and stop a sound
  const fadeOutAndStop = useCallback((soundId: string, duration: number) => {
    const audio = audioContextRef.current.get(soundId);
    if (!audio) return;

    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = startVolume / steps;

    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        if (audio) {
          audio.volume = Math.max(startVolume - (volumeStep * i), 0);
          if (i === steps) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      }, stepTime * i);
    }
  }, []);

  // Play a sound effect
  const playSound = useCallback(async (
    soundId: string,
    config: SoundConfig = {}
  ) => {
    if (!isEnabled) return;

    try {
      let audio = audioContextRef.current.get(soundId);

      if (!audio) {
        audio = createAudio(soundId) ?? undefined;
        if (!audio) return;
      }

      // Reset audio to beginning
      audio.currentTime = 0;

      // Apply configuration
      audio.volume = config.volume ?? volumes[soundId] ?? audio.volume;
      audio.loop = config.loop ?? false;

      // Fade in effect
      if (config.fadeIn) {
        audio.volume = 0;
        await audio.play();

        const targetVolume = config.volume ?? volumes[soundId] ?? audio.volume;
        const steps = 20;
        const stepTime = config.fadeIn / steps;
        const volumeStep = targetVolume / steps;

        for (let i = 0; i <= steps; i++) {
          setTimeout(() => {
            audio.volume = Math.min(volumeStep * i, targetVolume);
          }, stepTime * i);
        }
      } else {
        await audio.play();
      }

      // Auto fade out and stop after duration
      if (config.fadeOut && !config.loop) {
        audio.addEventListener('ended', () => {
          fadeOutAndStop(soundId, config.fadeOut!);
        }, { once: true });
      }

    } catch (error) {
      console.warn('Failed to play ambient sound:', soundId, error);
    }
  }, [isEnabled, volumes, createAudio, fadeOutAndStop]);

  // Stop a sound
  const stopSound = useCallback((soundId: string) => {
    const audio = audioContextRef.current.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // Play ambient background sound
  const playAmbientSound = useCallback((soundId: string) => {
    if (currentAmbient) {
      fadeOutAndStop(currentAmbient, 1000);
    }

    setCurrentAmbient(soundId);
    playSound(soundId, { loop: true, fadeIn: 2000 });
  }, [currentAmbient, playSound, fadeOutAndStop]);

  // Stop ambient sound
  const stopAmbientSound = useCallback(() => {
    if (currentAmbient) {
      fadeOutAndStop(currentAmbient, 1000);
      setCurrentAmbient(null);
    }
  }, [currentAmbient, fadeOutAndStop]);

  // Toggle ambient audio system
  const toggleEnabled = useCallback((enabled?: boolean) => {
    const newEnabled = enabled ?? !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('bayaan-ambient-audio-enabled', newEnabled.toString());

    if (!newEnabled) {
      // Stop all sounds when disabled
      audioContextRef.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      setCurrentAmbient(null);
    }
  }, [isEnabled]);

  // Update volume for a specific sound
  const updateVolume = useCallback((soundId: string, volume: number) => {
    const newVolumes = { ...volumes, [soundId]: volume };
    setVolumes(newVolumes);
    localStorage.setItem('bayaan-ambient-audio-volumes', JSON.stringify(newVolumes));

    // Update current playing audio volume
    const audio = audioContextRef.current.get(soundId);
    if (audio) {
      audio.volume = volume;
    }
  }, [volumes]);

  // Cleanup on unmount
  useEffect(() => {
    const audioContext = audioContextRef.current;
    return () => {
      audioContext.forEach(audio => {
        audio.pause();
      });
      audioContext.clear();
    };
  }, []);

  // Preload critical sounds
  useEffect(() => {
    if (isEnabled) {
      const criticalSounds = ['click', 'page_turn', 'bookmark'];
      criticalSounds.forEach(soundId => {
        if (!audioContextRef.current.has(soundId)) {
          createAudio(soundId);
        }
      });
    }
  }, [isEnabled, createAudio]);

  return {
    // State
    isEnabled,
    volumes,
    currentAmbient,
    availableSounds: AMBIENT_SOUNDS,

    // Actions
    playSound,
    stopSound,
    playAmbientSound,
    stopAmbientSound,
    toggleEnabled,
    updateVolume,

    // Convenience methods for common sounds
    clickSound: () => playSound('click'),
    pageTurnSound: () => playSound('page_turn'),
    bookmarkSound: () => playSound('bookmark'),
    notificationSound: () => playSound('notification'),
  };
}