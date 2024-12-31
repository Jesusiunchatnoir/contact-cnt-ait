import React from 'react';

interface Message {
  type: 'text' | 'file' | 'system';
  username?: string;
  content?: string;
  fileData?: string;
  fileType?: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (message.type === 'system') {
    return (
      <div className="py-2 px-4 bg-gray-800/50 rounded-lg text-gray-400 text-sm">
        {message.content}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-red-400">{message.username}</span>
        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
      </div>
      
      {message.type === 'text' && (
        <p className="text-gray-200">{message.content}</p>
      )}
      
      {message.type === 'file' && message.fileType?.startsWith('image/') && (
        <img 
          src={message.fileData} 
          alt="Shared image"
          className="max-w-sm rounded-lg"
          loading="lazy"
        />
      )}
      
      {message.type === 'file' && message.fileType?.startsWith('video/') && (
        <video 
          src={message.fileData} 
          controls
          className="max-w-sm rounded-lg"
        />
      )}
    </div>
  );
};