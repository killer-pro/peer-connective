
import { useEffect } from 'react';
import { useIncomingCalls } from '@/hooks/useIncomingCalls';
import { toast } from 'sonner';

const IncomingCallHandler = () => {
  const { isConnected, incomingCall, acceptCall, rejectCall } = useIncomingCalls();
  
  useEffect(() => {
    console.log('IncomingCallHandler connected:', isConnected);
    
    if (incomingCall) {
      console.log('IncomingCallHandler received call:', incomingCall);
      
      // Show a toast notification for incoming call
      toast.info(
        `Incoming ${incomingCall.call_type} call from ${incomingCall.initiator_details.username}`, 
        {
          id: `call-${incomingCall.id}`, // Use ID to prevent duplicate toasts
          duration: 20000, // 20 seconds
          action: {
            label: 'Answer',
            onClick: () => acceptCall(incomingCall.id),
          },
          onDismiss: () => rejectCall(incomingCall.id),
        }
      );
    }
  }, [isConnected, incomingCall, acceptCall, rejectCall]);
  
  return null; // This component doesn't render anything
};

export default IncomingCallHandler;
