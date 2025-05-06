/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';

export interface TranscriptEntry {
  timestamp: string;
  type: 'user' | 'avatar' | 'system' | 'error';
  content: string;
  transcription?: string;
  isPartial?: boolean;
  turnId?: string;
}

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
  className?: string;
}

/**
 * TranscriptDisplay - Modular component for rendering chat/transcript history.
 * Accessible, mobile-friendly, and supports system/error messages.
 */
const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ entries, className }) => {
  return (
    <div
      aria-live="polite"
      className={`transcript-display max-h-[400px] overflow-y-auto text-sm ${className || ''}`.trim()}
      tabIndex={0}
    >
      {entries.length === 0 ? (
        <div className="text-gray-500 italic">No transcript yet.</div>
      ) : (
        <ul>
          {entries.map((entry, idx) => (
            <li
              key={entry.timestamp + idx}
              className={
                entry.type === 'user'
                  ? 'text-blue-200'
                  : entry.type === 'avatar'
                    ? 'text-green-200'
                    : entry.type === 'system'
                      ? 'text-gray-400 italic'
                      : 'text-red-400'
              }
            >
              <span className="mr-2 text-xs text-gray-500">{entry.timestamp}</span>
              <span>
                {entry.type === 'system' || entry.type === 'error'
                  ? entry.content
                  : entry.transcription || entry.content}
              </span>
              {entry.isPartial && (
                <span className="ml-2 animate-pulse text-yellow-300">(partial)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TranscriptDisplay;
