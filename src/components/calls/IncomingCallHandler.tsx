
import { useEffect } from 'react';
import { useIncomingCalls } from '@/hooks/useIncomingCalls';

const IncomingCallHandler = () => {
  const { isConnected, incomingCall } = useIncomingCalls();
  
  useEffect(() => {
    // This component doesn't render anything visible,
    // it just subscribes to incoming calls
    console.log('IncomingCallHandler connected:', isConnected);
    
    if (incomingCall) {
      console.log('IncomingCallHandler received call:', incomingCall);
    }
  }, [isConnected, incomingCall]);
  
  return null; // This component doesn't render anything
};

export default IncomingCallHandler;
