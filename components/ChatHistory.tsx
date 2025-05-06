'use client';

interface TranscriptionEntry {
  timestamp: string;
  type: 'avatar' | 'user' | 'system' | 'error';
  content: string;
  transcription?: string;
  turnId?: string;
  isPartial?: boolean;
}

interface ChatHistoryProps {
  messages: TranscriptionEntry[];
  className?: string;
}

const getMessageStyle = (type: TranscriptionEntry['type']) => {
  switch (type) {
    case 'user':
      return 'bg-primary-500 text-white justify-end';
    case 'avatar':
      return 'bg-gray-700 text-gray-100 justify-start';
    case 'system':
      return 'bg-gray-600 text-gray-200 justify-start text-sm italic';
    case 'error':
      return 'bg-red-800 text-red-100 justify-start';
    default:
      return 'bg-gray-700 text-gray-100 justify-start';
  }
};

export default function ChatHistory({ messages, className = '' }: ChatHistoryProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <div
          key={`${message.timestamp}-${index}`}
          className={`flex ${getMessageStyle(message.type).split(' ')[2]}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${getMessageStyle(message.type).split(' ').slice(0, 2).join(' ')}`}
          >
            <p>{message.content}</p>
            {message.isPartial === true && message.type === 'avatar' && (
              <div className="flex gap-1 mt-1 h-2">
                <div
                  className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            )}
            <p className="text-xs mt-1 opacity-60">{message.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
