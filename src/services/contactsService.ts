
import { apiService } from './api';

// Interface pour le format du backend
export interface BackendContact {
    id: number;
    contact_user: number;
    contact_user_details: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        profile_image: string | null;
        online_status: boolean;
        last_seen: string | null;
    };
    nickname: string;
    groups: {
        id: number;
        name: string;
        created_at: string;
    }[];
    is_favorite: boolean;
    notes: string;
    created_at: string;
    // Nouveaux champs harmonisés pour le frontend
    name: string;
    email: string;
    avatar: string;
    phone: string | null;
    online: boolean;
    favorite: boolean;
    lastContact: string;
    tags: string[];
}

export interface ContactCreate {
    contact_user: number;
    nickname?: string;
    is_favorite?: boolean;
    notes?: string;
    phone?: string;
}

export const contactsService = {
    // Récupérer tous les contacts
    getContacts: async (): Promise<BackendContact[]> => {
        return apiService.get<BackendContact[]>('/contacts/me');
    },

    // Récupérer un contact spécifique
    getContact: async (contactId: number): Promise<BackendContact> => {
        return apiService.get<BackendContact>(`/contacts/${contactId}/`);
    },

    // Créer un nouveau contact
    createContact: async (data: ContactCreate): Promise<BackendContact> => {
        return apiService.post<BackendContact>('/contacts/me/', data);
    },

    // Mettre à jour un contact
    updateContact: async (contactId: number, data: Partial<ContactCreate>): Promise<BackendContact> => {
        return apiService.patch<BackendContact>(`/contacts/${contactId}/`, data);
    },

    // Supprimer un contact
    deleteContact: async (contactId: number): Promise<void> => {
        return apiService.delete(`/contacts/${contactId}/`);
    },

    // Ajouter/Retirer des favoris
    toggleFavorite: async (contactId: number): Promise<BackendContact> => {
        return apiService.post<BackendContact>(`/contacts/me/${contactId}/toggle_favorite/`, {});
    },

    // Rechercher des contacts
    searchContacts: async (query: string): Promise<BackendContact[]> => {
        return apiService.get<BackendContact[]>(`/contacts/?search=${query}`);
    },

    // Récupérer les contacts favoris
    getFavorites: async (): Promise<BackendContact[]> => {
        return apiService.get<BackendContact[]>('/contacts/me/favorites/');
    },

    // Récupérer les utilisateurs disponibles pour créer un contact
    getAvailableUsers: async (): Promise<BackendContact["contact_user_details"][]> => {
        return apiService.get<BackendContact["contact_user_details"][]>('/users/users');
    },

    // Ajouter un contact à un groupe
    addToGroup: async (contactId: number, groupId: number): Promise<BackendContact> => {
        return apiService.post<BackendContact>(`/contacts/${contactId}/add_to_group/`, { group_id: groupId });
    },

    // Retirer un contact d'un groupe
    removeFromGroup: async (contactId: number, groupId: number): Promise<BackendContact> => {
        return apiService.post<BackendContact>(`/contacts/${contactId}/remove_from_group/`, { group_id: groupId });
    },

    // Enregistrer un contact (mettre à jour la date du dernier contact)
    recordContact: async (contactId: number): Promise<BackendContact> => {
        return apiService.post<BackendContact>(`/contacts/${contactId}/record_contact/`, {});
    }
};
