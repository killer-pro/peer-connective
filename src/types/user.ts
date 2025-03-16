
export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  profile_image?: string | null;
  online_status: boolean;
  last_seen?: string | null;
}

export interface UserStatus {
  user: number | User;
  session_id?: string;
  is_in_call: boolean;
  device_info?: any;
  last_ping: string;
}
