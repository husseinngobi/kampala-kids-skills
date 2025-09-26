import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import childrenLearning1 from '@/assets/children-learning-1.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={childrenLearning1} 
          alt="Children learning life skills in Kampala" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/80 to-accent/90"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white">
            {/* Trust indicators */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm ml-2">Trusted by 500+ families</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Helping Children Build 
              <span className="block text-yellow-300">Confidence, Responsibility</span>
              <span className="block text-orange-300">& Life Skills</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Urban children in Kampala often grow up in busy households where parents have limited time 
              to teach essential life skills. Our structured holiday programme equips children with 
              <strong> practical skills, ethics, teamwork, and confidence</strong>—helping them grow into 
              independent and socially responsible individuals.
            </p>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="font-semibold">Small Classes</p>
                  <p className="text-sm text-white/80">Max 15 learners</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-orange-300" />
                <div>
                  <p className="font-semibold">Certified Training</p>
                  <p className="text-sm text-white/80">Expert instructors</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="font-semibold">Age-Appropriate</p>
                  <p className="text-sm text-white/80">3 skill levels</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-xl px-8 py-4" asChild>
                <Link to="/enrolment">
                  Enroll Now for UGX 200,000
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm"
                asChild
              >
                <Link to="/programme">Learn More</Link>
              </Button>
            </div>

            {/* Quick Info */}
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-sm text-white/90">
                <strong>Next Programme:</strong> December 2024 • <strong>Duration:</strong> 4 days • 
                <strong> Ages:</strong> 8-17 years • <strong>Location:</strong> Kampala, Uganda
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