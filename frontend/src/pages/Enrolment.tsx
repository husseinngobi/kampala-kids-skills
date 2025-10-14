import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, FileText, CreditCard, UserCheck } from 'lucide-react';

const Enrolment = () => {
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '', 
    parentPhone: '',
    childName: '',
    childAge: '',
    programLevel: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    agreedToTerms: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Note: This would require Supabase integration for actual form submission
    console.log('Form submitted:', formData);
    alert('Thank you! Your enrollment form has been submitted. We will contact you soon with payment details.');
  };

  const steps = [
    { icon: <FileText className="w-6 h-6" />, title: "Complete Form", description: "Fill in child and parent details" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Receive Quote", description: "Get pricing and payment details" },
    { icon: <UserCheck className="w-6 h-6" />, title: "Confirmation", description: "Complete enrollment process" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-50 to-white">      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4">Enroll Your Child</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Join our life skills programme and give your child the foundation for independence and confidence.
          </p>
        </div>

        {/* Enrollment Steps */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-8 space-y-6 sm:space-y-0 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center w-full sm:w-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-2">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 max-w-24 sm:max-w-20">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block w-16 h-0.5 bg-gray-300 mx-4 mt-6"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Enrollment Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">Enrollment Form</CardTitle>
            <p className="text-center text-gray-600">Please provide accurate information for your child's enrollment</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Parent/Guardian Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentName">Full Name *</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => handleInputChange('parentName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentEmail">Email Address *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Phone Number *</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                      placeholder="+256..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Child Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Child Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childName">Child's Full Name *</Label>
                    <Input
                      id="childName"
                      value={formData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="childAge">Child's Age *</Label>
                    <Select onValueChange={(value) => handleInputChange('childAge', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 8).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="programLevel">Programme Level *</Label>
                    <Select onValueChange={(value) => handleInputChange('programLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select programme level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (Ages 8-11)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Ages 12-14)</SelectItem>
                        <SelectItem value="advanced">Advanced (Ages 15-17)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      placeholder="+256..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <Label htmlFor="medicalInfo">Medical Information / Allergies</Label>
                <Textarea
                  id="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  placeholder="Please list any medical conditions, allergies, or special needs..."
                  rows={3}
                />
              </div>

              {/* Programme Information */}
              <Card className="bg-primary-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">Programme Information</h4>
                  <p className="text-gray-700 mb-2">
                    <span className="font-bold text-lg text-primary">Complete 4-day programme</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Includes all materials, meals, and certification. Pricing and payment details will be provided after form submission.
                  </p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full">
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Enrollment Application
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions about enrollment? Contact us for assistance.
          </p>
          <Button variant="outline" size="lg">
            <a href="https://wa.me/256782022899" target="_blank" rel="noopener noreferrer">
              WhatsApp Us: +256 782 022899
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Enrolment;