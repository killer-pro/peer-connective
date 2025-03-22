
import RecordingCard from "./RecordingCard";
import { Recording } from "@/hooks/useRecordings";

interface RecordingsListProps {
  recordings: Recording[];
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

const RecordingsList = ({
  recordings,
  onDownload,
  onShare,
  onDelete
}: RecordingsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recordings.map((recording) => (
        <RecordingCard 
          key={recording.id} 
          recording={recording} 
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default RecordingsList;
