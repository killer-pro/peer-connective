
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/services/userService";

interface ProfileFormProps {
  userProfile: UserProfile;
  editedProfile: UserProfile | null;
  editMode: boolean;
  setEditedProfile: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  userProfile,
  editedProfile,
  editMode,
  setEditedProfile
}) => {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          {editMode && editedProfile ? (
            <Input
              id="firstName"
              value={editedProfile.first_name}
              onChange={(e) => setEditedProfile({...editedProfile, first_name: e.target.value})}
            />
          ) : (
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              {userProfile.first_name}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          {editMode && editedProfile ? (
            <Input
              id="lastName"
              value={editedProfile.last_name}
              onChange={(e) => setEditedProfile({...editedProfile, last_name: e.target.value})}
            />
          ) : (
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              {userProfile.last_name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {editMode && editedProfile ? (
            <Input
              id="email"
              value={editedProfile.email}
              onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
            />
          ) : (
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              {userProfile.email}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {editMode && editedProfile ? (
            <Input
              id="phone"
              value={editedProfile.phone_number || ""}
              onChange={(e) => setEditedProfile({...editedProfile, phone_number: e.target.value})}
            />
          ) : (
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              {userProfile.phone_number || "Not provided"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
