
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/services/userService";

interface StatusSectionProps {
  userProfile: UserProfile;
  onStatusChange: (checked: boolean) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  userProfile,
  onStatusChange
}) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="online-status"
            checked={userProfile.online_status}
            onCheckedChange={onStatusChange}
          />
          <Label htmlFor="online-status">Show as Online</Label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Current Status:</Label>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              userProfile.online_status ? "bg-emerald-500" : "bg-gray-400"
            }`}></span>
            <span>{userProfile.online_status ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Last seen: {new Date(userProfile.last_seen).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default StatusSection;
