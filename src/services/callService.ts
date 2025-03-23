
import { apiService } from './api';
import { userService } from './userService';

// Types based on Django models
export interface Contact {
    id: string; // Kept as string for compatibility with CallsPage.tsx
    username: string;
    avatar?: string;
    email: string;
    status: 'online' | 'offline' | 'busy' | 'away';
}

export interface CallParticipant {
    id: number;
    user: number;
    user_details: {
        id: number;
        username: string;
        avatar?: string;
    };
    joined_at?: string;
    left_at?: string;
    has_accepted: boolean;
}

export interface CallData {
    id: number;
    initiator: number;
    initiator_details: {
        id: number;
        username: string;
        avatar?: string;
    };
    call_type: 'audio' | 'video';
    is_group_call: boolean;
    title?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
    scheduled_time?: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    participants_details: CallParticipant[];
    created_at: string;
    updated_at: string;
}

export interface CreateCallData {
    initiator: number;
    call_type: 'audio' | 'video';
    is_group_call: boolean;
    title?: string;
    participants: number[];
    status?: 'planned' | 'in_progress';
    scheduled_time?: string;
    start_time?: string;
    end_time?: string;
    recording_path?: string;
}

export const CallService = {
    // Fetching calls
    getAllCalls: async (): Promise<CallData[]> => {
        return apiService.get<CallData[]>('/calls/me');
    },

    // Get recent calls (completed, missed, cancelled)
    getCallHistory: async (): Promise<CallData[]> => {
        // Using the dedicated endpoint for history
        return apiService.get<CallData[]>('/calls/me/history/');
    },

    // Get scheduled calls
    getScheduledCalls: async (): Promise<CallData[]> => {
        // Using the dedicated endpoint for scheduled calls
        return apiService.get<CallData[]>('/calls/me/scheduled/');
    },

    // Start a new call
    startCall: async (data: CreateCallData): Promise<CallData> => {
        const newCall = await apiService.post<CallData>('/calls/me/', {
            initiator: data.initiator,
            call_type: data.call_type,
            is_group_call: data.is_group_call,
            title: data.title,
            participants: data.participants,
            status: data.status || 'planned',
            scheduled_time: data.scheduled_time,
            start_time: data.start_time,
            end_time: data.end_time,
            recording_path: data.recording_path
        });

        // Start the created call if it's immediate
        if (data.status === 'in_progress') {
            return apiService.post<CallData>(`/calls/me/${newCall.id}/start/`, {});
        }
        
        return newCall;
    },

    // Join a call
    joinCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/me/${callId}/join/`, {});
    },

    // Leave a call
    leaveCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/me/${callId}/leave/`, {});
    },

    // End a call
    endCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/me/${callId}/end/`, {});
    },

    // Get call details
    getCallDetails: async (callId: number): Promise<CallData> => {
        return apiService.get<CallData>(`/calls/me/${callId}/`);
    },

    // Get contacts (users)
    getContacts: async (): Promise<Contact[]> => {
        const users = await apiService.get<any[]>('/users/users/');

        // Convert API format to expected format for CallsPage
        return users.map(user => ({
            id: user.id.toString(), // Convert to string for compatibility
            username: user.username,
            avatar: user.profile_image,
            email: user.email,
            status: user.online_status ? 'online' : 'offline', // Simple status conversion
        }));
    },

    // Get favorite contacts
    getFavoriteContacts: async (): Promise<Contact[]> => {
        const favorites = await apiService.get<any[]>('/contacts/me/favorites/');

        // Convert API format to expected format for CallsPage
        return favorites.map(contact => ({
            id: contact.contact_user.toString(), // Convert to string for compatibility
            username: contact.contact_user_details.username,
            avatar: contact.contact_user_details.profile_image,
            email: contact.contact_user_details.email,
            status: contact.contact_user_details.online_status ? 'online' : 'offline',
        }));
    },

    // Add a message to a call
    addCallMessage: async (callId: number, content: string): Promise<unknown> => {
        return apiService.post<unknown>(`/calls/${callId}/messages/`, {
            content
        });
    },

    // Get messages for a call
    getCallMessages: async (callId: number): Promise<unknown[]> => {
        return apiService.get<unknown[]>(`/calls/${callId}/messages/`);
    },

    // Get current user
    getCurrentUser: async () => {
        return userService.getUserProfile();
    },

    // Format duration in HH:MM:SS
    formatDuration: (seconds?: number): string => {
        if (!seconds) return '00:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Format date for display
    formatDate: (dateString?: string): string => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }
};

export default CallService;
