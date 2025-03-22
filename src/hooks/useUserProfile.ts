
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { userService, UserProfile, UserProfileUpdate } from "@/services/userService";

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile();
      if (profile.profile_image) {
        profile.profile_image = `${profile.profile_image}?t=${new Date().getTime()}`;
      }
      setUserProfile(profile);
      setEditedProfile(profile);
    } catch (err) {
      setError("Failed to load profile data");
      toast({
        title: "Error",
        description: "Could not load profile data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!editedProfile) return false;

    try {
      const updateData: UserProfileUpdate = {
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        email: editedProfile.email,
        phone_number: editedProfile.phone_number,
      };

      const updatedProfile = await userService.updateProfile(updateData);
      setUserProfile(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      return true;
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadProfileImage = async (file: File) => {
    try {
      const updatedProfile = await userService.uploadProfileImage(file);
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);

      toast({
        title: "Image Uploaded",
        description: "Your profile image has been updated successfully.",
      });
      return true;
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOnlineStatus = async (status: boolean) => {
    try {
      // Update the local state first for immediate feedback
      if (userProfile) {
        const updatedLocalProfile = {
          ...userProfile,
          online_status: status
        };
        setUserProfile(updatedLocalProfile);
      }

      // Then send the update to the server
      const updatedProfile = await userService.updateOnlineStatus(status);

      // Update with the server response
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);

      toast({
        title: "Status Updated",
        description: `You are now ${status ? 'online' : 'offline'}`,
      });
      return true;
    } catch (err) {
      // Revert the local state if the server update fails
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          online_status: !status
        });
        if (editedProfile) {
          setEditedProfile({
            ...editedProfile,
            online_status: !status
          });
        }
      }

      toast({
        title: "Status Update Failed",
        description: "Could not update your online status.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    userProfile,
    editedProfile,
    loading,
    error,
    imageLoading,
    setImageLoading,
    setEditedProfile,
    saveProfile,
    uploadProfileImage,
    updateOnlineStatus,
    loadUserProfile
  };
}
