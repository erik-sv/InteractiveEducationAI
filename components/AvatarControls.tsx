import React from 'react';
import PropTypes from 'prop-types';

/**
 * AvatarControls: Renders session, mic, language, and voice controls for InteractiveAvatar.
 * Accessible, keyboard-friendly, and fully typed.
 */

export interface AvatarControlsProps {
  availableLanguages: { value: string; label: string }[];
  availableVoices: { value: string; label: string }[];
  className?: string;
  isLoadingSession: boolean;
  isMicMuted: boolean;
  isSessionActive: boolean;
  onEndSession: (source: string) => void;
  onLanguageChange: (lang: string) => void;
  onStartSession: () => void;
  onToggleMic: () => void;
  onVoiceChange: (voice: string) => void;
  selectedLanguage: string;
  selectedVoice: string;
}

const AvatarControls: React.FC<AvatarControlsProps> = ({
  availableLanguages,
  availableVoices,
  className,
  isLoadingSession,
  isMicMuted,
  isSessionActive,
  onEndSession,
  onLanguageChange,
  onStartSession,
  onToggleMic,
  onVoiceChange,
  selectedLanguage,
  selectedVoice,
}) => {
  return (
    <div className={`flex gap-4 items-center ${className || ''}`.trim()}>
      {/* Session Control */}
      <button
        className={`px-4 py-2 rounded font-semibold transition-colors ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
        onClick={isSessionActive ? () => onEndSession('user') : onStartSession}
        aria-label={isSessionActive ? 'End Session' : 'Start Session'}
        aria-disabled={isLoadingSession}
        disabled={isLoadingSession}
        tabIndex={0}
      >
        {isSessionActive ? 'End Session' : isLoadingSession ? 'Starting...' : 'Start Session'}
      </button>

      {/* Mic Toggle */}
      <button
        className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
        onClick={onToggleMic}
        aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        aria-pressed={isMicMuted}
        disabled={!isSessionActive}
        aria-disabled={!isSessionActive}
        tabIndex={0}
      >
        {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
      </button>

      {/* Language Select */}
      <label htmlFor="avatar-language-select" className="sr-only">Language</label>
      <select
        id="avatar-language-select"
        value={selectedLanguage}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onLanguageChange(e.target.value)}
        disabled={isSessionActive}
        aria-label="Select Language"
        aria-disabled={isSessionActive}
        tabIndex={0}
      >
        {availableLanguages.map(lang => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>

      {/* Voice Select */}
      <label htmlFor="avatar-voice-select" className="sr-only">Voice</label>
      <select
        id="avatar-voice-select"
        value={selectedVoice}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onVoiceChange(e.target.value)}
        disabled={isSessionActive}
        aria-label="Select Voice"
        aria-disabled={isSessionActive}
        tabIndex={0}
      >
        {availableVoices.map(voice => (
          <option key={voice.value} value={voice.value}>
            {voice.label}
          </option>
        ))}
      </select>
    </div>
  );
};

AvatarControls.propTypes = {
  availableLanguages: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  availableVoices: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
  isLoadingSession: PropTypes.bool.isRequired,
  isMicMuted: PropTypes.bool.isRequired,
  isSessionActive: PropTypes.bool.isRequired,
  onEndSession: PropTypes.func.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onStartSession: PropTypes.func.isRequired,
  onToggleMic: PropTypes.func.isRequired,
  onVoiceChange: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  selectedVoice: PropTypes.string.isRequired,
};

export default AvatarControls;
