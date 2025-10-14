import React from 'react';
// import VideoDebugger from '@/components/VideoDebugger'; // Temporarily disabled to fix infinite loop
import TempVideoDebuggerBlock from '@/components/TempVideoDebuggerBlock';

const DebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TempVideoDebuggerBlock />
    </div>
  );
};

export default DebugPage;