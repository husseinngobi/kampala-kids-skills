import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Temporary Video Debugger Block Component
 * 
 * This component temporarily replaces the VideoDebugger to prevent infinite API loops
 * during development debugging. It displays a maintenance message instead of making
 * API calls to the problematic Supabase gallery endpoint.
 */
const TempVideoDebuggerBlock: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Development Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          Video Debugger temporarily disabled to prevent infinite API loops.
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Video Debugger - Temporarily Disabled
        </h2>
        <p className="text-gray-600 mb-6">
          The Video Debugger component is temporarily unavailable during API troubleshooting.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
          <p className="font-medium">Technical Details:</p>
          <p>VideoDebugger API calls temporarily disabled</p>
          <p>Component: VideoDebugger.tsx → TempVideoDebuggerBlock.tsx</p>
        </div>
      </div>
    </div>
  );
};

export default TempVideoDebuggerBlock;