import React, { ChangeEvent } from 'react';

/**
 * Props for the FilterControls component.
 * @property emotionFilter - Current emotion support filter value
 * @property genderFilter - Current gender filter value
 * @property setGenderFilter - Setter for gender filter
 * @property languageFilter - Current language filter value
 * @property languages - List of available languages
 * @property nameFilter - Current name filter value
 * @property setEmotionFilter - Setter for emotion support filter
 * @property setLanguageFilter - Setter for language filter
 * @property setNameFilter - Setter for name filter
 * @property setStreamingFilter - Setter for streaming support filter
 * @property streamingFilter - Current streaming support filter value
 */
export interface FilterControlsProps {
  emotionFilter: string;
  genderFilter: string;
  setGenderFilter: (val: string) => void;
  languageFilter: string;
  languages: string[];
  nameFilter: string;
  setEmotionFilter: (val: string) => void;
  setLanguageFilter: (val: string) => void;
  setNameFilter: (val: string) => void;
  setStreamingFilter: (val: string) => void;
  streamingFilter: string;
}

/**
 * Renders filter controls for the Voice Browser page.
 */
const FilterControls: React.FC<FilterControlsProps> = ({
  emotionFilter,
  genderFilter,
  setGenderFilter,
  languageFilter,
  languages,
  nameFilter,
  setEmotionFilter,
  setLanguageFilter,
  setNameFilter,
  setStreamingFilter,
  streamingFilter,
}) => (
  <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 flex flex-wrap gap-4 justify-center">
    {/* Language Filter */}
    <select
      aria-label="Language filter"
      className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={languageFilter}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguageFilter(e.target.value)}
    >
      <option value="">All Languages</option>
      {languages.map(lang => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
    {/* Gender Filter */}
    <select
      aria-label="Gender filter"
      className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={genderFilter}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setGenderFilter(e.target.value)}
    >
      <option value="">All Genders</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
    {/* Name Filter */}
    <input
      aria-label="Name filter"
      className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Search by name..."
      type="text"
      value={nameFilter}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setNameFilter(e.target.value)}
    />
    {/* Emotion Support Filter */}
    <select
      aria-label="Emotion support filter"
      className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={emotionFilter}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setEmotionFilter(e.target.value)}
    >
      <option value="">All Emotion Support</option>
      <option value="yes">Emotion Support: Yes</option>
      <option value="no">Emotion Support: No</option>
    </select>
    {/* Streaming Support Filter */}
    <select
      aria-label="Streaming support filter"
      className="bg-gray-700 border border-gray-600 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={streamingFilter}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setStreamingFilter(e.target.value)}
    >
      <option value="">All Streaming Support</option>
      <option value="yes">Streaming Support: Yes</option>
      <option value="no">Streaming Support: No</option>
    </select>
  </div>
);

export default FilterControls;
