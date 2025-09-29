import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award } from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Hero = () => {
  const [heroImage, setHeroImage] = useState('/placeholder.svg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery/media?category=LEARNING&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Use the first learning image as hero background - API now returns absolute URLs
            setHeroImage(data.data[0].url);
          }
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Children learning life skills in Kampala" 
          className={`w-full h-full object-cover ${loading ? 'image-loading' : 'image-loaded'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/80 to-accent/90"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-white">
            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-6 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm ml-2">Trusted by 500+ families</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              Helping Children Build 
              <span className="block text-yellow-300">Confidence, Responsibility</span>
              <span className="block text-orange-300">& Life Skills</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Urban children in Kampala often grow up in busy households where parents have limited time 
              to teach essential life skills. Our structured holiday programme equips children with 
              <strong> practical skills, ethics, teamwork, and confidence</strong>—helping them grow into 
              independent and socially responsible individuals.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Small Classes</p>
                  <p className="text-xs sm:text-sm text-white/80">Max 15 learners</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-orange-300 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Certified Training</p>
                  <p className="text-xs sm:text-sm text-white/80">Expert instructors</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Age-Appropriate</p>
                  <p className="text-xs sm:text-sm text-white/80">3 skill levels</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button variant="hero" size="lg" className="text-lg sm:text-xl px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto" asChild>
                <Link to="/enrolment">
                  Enroll Now for UGX 200,000
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg sm:text-xl px-6 py-3 sm:px-8 sm:py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm w-full sm:w-auto"
                asChild
              >
                <Link to="/programme-details">Learn More</Link>
              </Button>
            </div>

            {/* Quick Info */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                <span className="block sm:inline"><strong>Next Programme:</strong> December 2024</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline"><strong>Duration:</strong> 4 days</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline"><strong>Ages:</strong> 8-17 years</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline"><strong>Location:</strong> Kampala, Uganda</span>
              </p>
            </div>
          </div>

          {/* Visual Element */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Programme Highlights</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>Culinary & Cooking Skills</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span>House Cleaning & Organisation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span>Leadership & Social Skills</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Financial Literacy</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span>Personal Care & Hygiene</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;