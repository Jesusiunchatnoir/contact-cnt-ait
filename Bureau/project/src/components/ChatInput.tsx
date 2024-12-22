import React, { useState, useRef } from 'react';
import { Image, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        onSendFile(file);
      } else {
        alert('Seuls les images et les vidéos sont acceptées');
      }
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 border-t border-gray-700">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <Image className="w-6 h-6 text-gray-400" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-6 h-6 text-white" />
        </button>
      </div>
    </form>
  );
};