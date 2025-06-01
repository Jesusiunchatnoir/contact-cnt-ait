import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Vérifier la taille du fichier
      if (file.size > 50 * 1024 * 1024) { // 50MB
        alert('Le fichier est trop volumineux (max 50MB)');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Seules les images sont acceptées');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        if (!fileData) {
          alert('Erreur lors de la lecture du fichier');
          return;
        }
        
        onSendFile(file);
      };
      reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      alert('Erreur lors du traitement du fichier');
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-black px-2.5 py-1.5 text-sm sm:text-base text-red-100 border-2 border-red-900/50 focus:border-red-600 focus:outline-none rounded placeholder-red-800"
        />
        <div className="flex gap-1.5">
          <label className="cursor-pointer flex items-center justify-center w-8 h-[34px] bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-700 transition-colors rounded">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-base sm:text-lg">📷</span>
          </label>
          <button
            type="submit"
            className="w-8 h-[34px] flex items-center justify-center bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-700 transition-colors rounded"
          >
            <span className="text-base sm:text-lg">➤</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;