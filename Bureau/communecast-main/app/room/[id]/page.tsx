'use client';

import { useParams } from 'next/navigation';
import VideoRoom from '@/components/VideoRoom';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  return <VideoRoom roomId={roomId} />;
}