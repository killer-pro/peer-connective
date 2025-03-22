
import Layout from "@/components/layout/Layout";
import RecordingsHeader from "@/components/recordings/RecordingsHeader";
import RecordingsList from "@/components/recordings/RecordingsList";
import { useRecordings } from "@/hooks/useRecordings";

const RecordingsPage = () => {
  const { 
    recordings, 
    downloadRecording, 
    shareRecording, 
    deleteRecording, 
    exportAllRecordings 
  } = useRecordings();

  return (
    <Layout>
      <div className="space-y-6">
        <RecordingsHeader onExportAll={exportAllRecordings} />
        <RecordingsList 
          recordings={recordings}
          onDownload={downloadRecording}
          onShare={shareRecording}
          onDelete={deleteRecording}
        />
      </div>
    </Layout>
  );
};

export default RecordingsPage;
