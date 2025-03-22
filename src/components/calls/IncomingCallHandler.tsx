
import { useEffect } from 'react';
import { useIncomingCalls } from '@/hooks/useIncomingCalls';

const IncomingCallHandler = () => {
  const { isConnected } = useIncomingCalls();
  
  useEffect(() => {
    // This component doesn't render anything visible,
    // it just subscribes to incoming calls
    console.log('IncomingCallHandler connected:', isConnected);
  }, [isConnected]);
  
  return null; // This component doesn't render anything
};

export default IncomingCallHandler;
