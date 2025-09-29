import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail } from 'lucide-react';
import logoImage from '@/assets/life-skills-logo.jpeg';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Programme Details', href: '/programme-details' },
    { name: 'Curriculum', href: '/curriculum' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Assessment', href: '/assessment' },
    { name: 'Parent Engagement', href: '/parental-engagement' },
    { name: 'Enrolment', href: '/enrolment' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 transform-gpu will-change-transform backface-hidden main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Life Skills Programme Logo" 
                className="w-10 h-10 object-contain drop-shadow-md"
              />
              <span className="hidden sm:block text-xl font-bold text-primary">
                Life Skills Programme
              </span>
              <span className="sm:hidden text-lg font-bold text-primary">
                LSP
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary-light/20 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+256 754 723 614</span>
            </div>
            <Button variant="hero" size="sm" asChild>
              <Link to="/enrolment">Enroll Now</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-primary-light/20 transition-all duration-300"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2">
                <Button variant="hero" size="sm" className="w-full" asChild>
                  <Link to="/enrolment" onClick={closeMenu}>
                    Enroll Now - UGX 200,000
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;