'use client';

interface Message {
  timestamp: string;
  type: 'USER' | 'AVATAR';
  content: string;
}

interface ChatHistoryProps {
  messages: Message[];
  className?: string;
}

export default function ChatHistory({ messages, className = '' }: ChatHistoryProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <div
          key={`${message.timestamp}-${index}`}
          className={`flex ${message.type === 'USER' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'USER'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs mt-1 opacity-60">{message.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
