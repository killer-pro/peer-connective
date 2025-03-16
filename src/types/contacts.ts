
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
  nickname?: string;
  groups?: (number | ContactGroup)[];
  is_favorite: boolean;
  notes?: string;
  created_at: string;
}
