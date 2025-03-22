
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface RecordingsHeaderProps {
  onExportAll: () => void;
}

const RecordingsHeader = ({ onExportAll }: RecordingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Recordings</h1>
      <Button variant="outline" className="gap-2" onClick={onExportAll}>
        <ArrowUpRight className="h-4 w-4" />
        <span>Export All</span>
      </Button>
    </div>
  );
};

export default RecordingsHeader;
