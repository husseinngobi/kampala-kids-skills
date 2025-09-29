import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';

const QRCodeGenerator = () => {
  const currentUrl = window.location.origin;
  
  const generateQRUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'life-skills-programme-qr.png';
    link.href = generateQRUrl();
    link.click();
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Children\'s Life Skills Programme',
        text: 'Check out this amazing life skills programme for children!',
        url: currentUrl
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
    }
  };

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Share Our Programme</h3>
      <div className="mb-4">
        <img 
          src={generateQRUrl()} 
          alt="QR Code for Children's Life Skills Programme website"
          className="mx-auto border rounded"
        />
      </div>
      <div className="flex gap-2 justify-center">
        <Button onClick={downloadQR} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download QR
        </Button>
        <Button onClick={shareLink} variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share Link
        </Button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;