import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, MessageCircle, Download, Clock, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
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
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      content: "+256 754 723 614",
      action: "tel:+256754723614"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp", 
      content: "+256 754 723 614",
      action: "https://wa.me/256754723614"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: "info@lifeskillsprogramme.ug",
      action: "mailto:info@lifeskillsprogramme.ug"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      content: "Kampala, Uganda",
      action: "#"
    }
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 5:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 2:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with us to learn more about our Children's Life Skills Programme or to enroll your child.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Send us a Message</CardTitle>
              <p className="text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+256..."
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your child and what you'd like to know about our programme..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-primary">{info.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{info.title}</h4>
                      {info.action.startsWith('http') || info.action.startsWith('tel:') || info.action.startsWith('mailto:') ? (
                        <a 
                          href={info.action} 
                          target={info.action.startsWith('http') ? '_blank' : undefined}
                          rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-gray-600 hover:text-primary transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-600">{info.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{schedule.day}</span>
                    <span className="text-gray-600">{schedule.hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" size="lg" className="w-full">
                  <a href="https://wa.me/256754723614?text=Hi! I'm interested in the Children's Life Skills Programme. Can you provide more information?" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Us
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Brochure
                </Button>
                <Button asChild size="lg" className="w-full">
                  <a href="/enrolment">
                    <Users className="w-4 h-4 mr-2" />
                    Enroll Now
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* QR Code Generator */}
            <QRCodeGenerator />
          </div>
        </div>

        {/* Map Section */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary text-center">Find Us</CardTitle>
              <p className="text-center text-gray-600">We're located in the heart of Kampala</p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Kampala, Uganda</p>
                  <p className="text-sm">Interactive map will be embedded here</p>
                  <p className="text-xs mt-2">Contact us for exact location details</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">What should my child bring?</h3>
                <p className="text-gray-600 text-sm">
                  Children should bring comfortable clothes, a water bottle, and an apron if available. All learning materials and equipment are provided.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">Are meals included?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! Nutritious meals and snacks are included in the programme fee. We also teach children how to prepare healthy meals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">What if my child has allergies?</h3>
                <p className="text-gray-600 text-sm">
                  Please inform us of any allergies during enrollment. Our staff are trained to accommodate special dietary needs and medical requirements.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">Can I visit during the programme?</h3>
                <p className="text-gray-600 text-sm">
                  We have dedicated parent observation times and a closing ceremony where children demonstrate their new skills to families.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;