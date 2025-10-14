import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  Info, 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BrochureDownloadProps {
  variant?: 'card' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BrochureDownload: React.FC<BrochureDownloadProps> = ({
  variant = 'card',
  size = 'md',
  className = ''
}) => {
  
  const generatePDFContent = () => {
    // This would typically connect to a PDF generation service
    // For now, we'll create a comprehensive text-based brochure
    return {
      title: "Children's Life Skills Holiday Programme",
      subtitle: "Building Confidence, Responsibility & Life Skills",
      content: `
CHILDREN'S LIFE SKILLS HOLIDAY PROGRAMME
Kampala, Uganda

HELPING CHILDREN BUILD CONFIDENCE, RESPONSIBILITY & LIFE SKILLS

PROGRAMME OVERVIEW:
Urban children in Kampala often grow up in busy households where parents have limited time to teach essential life skills. Our structured holiday programme equips children with practical skills, ethics, teamwork, and confidence—helping them grow into independent and socially responsible individuals.

PROGRAMME LEVELS:

🔵 BASIC LEVEL (Ages 8-11)
Duration: 4 days | Contact for pricing | Max: 15 learners
Skills: Basic cooking, bed making, plant care, personal hygiene, simple cleaning

🔵 INTERMEDIATE LEVEL (Ages 12-14)  
Duration: 4 days | Contact for pricing | Max: 15 learners
Skills: Dish washing, meal preparation, laundry basics, pet care, leadership basics

🔵 ADVANCED LEVEL (Ages 15-17)
Duration: 4 days | Contact for pricing | Max: 15 learners
Skills: Deep cleaning, full meal cooking, financial literacy, DIY projects, beauty & grooming

SKILL AREAS COVERED:
✓ Culinary Arts & Nutrition
✓ House Cleaning & Organization
✓ Laundry Management
✓ Pet & Plant Care
✓ Personal Care & Hygiene
✓ Leadership & Social Skills
✓ Financial Literacy & Budgeting
✓ DIY & Maker Skills
✓ Beauty & Cosmetology

ASSESSMENT & CERTIFICATION:
- Daily checklists and progress tracking
- Expert trainer feedback and reviews
- Skill demonstrations and practical assessments
- Bronze, Silver, and Gold certificates
- Recognition awards and achievement stickers

PARENTAL ENGAGEMENT:
- Opening session with programme introduction
- Mid-programme progress updates
- Closing ceremony with skill demonstrations
- Home guidance materials and continuation tips
- Ongoing support and follow-up resources

WHAT'S INCLUDED:
✓ All learning materials and equipment
✓ Nutritious meals and snacks
✓ Expert instruction and supervision
✓ Safety equipment and first aid
✓ Progress reports and certificates
✓ Take-home resources and guides

CONTACT INFORMATION:
📞 Phone: +256 782 022899 / +256 758 709980
📧 Email: info@lifeskillsprogramme.ug
📍 Location: Kampala, Uganda
🌐 Website: [Your Website URL]
💬 WhatsApp: +256 782 022899

ENROLLMENT:
1. Complete enrollment form
2. Receive pricing and payment details
3. Attend opening session
4. Begin your child's transformation!

NEXT PROGRAMME DATES:
Check our website or contact us for upcoming programme schedules.

Give your child the gift of independence, confidence, and practical life skills that will serve them for a lifetime!

---
Children's Life Skills Programme | Kampala, Uganda
Empowering the next generation with essential life skills.
`
    };
  };

  const downloadBrochure = () => {
    try {
      const brochure = generatePDFContent();
      
      // Create a text file (in a real implementation, you'd generate a PDF)
      const content = `${brochure.title}\n${brochure.subtitle}\n\n${brochure.content}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'children-life-skills-programme-brochure.txt';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Brochure Downloaded!",
        description: "The programme brochure has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the brochure. Please try again.",
        variant: "destructive",
      });
    }
  };

  const previewBrochure = () => {
    const brochure = generatePDFContent();
    const content = `${brochure.title}\n${brochure.subtitle}\n\n${brochure.content}`;
    
    // Open in new window for preview
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Programme Brochure Preview</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                background: #f5f5f5;
              }
              .brochure {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              h1 { color: #2563eb; text-align: center; }
              h2 { color: #059669; border-bottom: 2px solid #059669; }
              .highlight { background: #fef3c7; padding: 2px 4px; }
            </style>
          </head>
          <body>
            <div class="brochure">
              <pre>${content}</pre>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  if (variant === 'button') {
    const sizeClasses = {
      sm: 'text-sm px-3 py-2',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3'
    };

    return (
      <Button
        onClick={downloadBrochure}
        size={size === 'md' ? 'default' : size}
        className={`${sizeClasses[size]} ${className}`}
      >
        <Download className="w-4 h-4 mr-2" />
        Download Brochure
      </Button>
    );
  }

  // Card variant
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Programme Brochure</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">
          Download our comprehensive programme brochure with all details about levels, 
          curriculum, and enrollment information.
        </p>

        {/* Brochure Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span>Programme Details</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>Schedule & Dates</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-accent" />
            <span>Pricing Information</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>Enrollment Process</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={downloadBrochure}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={previewBrochure}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">What's Included:</p>
              <p>Complete programme overview, curriculum details, assessment criteria, and enrollment steps.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrochureDownload;