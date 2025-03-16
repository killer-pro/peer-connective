
export interface Contact {
  id: string;
  name: string;
  avatarUrl?: string;
  status: "online" | "offline" | "busy" | "away";
}

// Données de contact fictives
export const mockContacts: Contact[] = [
  { id: "1", name: "Emma Dupont", status: "online" },
  { id: "2", name: "Michel Chen", status: "busy" },
  { id: "3", name: "Sophie Martin", status: "offline" },
  { id: "4", name: "Jacques Rodriguez", status: "away" },
  { id: "5", name: "Olivia Durand", status: "online" },
  { id: "6", name: "Ethan Petit", status: "offline" }
];

export const getStatusColor = (status: Contact["status"]) => {
  switch (status) {
    case "online": return "bg-emerald-500";
    case "busy": return "bg-red-500";
    case "away": return "bg-amber-500";
    case "offline": return "bg-gray-400";
    default: return "bg-gray-400";
  }
};
