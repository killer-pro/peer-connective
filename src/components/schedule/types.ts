
import { CallType, CallStatus } from '@/types/call';

export interface ScheduledCallDisplay {
  id: string;
  title: string;
  callType: CallType;  // Changed from call_type to callType
  scheduledTime: Date | string;  // Changed from scheduled_time to scheduledTime
  participants: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
  isGroupCall: boolean;  // Changed from is_group_call to isGroupCall
  status: CallStatus;
  description?: string;
}
