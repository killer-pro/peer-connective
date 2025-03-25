
import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCallPageState } from "@/hooks/useCallPageState";
import CallPageLayout from "@/components/call/CallPageLayout";

const CallPage = () => {
  const navigate = useNavigate();
  const { callId } = useParams();
  const location = useLocation();
  
  // Verify callId is available
  const actualCallId = callId || "";
  if (!actualCallId) {
    toast.error("Missing call ID");
    navigate("/calls");
  }

  console.log("Call ID:", actualCallId);

  // Use our call page state hook
  const callPageState = useCallPageState(actualCallId, location.state);
  
  useEffect(() => {
    // Clean up function when component unmounts
    return () => {
      console.log("Call page unmounting, cleaning up");
      callPageState.endCall();
    };
  }, [callPageState.endCall]);

  return (
    <CallPageLayout {...callPageState} />
  );
};

export default CallPage;
