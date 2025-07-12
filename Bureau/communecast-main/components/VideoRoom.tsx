'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  Phone, 
  MessageSquare, 
  Send,
  Lock,
  Users,
  Copy,
  X,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { encryptMessage, decryptMessage, generateKeyPair } from '@/lib/crypto';
import Logo from './Logo';
import { toast } from '@/hooks/use-toast';

interface Peer {
  id: string;
  pseudo: string;
  stream?: MediaStream;
}

interface ChatMessage {
  id: string;
  pseudo: string;
  message: string;
  timestamp: number;
  encrypted: boolean;
}

interface VideoRoomProps {
  roomId: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId }) => {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  useEffect(() => {
    const savedPseudo = localStorage.getItem('communecast-pseudo');
    if (!savedPseudo) {
      router.push('/');
      return;
    }
    setPseudo(savedPseudo);
    
    // Generate encryption key pair for this session
    const keyPair = generateKeyPair();
    setEncryptionKey(keyPair.privateKey);
    
    initializeSocket();
    getUserMedia();

    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const initializeSocket = () => {
    const socketConnection = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
    
    socketConnection.on('connect', () => {
      setIsConnected(true);
      socketConnection.emit('join-room', { roomId, pseudo });
    });

    socketConnection.on('user-joined', (data: { id: string; pseudo: string }) => {
      createPeerConnection(data.id, data.pseudo, true);
    });

    socketConnection.on('user-left', (userId: string) => {
      handleUserLeft(userId);
    });

    socketConnection.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string; pseudo: string }) => {
      await handleOffer(data.offer, data.from, data.pseudo);
    });

    socketConnection.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      await handleAnswer(data.answer, data.from);
    });

    socketConnection.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      await handleIceCandidate(data.candidate, data.from);
    });

    socketConnection.on('chat-message', (message: Omit<ChatMessage, 'id'>) => {
      const decryptedMessage = decryptMessage(message.message, encryptionKey);
      setChatMessages(prev => [...prev, {
        ...message,
        id: Date.now().toString(),
        message: decryptedMessage,
        encrypted: true
      }]);
    });

    socketConnection.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketConnection);
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const createPeerConnection = (userId: string, userPseudo: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers });
    
    pc.ontrack = (event) => {
      setPeers(prev => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(userId) || { id: userId, pseudo: userPseudo };
        peer.stream = event.streams[0];
        newPeers.set(userId, peer);
        return newPeers;
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        handleUserLeft(userId);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnections.current.set(userId, pc);
    setPeers(prev => {
      const newPeers = new Map(prev);
      newPeers.set(userId, { id: userId, pseudo: userPseudo });
      return newPeers;
    });

    if (isInitiator) {
      createOffer(userId);
    }
  };

  const createOffer = async (userId: string) => {
    const pc = peerConnections.current.get(userId);
    if (!pc || !socket) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { offer, to: userId });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, userId: string, userPseudo: string) => {
    createPeerConnection(userId, userPseudo, false);
    const pc = peerConnections.current.get(userId);
    if (!pc || !socket) return;

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { answer, to: userId });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, userId: string) => {
    const pc = peerConnections.current.get(userId);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, userId: string) => {
    const pc = peerConnections.current.get(userId);
    if (!pc) return;

    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleUserLeft = (userId: string) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
    setPeers(prev => {
      const newPeers = new Map(prev);
      newPeers.delete(userId);
      return newPeers;
    });
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update local stream
        if (localStream) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          oldVideoTrack.stop();
          localStream.removeTrack(oldVideoTrack);
          localStream.addTrack(videoTrack);
        }

        videoTrack.onended = () => {
          setIsScreenSharing(false);
          getUserMedia(); // Restart camera
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      setIsScreenSharing(false);
      getUserMedia(); // Restart camera
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !encryptionKey) return;

    const encryptedMessage = encryptMessage(newMessage, encryptionKey);
    const message: Omit<ChatMessage, 'id'> = {
      pseudo,
      message: encryptedMessage,
      timestamp: Date.now(),
      encrypted: true
    };

    socket.emit('chat-message', { ...message, roomId });
    
    // Add to local chat
    setChatMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString(),
      message: newMessage, // Show decrypted locally
    }]);
    
    setNewMessage('');
  };

  const leaveRoom = () => {
    cleanup();
    router.push('/');
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    if (socket) {
      socket.disconnect();
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Lien copié !',
      description: 'Le lien de la salle a été copié dans le presse-papiers.',
    });
  };

  const videoCount = peers.size + (localStream ? 1 : 0);
  const gridClass = videoCount === 1 ? 'single' : videoCount === 2 ? 'dual' : 'multiple';

  return (
    <div className="h-screen anarcho-flag flex flex-col">
      {/* Header anarchiste */}
      <header className="anarcho-flag border-b-4 border-red-700 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="rounded bg-white/90 p-1 shadow-lg" style={{boxShadow:'0 2px 12px #000'}}>
            <Logo className="h-10 w-auto anarchist-glow" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white drop-shadow-lg" style={{textShadow:'2px 2px 8px #000'}}>Assemblée&nbsp;: <span className="text-white" style={{textShadow:'2px 2px 8px #000'}}>{roomId}</span></h1>
            <div className="flex items-center space-x-2 text-sm text-white" style={{textShadow:'1px 1px 6px #000'}}>
              <Users className="w-4 h-4 text-white" />
              <span>{peers.size + 1} révolutionnaire(s)</span>
              {isConnected && (
                <Badge variant="outline" className="border-white text-white bg-red-700/80 encrypted-indicator">
                  <Shield className="w-3 h-3 mr-1 text-white" />
                  E2EE Actif
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={copyRoomLink}
            variant="default"
            size="sm"
            className="bg-red-700 text-white hover:bg-white hover:text-red-700 border-2 border-white font-bold shadow commune-button"
          >
            <Copy className="w-4 h-4 mr-1" />
            Partager
          </Button>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant={showChat ? "default" : "outline"}
            size="sm"
            className={cn(
              showChat 
                ? "bg-white text-red-700 font-bold border-2 border-red-700 commune-button" 
                : "bg-black text-white border-2 border-white hover:bg-white hover:text-red-700 font-bold commune-button"
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className={cn("video-grid h-full", gridClass)}>
            {/* Local Video */}
            {localStream && (
              <Card className="relative commune-card border-red-600/30 overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded text-sm text-white border border-red-600/30" style={{textShadow:'1px 1px 6px #000'}}>
                  {pseudo} (vous)
                </div>
                {!isVideoOn && (
                  <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-red-400" />
                  </div>
                )}
              </Card>
            )}

            {/* Remote Videos */}
            {Array.from(peers.entries()).map(([id, peer]) => (
              <Card key={id} className="relative commune-card border-red-600/30 overflow-hidden">
                {peer.stream ? (
                  <video
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && peer.stream) {
                        video.srcObject = peer.stream;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E10600 50%, #000 50%)' }}>
                    <div className="text-center bg-black/70 rounded-lg p-6 border-2 border-black shadow-lg">
                      <Users className="w-16 h-16 text-black mx-auto mb-2" />
                      <p className="text-white font-bold text-lg" style={{ textShadow: '1px 1px 0 #E10600' }}>En connexion...</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded text-sm text-white border border-red-600/30" style={{textShadow:'1px 1px 6px #000'}}>
                  {peer.pseudo}
                </div>
              </Card>
            ))}
          </div>

          {/* Controls anarchistes */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2 bg-black/90 backdrop-blur-sm rounded-full p-3 border border-red-600/30">
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "destructive"}
                size="sm"
                className={isVideoOn ? "commune-button" : "bg-red-700 hover:bg-red-600"}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleAudio}
                variant={isAudioOn ? "default" : "destructive"}
                size="sm"
                className={isAudioOn ? "commune-button" : "bg-red-700 hover:bg-red-600"}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleScreenShare}
                variant={isScreenSharing ? "default" : "outline"}
                size="sm"
                className={isScreenSharing 
                  ? "commune-button" 
                  : "border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                }
              >
                {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={leaveRoom}
                variant="destructive"
                size="sm"
                className="bg-red-700 hover:bg-red-600"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar anarchiste */}
        {showChat && (
          <div className="w-80 commune-card border-l border-red-600/40 flex flex-col">
            <div className="p-4 border-b border-red-600/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-red-400">Chat révolutionnaire</h3>
                <Button
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-600/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-red-500" />
                Messages chiffrés E2EE
              </p>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-red-400">{msg.pseudo}</span>
                      {msg.encrypted && (
                        <Lock className="w-3 h-3 text-green-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 break-words bg-black/40 p-2 rounded border border-red-600/20">
                      {msg.message}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-red-600/30">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message révolutionnaire..."
                  className="commune-input text-white placeholder-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="commune-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRoom;