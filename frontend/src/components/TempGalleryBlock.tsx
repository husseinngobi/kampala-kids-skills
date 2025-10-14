import React from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Temporary Gallery Block Component
 * 
 * This component temporarily replaces the Gallery page to prevent infinite API loops
 * during development debugging. It displays a maintenance message instead of making
 * API calls to the problematic Supabase gallery endpoint.
 */
const TempGalleryBlock: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore our collection of photos and videos
        </p>
      </div>

      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Development Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          The Gallery page is temporarily unavailable while we fix API connection issues.
          This is a development safety measure to prevent infinite request loops.
        </AlertDescription>
      </Alert>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Wrench className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Gallery Under Maintenance
        </h2>
        <p className="text-gray-600 mb-6">
          We're working to resolve technical issues with our gallery system.
          Please check back soon to view our collection of photos and videos.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
          <p className="font-medium">Technical Details:</p>
          <p>Gallery API calls temporarily disabled to prevent infinite loops</p>
          <p>Component: Gallery.tsx → TempGalleryBlock.tsx</p>
        </div>
      </div>
    </div>
  );
};

export default TempGalleryBlock;