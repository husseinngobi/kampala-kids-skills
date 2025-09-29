import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';

interface GoogleMapProps {
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  height?: string;
  showDirectionsButton?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  address = "Kampala, Uganda",
  coordinates = { lat: 0.3476, lng: 32.5825 }, // Kampala center coordinates
  zoom = 13,
  height = "400px",
  showDirectionsButton = true
}) => {
  // Generate Google Maps embed URL
  const generateMapUrl = () => {
    const baseUrl = "https://www.google.com/maps/embed/v1/place";
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with actual API key
    
    // For now, use a generic embed without API key (limited functionality)
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.3586821547!2d32.4602242!3d0.3475964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbd52f25e28cb%3A0x58b2f5a35b4c4a96!2sKampala%2C%20Uganda!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus`;
  };

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  // Generate Google Maps place URL
  const getPlaceUrl = () => {
    return `https://www.google.com/maps/place/${encodeURIComponent(address)}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Our Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Embed */}
          <iframe
            src={generateMapUrl()}
            width="100%"
            height={height}
            className="border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Children's Life Skills Programme Location in Kampala"
          />
          
          {/* Map Overlay with Location Info */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-primary">Programme Location</h4>
                <p className="text-sm text-gray-700">{address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Central location in Kampala, easily accessible by public transport
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            {showDirectionsButton && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => window.open(getDirectionsUrl(), '_blank')}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(getPlaceUrl(), '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Google Maps
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => window.open('tel:+256754723614')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call for Directions
            </Button>
          </div>
        </div>

        {/* Location Details */}
        <div className="p-4 border-t">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-primary mb-2">Transport Options</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Boda boda available from major roads</li>
                <li>• Taxi stages nearby</li>
                <li>• Private car parking available</li>
                <li>• Walking distance from bus stops</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-primary mb-2">Nearby Landmarks</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Near Kampala city center</li>
                <li>• Close to shopping centers</li>
                <li>• Accessible from all districts</li>
                <li>• Safe, secure neighborhood</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;