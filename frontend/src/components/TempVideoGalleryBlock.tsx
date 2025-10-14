import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Temporary component to block video gallery during development
 * This prevents infinite loop issues while in dev mode
 */
const TempVideoGalleryBlock: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Video Gallery - Development Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Notice:</strong> Video gallery temporarily disabled to prevent infinite API loops.
              This is a development-specific safety measure.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The video gallery component is temporarily blocked during development to prevent infinite API requests 
              that were causing performance issues.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's happening:</h3>
              <ul className="text-sm text-gray-700 text-left list-disc list-inside space-y-1">
                <li>React development mode causes component re-mounting</li>
                <li>Hot Module Replacement (HMR) triggers component reloads</li>
                <li>This was causing infinite API request loops</li>
                <li>Backend rate limiting is now protecting the Supabase database</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              In production, this component will be replaced with the full video gallery functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempVideoGalleryBlock;