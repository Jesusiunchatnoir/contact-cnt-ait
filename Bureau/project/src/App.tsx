import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { VideoCall } from './components/VideoCall';
import { Maximize2, MessageSquare, Video } from 'lucide-react';

interface Message {
  type: 'text' | 'file' | 'system';
  username?: string;
  content?: string;
  fileData?: string;
  fileType?: string;
  timestamp: number;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('chat message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (name: string) => {
    setUsername(name);
    socket?.emit('register', name);
  };

  const handleSendMessage = (message: string) => {
    const messageData: Message = {
      type: 'text',
      username,
      content: message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, messageData]);
  };

  const handleSendFile = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as string;
        const messageData: Message = {
          type: 'file',
          username,
          fileData,
          fileType: file.type,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, messageData]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!username) {
    return <WelcomeScreen onJoin={handleJoin} />;
  }

  return (
    <>
      {isInCall && socket && (
        <VideoCall
          socket={socket}
          username={username}
          onClose={() => setIsInCall(false)}
        />
      )}
      
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <header className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold">LiberChat</h1>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsInCall(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Video className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </main>

        <ChatInput onSendMessage={handleSendMessage} onSendFile={handleSendFile} />
      </div>
    </>
  );
}

export default App;