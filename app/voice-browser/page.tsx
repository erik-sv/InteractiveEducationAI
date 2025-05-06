'use client';

import React from 'react';
import { useState, useEffect, useMemo } from 'react';

import FilterControls from './FilterControls';
import VoiceCard from './VoiceCard';

/**
 * Voice type structure matching the API response.
 */
export interface Voice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio: string;
  support_pause: boolean;
  emotion_support: boolean;
  support_interactive_avatar: boolean;
  support_locale: boolean;
}

/**
 * API response type.
 */
interface ApiResponse {
  success: boolean;
  data: unknown;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Normalize the API response to always return an array of voices, regardless of nesting.
 * Returns an empty array if no valid voices array is found.
 */
function extractVoices(data: unknown): Voice[] {
  // Case 1: Standard { voices: [...] }
  if (data && typeof data === 'object' && 'voices' in data && Array.isArray((data as any).voices)) {
    return (data as any).voices;
  }

  // Case 2: Nested { voices: { data: { voices: [...] } } }
  if (
    data &&
    typeof data === 'object' &&
    'voices' in data &&
    typeof (data as any).voices === 'object' &&
    (data as any).voices !== null &&
    'data' in (data as any).voices &&
    typeof (data as any).voices.data === 'object' &&
    (data as any).voices.data !== null &&
    'voices' in (data as any).voices.data &&
    Array.isArray((data as any).voices.data.voices)
  ) {
    return (data as any).voices.data.voices;
  }

  // Not found
  return [];
}

export default function VoiceBrowserPage() {
  const [emotionFilter, setEmotionFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [streamingFilter, setStreamingFilter] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches voices from the API and sets state. Handles multiple nesting shapes.
     */
    const fetchVoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/get-voices');

        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        const json: ApiResponse = await response.json();

        if (!json.success || !json.data) {
          throw new Error(json.error?.message || 'Invalid API response');
        }
        const extractedVoices = extractVoices(json.data);

        if (!Array.isArray(extractedVoices) || extractedVoices.length === 0) {
          throw new Error('No voices found in API response.');
        }
        setVoices(extractedVoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  // Get unique languages for filter dropdowns
  const languages = useMemo(
    () => Array.from(new Set(voices.map(v => v.language))).sort(),
    [voices]
  );

  // Filter voices based on current filter states
  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      const languageMatch = languageFilter ? voice.language === languageFilter : true;
      const genderMatch = genderFilter ? voice.gender === genderFilter : true;
      const nameMatch = nameFilter
        ? voice.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const emotionMatch =
        emotionFilter === '' ||
        (emotionFilter === 'yes' && voice.emotion_support) ||
        (emotionFilter === 'no' && !voice.emotion_support);
      const streamingMatch =
        streamingFilter === '' ||
        (streamingFilter === 'yes' && voice.support_interactive_avatar) ||
        (streamingFilter === 'no' && !voice.support_interactive_avatar);

      return languageMatch && genderMatch && nameMatch && emotionMatch && streamingMatch;
    });
  }, [voices, languageFilter, genderFilter, nameFilter, emotionFilter, streamingFilter]);

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">HeyGen Voice Browser</h1>

      <FilterControls
        emotionFilter={emotionFilter}
        genderFilter={genderFilter}
        languageFilter={languageFilter}
        languages={languages}
        nameFilter={nameFilter}
        setEmotionFilter={setEmotionFilter}
        setGenderFilter={setGenderFilter}
        setLanguageFilter={setLanguageFilter}
        setNameFilter={setNameFilter}
        setStreamingFilter={setStreamingFilter}
        streamingFilter={streamingFilter}
      />

      {loading && (
        <div aria-live="polite" className="text-center mt-8" role="status">
          Loading voices...
        </div>
      )}

      {error && (
        <div className="text-center mt-8 text-red-400" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {filteredVoices.length > 0 ? (
            filteredVoices.map(voice => (
              <VoiceCard key={voice.voice_id} cardKey={voice.voice_id} voice={voice} />
            ))
          ) : (
            <div aria-live="polite" className="col-span-full text-center text-gray-400">
              No voices match the current filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
