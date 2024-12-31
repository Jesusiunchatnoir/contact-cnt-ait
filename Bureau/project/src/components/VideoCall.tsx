import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Phone, PhoneOff, AlertCircle, Camera, CameraOff } from 'lucide-react';
import { VideoControls } from './VideoControls';
import { MediaDeviceSelector } from './MediaDeviceSelector';

interface VideoCallProps {
  socket: Socket;
  username: string;
  onClose: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ socket, username, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  const getMediaDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.warn('enumerateDevices not supported');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = devices.filter(device => 
        device.kind === 'videoinput' || device.kind === 'audioinput'
      );
      setDevices(filteredDevices);

      // Set default devices
      const defaultVideo = filteredDevices.find(d => d.kind === 'videoinput')?.deviceId;
      const defaultAudio = filteredDevices.find(d => d.kind === 'audioinput')?.deviceId;
      
      if (defaultVideo) setSelectedVideo(defaultVideo);
      if (defaultAudio) setSelectedAudio(defaultAudio);

      // Set audio-only mode if no video devices are available
      setIsAudioOnly(!filteredDevices.some(d => d.kind === 'videoinput'));
    } catch (err) {
      console.warn('Error enumerating devices:', err);
      setIsAudioOnly(true);
    }
  };

  const initializeMedia = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Les fonctionnalités média ne sont pas supportées sur ce navigateur');
      }

      await getMediaDevices();

      const constraints: MediaStreamConstraints = {
        video: !isAudioOnly && {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined
        },
        audio: {
          deviceId: selectedAudio ? { exact: selectedAudio } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
        }
      };

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (userVideo.current) {
          userVideo.current.srcObject = mediaStream;
        }
      } catch (mediaError) {
        // If video fails, try audio only
        if (!isAudioOnly) {
          console.warn('Video access failed, falling back to audio only:', mediaError);
          setIsAudioOnly(true);
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          setStream(audioStream);
        } else {
          throw mediaError;
        }
      }
    } catch (err) {
      console.error('Failed to access media devices:', err);
      let errorMessage = 'Impossible d\'accéder aux périphériques média';
      
      if (err instanceof Error) {
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'Aucun périphérique média trouvé. Veuillez connecter un microphone.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Accès refusé aux périphériques média. Veuillez autoriser l\'accès.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Le périphérique média est déjà utilisé par une autre application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Les contraintes de média spécifiées ne peuvent pas être satisfaites.';
        }
      }
      
      setError(errorMessage);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      if (mounted) {
        await initializeMedia();
      }
    };

    setup();

    // Listen for device changes
    const handleDeviceChange = () => {
      if (mounted) {
        getMediaDevices();
      }
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    socket.on('callUser', ({ from, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      
      if (stream) {
        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream,
        });

        peer.on('signal', (data) => {
          socket.emit('answerCall', { signal: data, to: from });
        });

        peer.on('stream', (remoteStream) => {
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = remoteStream;
          }
        });

        peer.signal(signal);
        peerRef.current = peer;
      }
    });

    return () => {
      mounted = false;
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (selectedVideo || selectedAudio) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      initializeMedia();
    }
  }, [selectedVideo, selectedAudio]);

  const callUser = (userId: string) => {
    if (!stream) {
      setError('Impossible de démarrer l\'appel. Vérifiez vos périphériques média.');
      return;
    }

    try {
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: userId,
          signalData: data,
          from: username,
        });
      });

      peer.on('stream', (remoteStream) => {
        if (partnerVideo.current) {
          partnerVideo.current.srcObject = remoteStream;
        }
      });

      socket.on('callAccepted', (signal) => {
        peer.signal(signal);
        setCallAccepted(true);
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('Error making call:', err);
      setError('Erreur lors de l\'appel. Veuillez réessayer.');
    }
  };

  const answerCall = () => {
    if (!stream) {
      setError('Impossible de répondre. Vérifiez vos périphériques média.');
      return;
    }

    try {
      setCallAccepted(true);
      setReceivingCall(false);

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on('signal', (data) => {
        socket.emit('answerCall', { signal: data, to: caller });
      });

      peer.on('stream', (remoteStream) => {
        if (partnerVideo.current) {
          partnerVideo.current.srcObject = remoteStream;
        }
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('Error answering call:', err);
      setError('Erreur lors de la réponse. Veuillez réessayer.');
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (!isAudioOnly && stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-6 rounded-lg text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl mb-4">Erreur</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden">
          {isAudioOnly ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <CameraOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Mode audio uniquement</p>
              </div>
            </div>
          ) : (
            <video
              playsInline
              muted
              ref={userVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full">
            Vous
          </div>
        </div>

        {callAccepted && (
          <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              playsInline
              ref={partnerVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full">
              {caller}
            </div>
          </div>
        )}
      </div>

      {!isAudioOnly && (
        <MediaDeviceSelector
          devices={devices}
          selectedVideo={selectedVideo}
          selectedAudio={selectedAudio}
          onVideoChange={setSelectedVideo}
          onAudioChange={setSelectedAudio}
        />
      )}

      <VideoControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        showVideoToggle={!isAudioOnly}
      />

      {receivingCall && !callAccepted && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl mb-4">{caller} vous appelle...</h3>
            <div className="flex space-x-4">
              <button
                onClick={answerCall}
                className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Phone className="w-6 h-6" />
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};