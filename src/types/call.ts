
import { User } from '@/types/user';

export type CallType = 'audio' | 'video';
export type CallStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';

export interface Call {
  id: number;
  initiator: number | User;
  participants: User[] | number[];
  call_type: CallType;
  is_group_call: boolean;
  title?: string;
  status: CallStatus;
  scheduled_time?: string;
  start_time?: string;
  end_time?: string;
  recording_path?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface CallParticipant {
  id: number;
  call: number | Call;
  user: number | User;
  joined_at?: string;
  left_at?: string;
  has_accepted: boolean;
}

export interface CallMessage {
  id: number;
  call: number | Call;
  sender: number | User;
  content: string;
  timestamp: string;
}

export interface ScheduledCall {
  id: string | number;
  title: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: string;
  participants: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
  description?: string;
  isGroup: boolean;
  callType?: CallType;
  scheduledTime?: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'incoming_call';
  call: number;
  sender: number;
  receiver: number;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  callId?: number;
}
