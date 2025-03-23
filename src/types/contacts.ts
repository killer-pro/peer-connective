
import { User } from './user';

export interface ContactGroup {
  id: number;
  name: string;
  owner: number | User;
  created_at: string;
}

export interface Contact {
  id: number;
  owner: number | User;
  contact_user: number | User;
  contact_user_details?: User;
  nickname?: string;
  groups?: ContactGroup[];
  is_favorite: boolean;
  notes?: string;
  phone?: string;
  last_contact?: string;
  created_at: string;
  
  // Derived fields for frontend use
  name?: string;
  email?: string;
  avatar?: string;
  online?: boolean;
  favorite?: boolean;
  tags?: string[];
}
