
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Define recording data structure
export interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  thumbnailUrl?: string;
}

// Mock data
const mockRecordings: Recording[] = [
  {
    id: "1",
    title: "Weekly Team Meeting",
    date: "May 20, 2023",
    duration: "48:32",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
      { id: "4", name: "Jessica Chen", avatar: "" },
    ],
  },
  {
    id: "2",
    title: "Project Discussion",
    date: "May 18, 2023",
    duration: "32:15",
    participants: [
      { id: "2", name: "Taylor Swift", avatar: "" },
      { id: "5", name: "Marcus Johnson", avatar: "" },
    ],
  },
  {
    id: "3",
    title: "Client Presentation",
    date: "May 15, 2023",
    duration: "59:47",
    participants: [
      { id: "1", name: "Alex Morgan", avatar: "" },
      { id: "3", name: "Chris Evans", avatar: "" },
      { id: "6", name: "Sophia Williams", avatar: "" },
    ],
  },
];

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);

  const downloadRecording = (id: string) => {
    // Implementation pour télécharger l'enregistrement
    toast({
      title: "Download started",
      description: "Your recording download has started",
    });
  };

  const shareRecording = (id: string) => {
    // Implementation pour partager l'enregistrement
    toast({
      title: "Share link copied",
      description: "A link to this recording has been copied to your clipboard",
    });
  };

  const deleteRecording = (id: string) => {
    // Implementation pour supprimer l'enregistrement
    setRecordings(recordings.filter(recording => recording.id !== id));
    toast({
      title: "Recording deleted",
      description: "The recording has been successfully deleted",
      variant: "destructive",
    });
  };

  const exportAllRecordings = () => {
    // Implementation pour exporter tous les enregistrements
    toast({
      title: "Export started",
      description: "Your recordings are being exported",
    });
  };

  return {
    recordings,
    downloadRecording,
    shareRecording,
    deleteRecording,
    exportAllRecordings
  };
}
