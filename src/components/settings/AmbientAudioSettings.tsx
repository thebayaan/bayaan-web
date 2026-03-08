'use client';

import { useState } from 'react';
import { useAmbientAudioContext } from '@/components/layout/AmbientAudioProvider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AmbientAudioSettings() {
  const {
    isEnabled,
    volumes,
    currentAmbient,
    availableSounds,
    toggleEnabled,
    updateVolume,
    playAmbientSound,
    stopAmbientSound,
    playSound,
  } = useAmbientAudioContext();

  const [testingSound, setTestingSound] = useState<string | null>(null);

  const handleTestSound = async (soundId: string) => {
    setTestingSound(soundId);
    await playSound(soundId);
    setTimeout(() => setTestingSound(null), 1000);
  };

  const effectSounds = availableSounds.filter(s => s.category === 'effect');
  const feedbackSounds = availableSounds.filter(s => s.category === 'feedback');
  const ambientSounds = availableSounds.filter(s => s.category === 'ambient');

  return (
    <div className="space-y-6">
      <SectionHeader>Ambient Audio Settings</SectionHeader>

      {/* Master Enable/Disable */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[color:var(--color-label)] mb-1">
              Enable Ambient Audio
            </h3>
            <p className="text-sm text-[color:var(--color-secondary)]">
              Add gentle sound effects and ambient audio to enhance your spiritual experience
            </p>
          </div>
          <button
            onClick={() => toggleEnabled()}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${isEnabled
                ? 'bg-blue-600'
                : 'bg-[color:var(--color-card-border)]'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </Card>

      {isEnabled && (
        <>
          {/* Sound Effects */}
          <Card className="p-6">
            <h3 className="font-semibold text-[color:var(--color-label)] mb-4">
              Interface Sound Effects
            </h3>
            <div className="space-y-4">
              {effectSounds.map(sound => (
                <div key={sound.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-[color:var(--color-label)]">
                        {sound.name}
                      </span>
                      <Button
                        onClick={() => handleTestSound(sound.id)}
                        variant="secondary"
                        size="sm"
                        disabled={testingSound === sound.id}
                        className="text-xs"
                      >
                        {testingSound === sound.id ? 'Playing...' : 'Test'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volumes[sound.id] ?? sound.defaultVolume}
                      onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-[color:var(--color-secondary)] w-8">
                      {Math.round((volumes[sound.id] ?? sound.defaultVolume) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback Sounds */}
          <Card className="p-6">
            <h3 className="font-semibold text-[color:var(--color-label)] mb-4">
              Feedback Sounds
            </h3>
            <div className="space-y-4">
              {feedbackSounds.map(sound => (
                <div key={sound.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-[color:var(--color-label)]">
                        {sound.name}
                      </span>
                      <Button
                        onClick={() => handleTestSound(sound.id)}
                        variant="secondary"
                        size="sm"
                        disabled={testingSound === sound.id}
                        className="text-xs"
                      >
                        {testingSound === sound.id ? 'Playing...' : 'Test'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volumes[sound.id] ?? sound.defaultVolume}
                      onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-[color:var(--color-secondary)] w-8">
                      {Math.round((volumes[sound.id] ?? sound.defaultVolume) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ambient Background Sounds */}
          <Card className="p-6">
            <h3 className="font-semibold text-[color:var(--color-label)] mb-2">
              Ambient Background Sounds
            </h3>
            <p className="text-sm text-[color:var(--color-secondary)] mb-4">
              Choose a peaceful background sound for reading and reflection
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="ambient-none"
                  name="ambient"
                  value="none"
                  checked={!currentAmbient}
                  onChange={() => stopAmbientSound()}
                  className="text-blue-600"
                />
                <label htmlFor="ambient-none" className="text-[color:var(--color-label)]">
                  None (Silent)
                </label>
              </div>

              {ambientSounds.map(sound => (
                <div key={sound.id} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`ambient-${sound.id}`}
                      name="ambient"
                      value={sound.id}
                      checked={currentAmbient === sound.id}
                      onChange={() => playAmbientSound(sound.id)}
                      className="text-blue-600"
                    />
                    <label htmlFor={`ambient-${sound.id}`} className="text-[color:var(--color-label)]">
                      {sound.name}
                    </label>
                  </div>

                  {currentAmbient === sound.id && (
                    <div className="ml-6 flex items-center space-x-3">
                      <span className="text-sm text-[color:var(--color-secondary)]">Volume:</span>
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.05"
                        value={volumes[sound.id] ?? sound.defaultVolume}
                        onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-[color:var(--color-secondary)] w-8">
                        {Math.round((volumes[sound.id] ?? sound.defaultVolume) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Tips for Better Experience
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use headphones for the best ambient audio experience</li>
                  <li>• Lower ambient volumes work best during reading sessions</li>
                  <li>• Sound effects provide gentle feedback for interactions</li>
                  <li>• You can disable sounds completely if you prefer silence</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}