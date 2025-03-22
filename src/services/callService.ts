import { apiService } from './api';
import { userService } from './userService';

// Types basés sur les modèles Django
export interface Contact {
    id: string; // Conservé comme string pour être compatible avec CallsPage.tsx
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
    // Récupérer tous les appels
    getAllCalls: async (): Promise<CallData[]> => {
        return apiService.get<CallData[]>('/calls/');
    },

    // Récupérer les appels récents (complétés, manqués, annulés)
    getCallHistory: async (): Promise<CallData[]> => {
        // Utilisation de l'endpoint dédié pour l'historique
        return apiService.get<CallData[]>('/calls/history/');
    },

    // Récupérer les appels planifiés
    getScheduledCalls: async (): Promise<CallData[]> => {
        // Utilisation de l'endpoint dédié pour les appels planifiés
        return apiService.get<CallData[]>('/calls/scheduled/');
    },

    // Démarrer un nouvel appel
    startCall: async (data: CreateCallData): Promise<CallData> => {
        const newCall = await apiService.post<CallData>('/calls/', {
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

        // Démarrer l'appel créé
        return apiService.post<CallData>(`/calls/${newCall.id}/start/`, {});
    },

    // Rejoindre un appel
    joinCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/${callId}/join/`, {});
    },

    // Quitter un appel
    leaveCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/${callId}/leave/`, {});
    },

    // Terminer un appel
    endCall: async (callId: number): Promise<CallData> => {
        return apiService.post<CallData>(`/calls/${callId}/end/`, {});
    },

    // Récupérer les détails d'un appel
    getCallDetails: async (callId: number): Promise<CallData> => {
        return apiService.get<CallData>(`/calls/${callId}/`);
    },

    // Récupérer les contacts (utilisateurs)
    getContacts: async (): Promise<Contact[]> => {
        const users = await apiService.get<any[]>('users/users/');

        // Convertir le format de l'API en format attendu par CallsPage
        return users.map(user => ({
            id: user.id.toString(), // Conversion en string pour compatibilité
            username: user.username,
            avatar: user.profile_image,
            email: user.email,
            status: user.online_status ? 'online' : 'offline', // Conversion simple du statut
        }));
    },

    // Récupérer les contacts favoris
    getFavoriteContacts: async (): Promise<Contact[]> => {
        const favorites = await apiService.get<any[]>('/contacts/me/favorites/');

        // Convertir le format de l'API en format attendu par CallsPage
        return favorites.map(contact => ({
            id: contact.contact_user.toString(), // Conversion en string pour compatibilité
            username: contact.contact_user_details.username,
            avatar: contact.contact_user_details.profile_image,
            email: contact.contact_user_details.email,
            status: contact.contact_user_details.online_status ? 'online' : 'offline',
        }));
    },

    // Ajouter un message à un appel
    addCallMessage: async (callId: number, content: string): Promise<unknown> => {
        return apiService.post<unknown>(`/calls/messages/`, {
            call: callId,
            content
        });
    },

    // Récupérer les messages d'un appel
    getCallMessages: async (callId: number): Promise<unknown[]> => {
        return apiService.get<unknown[]>(`/calls/messages/?call=${callId}`);
    },

    // Récupérer l'utilisateur actuel
    getCurrentUser: async () => {
        return userService.getUserProfile();
    },

    // Formater la durée en HH:MM:SS
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

    // Formater la date pour l'affichage
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
