
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  PlayIcon, 
  Trash2, 
  Share2,
  Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Recording } from "@/hooks/useRecordings";

interface RecordingCardProps {
  recording: Recording;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

const RecordingCard = ({ 
  recording, 
  onDownload, 
  onShare, 
  onDelete 
}: RecordingCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio/video playback
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {recording.thumbnailUrl ? (
          <img 
            src={recording.thumbnailUrl} 
            alt={recording.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-white">
            <span className="text-lg font-medium">{recording.title}</span>
            <span className="text-sm opacity-80">{recording.duration}</span>
          </div>
        )}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute inset-0 m-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full"
          onClick={togglePlay}
        >
          <PlayIcon className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <Slider 
            value={[progress]} 
            min={0} 
            max={100} 
            step={1}
            onValueChange={(vals) => setProgress(vals[0])}
            className="my-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isPlaying ? "00:24" : "00:00"}</span>
            <span>{recording.duration}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-start mt-3">
          <div>
            <h3 className="font-medium">{recording.title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{recording.date}</span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onDownload(recording.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onShare(recording.id)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(recording.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex mt-3 -space-x-2">
          {recording.participants.slice(0, 4).map((participant, i) => (
            <Avatar key={participant.id} className={`h-8 w-8 border-2 border-background ${i > 0 ? "ml-[-8px]" : ""}`}>
              <AvatarImage src={participant.avatar} alt={participant.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {participant.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          {recording.participants.length > 4 && (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-background ml-[-8px]">
              +{recording.participants.length - 4}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingCard;
