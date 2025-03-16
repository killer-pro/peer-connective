import { apiService } from './api';

// User profile interface that matches the API response
export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    profile_image: string | null;
    online_status: boolean;
    last_seen: string;
}

// Interface for update profile request
export interface UserProfileUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string | null;
    online_status?: boolean;
}

// User services API wrapper
export const userService = {
    // Get the current user's profile
    getUserProfile: async (): Promise<UserProfile> => {
        return apiService.get<UserProfile>('/users/me/');
    },

    // Update the user's profile
    updateProfile: async (data: UserProfileUpdate): Promise<UserProfile> => {
        return apiService.patch<UserProfile>('/users/users/update_profile/', data);
    },

    // Upload profile image
    uploadProfileImage: async (imageFile: File): Promise<UserProfile> => {
        const formData = new FormData();
        formData.append('profile_image', imageFile);

        return apiService.patchForm<UserProfile>('/users/users/update_profile/', formData);
    },

    // Update user online status
    updateOnlineStatus: async (status: boolean): Promise<UserProfile> => {
        console.log('Updating status to:', status); // Debug log
        return apiService.patch<UserProfile>('/users/users/update_profile/', { online_status: status });
    },

    // Change password
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        return apiService.post('/users/change-password/', {
            old_password: oldPassword,
            new_password: newPassword
        });
    },
};