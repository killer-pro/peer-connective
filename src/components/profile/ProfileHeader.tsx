
import React from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/services/userService";

interface ProfileHeaderProps {
  userProfile: UserProfile;
  editMode: boolean;
  imageLoading: boolean;
  onCancelEdit: () => void;
  onSaveProfile: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setImageLoading: (loading: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  editMode,
  imageLoading,
  onCancelEdit,
  onSaveProfile,
  onImageUpload,
  setImageLoading
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {imageLoading && userProfile.profile_image && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 rounded-full z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={userProfile.profile_image || undefined}
            alt={`${userProfile.first_name} ${userProfile.last_name}`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-4xl">
            {`${userProfile.first_name[0] || ''}${userProfile.last_name[0] || ''}`}
          </AvatarFallback>
        </Avatar>
        {editMode && (
          <div className="absolute bottom-0 right-0">
            <label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary">
                <Camera className="h-4 w-4" />
              </div>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageUpload}
              />
            </label>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSaveProfile}>
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold">{`${userProfile.first_name} ${userProfile.last_name}`}</h2>
          <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
