import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageCircle, 
  Share2, 
  Link as LinkIcon,
  Mail,
  Phone,
  Copy
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SocialSharingProps {
  title?: string;
  description?: string;
  url?: string;
  hashtags?: string[];
  variant?: 'buttons' | 'compact' | 'floating';
  showTitle?: boolean;
  className?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({
  title = "Children's Life Skills Holiday Programme | Kampala, Uganda",
  description = "Equip your child with practical life skills, confidence, and responsibility. Contact us for enrollment details!",
  url = typeof window !== 'undefined' ? window.location.href : '',
  hashtags = ['LifeSkills', 'KidsTraining', 'Kampala', 'ChildDevelopment', 'Education'],
  variant = 'buttons',
  showTitle = true,
  className = ''
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      description: 'Share on Facebook'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-4 h-4" />,
      color: 'bg-sky-500 hover:bg-sky-600',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtags.join(',')}`,
      description: 'Share on Twitter'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      shareUrl: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      description: 'Share on WhatsApp'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      color: 'bg-blue-700 hover:bg-blue-800',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      description: 'Share on LinkedIn'
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      shareUrl: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
      description: 'Share via Email'
    }
  ];

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    if (navigator.share && platform.name === 'WhatsApp') {
      navigator.share({
        title,
        text: description,
        url
      }).catch(err => {
        console.log('Error sharing:', err);
        window.open(platform.shareUrl, '_blank', 'width=600,height=400');
      });
    } else {
      window.open(platform.shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The page link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showTitle && <span className="text-sm font-medium text-gray-700">Share:</span>}
        <div className="flex space-x-1">
          {socialPlatforms.slice(0, 3).map((platform) => (
            <Button
              key={platform.name}
              size="sm"
              variant="outline"
              className={`p-2 ${platform.color} text-white border-none hover:scale-105 transition-transform`}
              onClick={() => handleShare(platform)}
              title={platform.description}
            >
              {platform.icon}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="p-2 bg-gray-500 hover:bg-gray-600 text-white border-none hover:scale-105 transition-transform"
            onClick={copyToClipboard}
            title="Copy link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <Card className="p-2 shadow-lg">
          <CardContent className="flex flex-col space-y-2 p-2">
            {socialPlatforms.slice(0, 3).map((platform) => (
              <Button
                key={platform.name}
                size="sm"
                variant="outline"
                className={`p-2 ${platform.color} text-white border-none hover:scale-110 transition-transform`}
                onClick={() => handleShare(platform)}
                title={platform.description}
              >
                {platform.icon}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white border-none hover:scale-110 transition-transform"
              onClick={copyToClipboard}
              title="Copy link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default 'buttons' variant
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {showTitle && (
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center justify-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share This Programme
            </h3>
            <p className="text-sm text-gray-600">
              Help other parents discover our life skills programme
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              className={`${platform.color} text-white border-none hover:scale-105 transition-all duration-200 group`}
              onClick={() => handleShare(platform)}
            >
              <div className="flex flex-col items-center space-y-1">
                {platform.icon}
                <span className="text-xs">{platform.name}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Share link:</span>
            <div className="flex items-center space-x-2 flex-1 ml-3">
              <div className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm text-gray-700 truncate border">
                {url}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {hashtagString}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialSharing;