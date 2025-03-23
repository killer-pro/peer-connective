
import { apiService } from './api';
import { Contact, ContactGroup } from '@/types/contacts';

// Interface for received data from backend
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
    phone: string | null;
    last_contact: string | null;
    created_at: string;
}

// Interface for creating a new contact
export interface ContactCreate {
    contact_user: number;
    nickname?: string;
    is_favorite?: boolean;
    notes?: string;
    phone?: string;
}

// Type for both forms of contact data
export type ContactData = BackendContact & {
    name: string; 
    email: string;
    avatar: string;
    online: boolean;
    favorite: boolean;
    tags: string[];
};

export const contactsService = {
    // Récupérer tous les contacts
    getContacts: async (): Promise<ContactData[]> => {
        const contacts = await apiService.get<BackendContact[]>('/contacts/me');
        return contacts.map(transformContactData);
    },

    // Récupérer un contact spécifique
    getContact: async (contactId: number): Promise<ContactData> => {
        const contact = await apiService.get<BackendContact>(`/contacts/${contactId}/`);
        return transformContactData(contact);
    },

    // Créer un nouveau contact
    createContact: async (data: ContactCreate): Promise<ContactData> => {
        const contact = await apiService.post<BackendContact>('/contacts/me/', data);
        return transformContactData(contact);
    },

    // Mettre à jour un contact
    updateContact: async (contactId: number, data: Partial<ContactCreate>): Promise<ContactData> => {
        const contact = await apiService.patch<BackendContact>(`/contacts/${contactId}/`, data);
        return transformContactData(contact);
    },

    // Supprimer un contact
    deleteContact: async (contactId: number): Promise<void> => {
        return apiService.delete(`/contacts/${contactId}/`);
    },

    // Ajouter/Retirer des favoris
    toggleFavorite: async (contactId: number): Promise<ContactData> => {
        const contact = await apiService.post<BackendContact>(`/contacts/me/${contactId}/toggle_favorite/`, {});
        return transformContactData(contact);
    },

    // Rechercher des contacts
    searchContacts: async (query: string): Promise<ContactData[]> => {
        const contacts = await apiService.get<BackendContact[]>(`/contacts/?search=${query}`);
        return contacts.map(transformContactData);
    },

    // Récupérer les contacts favoris
    getFavorites: async (): Promise<ContactData[]> => {
        const contacts = await apiService.get<BackendContact[]>('/contacts/me/favorites/');
        return contacts.map(transformContactData);
    },

    // Récupérer les utilisateurs disponibles pour créer un contact
    getAvailableUsers: async (): Promise<BackendContact["contact_user_details"][]> => {
        return apiService.get<BackendContact["contact_user_details"][]>('/users/users');
    },

    // Ajouter un contact à un groupe
    addToGroup: async (contactId: number, groupId: number): Promise<ContactData> => {
        const contact = await apiService.post<BackendContact>(`/contacts/${contactId}/add_to_group/`, { group_id: groupId });
        return transformContactData(contact);
    },

    // Retirer un contact d'un groupe
    removeFromGroup: async (contactId: number, groupId: number): Promise<ContactData> => {
        const contact = await apiService.post<BackendContact>(`/contacts/${contactId}/remove_from_group/`, { group_id: groupId });
        return transformContactData(contact);
    },

    // Enregistrer un contact (mettre à jour la date du dernier contact)
    recordContact: async (contactId: number): Promise<ContactData> => {
        const contact = await apiService.post<BackendContact>(`/contacts/${contactId}/record_contact/`, {});
        return transformContactData(contact);
    },

    // Récupérer les groupes de contacts
    getContactGroups: async (): Promise<ContactGroup[]> => {
        return apiService.get<ContactGroup[]>('/contacts/groups/');
    },

    // Créer un groupe de contacts
    createContactGroup: async (name: string): Promise<ContactGroup> => {
        return apiService.post<ContactGroup>('/contacts/groups/', { name });
    }
};

// Helper function to transform backend contact data to frontend format
function transformContactData(contact: BackendContact): ContactData {
    const userDetails = contact.contact_user_details;
    
    return {
        ...contact,
        name: userDetails ? `${userDetails.first_name} ${userDetails.last_name}`.trim() || userDetails.username : '',
        email: userDetails ? userDetails.email : '',
        avatar: userDetails?.profile_image || '',
        online: userDetails?.online_status || false,
        favorite: contact.is_favorite,
        tags: contact.groups ? contact.groups.map(group => group.name) : []
    };
}
