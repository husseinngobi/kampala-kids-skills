import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  Award,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { title: 'About Programme', href: '/programme-details' },
    { title: 'Curriculum', href: '/curriculum' },
    { title: 'Skills Gallery', href: '/gallery' },
    { title: 'Assessment', href: '/assessment' },
    { title: 'Enroll Now', href: '/enrolment' },
    { title: 'Contact Us', href: '/contact' }
  ];

  const programInfo = [
    { title: 'Holiday Programmes', href: '/programme-details#holiday' },
    { title: 'Weekend Classes', href: '/programme-details#weekend' },
    { title: 'Private Tutoring', href: '/programme-details#private' },
    { title: 'School Partnerships', href: '/programme-details#schools' },
    { title: 'Parent Resources', href: '/parental-engagement' },
    { title: 'Safety Guidelines', href: '/programme-details#safety' }
  ];

  const legalLinks = [
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Cookie Policy', href: '/cookies' },
    { title: 'Child Protection', href: '/child-protection' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/src/assets/life-skills-logo.png" 
                alt="Kampala Kids Life Skills" 
                className="w-8 h-8"
              />
              <h3 className="text-xl font-bold">Kampala Kids Skills</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering children in Kampala with essential life skills, confidence, 
              and values for a brighter future.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-col space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Child Protection Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Ministry of Education Approved</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span>500+ Happy Families</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programme Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Programmes</h4>
            <ul className="space-y-3">
              {programInfo.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    Kampala, Uganda<br />
                    Central Region
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+256 XX XXX XXXX</p>
                  <p className="text-sm text-gray-400">Mon-Fri 8AM-6PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">info@kampala-kids-skills.com</p>
                  <p className="text-sm text-gray-400">24/7 Support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Programme Hours:</p>
                  <p className="text-sm text-gray-400">Mon-Fri: 9AM-3PM</p>
                  <p className="text-sm text-gray-400">Weekends: 10AM-2PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {currentYear} Kampala Kids Life Skills Programme. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Proudly serving families in Kampala, Uganda since 2023
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              {legalLinks.map((link) => (
                <Link 
                  key={link.href}
                  to={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;