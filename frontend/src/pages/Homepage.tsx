import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import VideoGallery from '@/components/VideoGallery';
import SocialSharing from '@/components/SocialSharing';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  ChefHat,
  Home,
  Heart,
  DollarSign,
  Briefcase,
  Wrench,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Homepage = () => {
  const [featuredImage, setFeaturedImage] = useState('/placeholder.svg');
  const [loading, setLoading] = useState(true);

  // Fetch featured image for homepage
  useEffect(() => {
    const fetchFeaturedImage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery/media?category=TABLE_SETTING&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setFeaturedImage(data.data[0].url);
          }
        }
      } catch (error) {
        console.error('Error fetching featured image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedImage();
  }, []);
  const skillPrograms = [
    { icon: ChefHat, title: 'Culinary Skills', description: 'Cooking, meal planning, nutrition basics' },
    { icon: Home, title: 'House Cleaning', description: 'Organization, maintenance, hygiene' },
    { icon: Heart, title: 'Personal Care', description: 'Self-care, grooming, health habits' },
    { icon: Users, title: 'Leadership', description: 'Teamwork, communication, confidence' },
    { icon: DollarSign, title: 'Financial Literacy', description: 'Budgeting, saving, money management' },
    { icon: Wrench, title: 'DIY & Maker Skills', description: 'Basic repairs, crafts, creativity' },
    { icon: Sparkles, title: 'Beauty & Cosmetology', description: 'Self-presentation, confidence building' },
    { icon: BookOpen, title: 'Study Skills', description: 'Organization, time management, focus' }
  ];

  const testimonials = [
    {
      name: "Sarah Nakato",
      role: "Parent",
      content: "My 12-year-old daughter came home so excited about cooking her first meal independently. The confidence she gained is incredible!",
      rating: 5
    },
    {
      name: "James Okello",
      role: "Parent", 
      content: "The programme taught my son responsibility and leadership skills. He now helps organize family activities and takes initiative.",
      rating: 5
    },
    {
      name: "Grace Namuli",
      role: "Parent",
      content: "Worth every shilling! My twins learned practical life skills that schools don't teach. They're more independent and confident.",
      rating: 5
    }
  ];

  return (
    <div>
      <SEO 
        title="Children's Life Skills Holiday Programme | Kampala, Uganda"
        description="Equip your child with practical life skills, confidence, and responsibility through our structured holiday programme in Kampala. Cooking, cleaning, leadership & more. Ages 8-17. Enroll for UGX 200,000!"
        keywords="children life skills Kampala, holiday programme Uganda, kids cooking classes, leadership training children, practical skills development, confidence building kids, children education Kampala, life skills training Uganda"
      />

      {/* Hero Section */}
      <Hero />

      {/* Video Showcase Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">See Our Programme in Action</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Watch real children developing confidence and practical skills in our hands-on learning environment.
            </p>
          </div>
          
          <VideoGallery 
            showUploadButton={false}
          />

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              These are just a few examples of the hands-on skills your child will master in our programme.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/enrolment">
                Enroll Your Child Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Programme Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title">Building Tomorrow's Leaders Today</h2>
              <p className="text-xl text-muted-foreground mb-6">
                Our comprehensive programme addresses the gap in practical life skills education for urban children in Kampala.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Structured Learning</h4>
                    <p className="text-muted-foreground">Age-appropriate curricula designed by child development experts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Practical Skills</h4>
                    <p className="text-muted-foreground">Hands-on learning that children can immediately apply at home</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg">Character Development</h4>
                    <p className="text-muted-foreground">Ethics, responsibility, and social skills integrated into every activity</p>
                  </div>
                </div>
              </div>

              <Button variant="secondary" size="lg" asChild>
                <Link to="/programme">
                  View Full Programme Details
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div>
              <img 
                src={featuredImage} 
                alt="Children learning proper table setting and dining etiquette"
                className={`w-full rounded-2xl shadow-2xl ${loading ? 'image-loading' : 'image-loaded'}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skills Programme Grid */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Complete Life Skills Training</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive programme covers 8 essential skill areas, ensuring children develop well-rounded capabilities for independent living.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skillPrograms.map((skill, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <skill.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{skill.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="accent" size="lg" asChild>
              <Link to="/curriculum">
                Explore Complete Curriculum
                <BookOpen className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Programme Levels */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Three Levels of Learning</h2>
            <p className="text-xl text-muted-foreground">
              Age-appropriate programmes designed to meet children where they are and help them grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                level: 'Basic',
                ages: '8-11 years',
                color: 'from-blue-500 to-blue-600',
                skills: ['Bed making & room tidying', 'Plant care & watering', 'Simple snacks preparation', 'Basic hygiene routines', 'Teamwork games']
              },
              {
                level: 'Intermediate', 
                ages: '12-14 years',
                color: 'from-green-500 to-green-600',
                skills: ['Dishwashing & kitchen care', 'Cooking simple meals', 'Light gardening tasks', 'Money counting & saving', 'Leadership activities']
              },
              {
                level: 'Advanced',
                ages: '15-17 years', 
                color: 'from-orange-500 to-orange-600',
                skills: ['Deep cleaning techniques', 'Full meal preparation', 'Budgeting & planning', 'DIY repairs & maintenance', 'Mentoring younger children']
              }
            ].map((programme, index) => (
              <Card key={index} className="card-hover overflow-hidden md:col-span-2 lg:col-span-1">
                <div className={`h-2 bg-gradient-to-r ${programme.color}`}></div>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">{programme.level}</h3>
                    <p className="text-lg text-muted-foreground">{programme.ages}</p>
                    <div className="flex justify-center items-center mt-4 space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>4 days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Max 15</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {programme.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-6 pt-6 border-t border-border">
                    <p className="text-2xl font-bold text-primary mb-2">UGX 200,000</p>
                    <p className="text-sm text-muted-foreground">Complete 12-day programme</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">What Parents Say</h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from families who've seen their children transform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Child's Future?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of families who have chosen to invest in their children's practical life skills and character development.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90 text-xl px-8 py-4" asChild>
              <Link to="/enrolment">
                Secure Your Spot Today
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>+256 XXX XXX XXX</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>info@childlifeskills.org</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Sharing Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialSharing 
            title="Children's Life Skills Holiday Programme | Kampala"
            description="Give your child practical life skills, confidence & responsibility. 4-day programme for ages 8-17. Enroll for UGX 200,000!"
            hashtags={['LifeSkills', 'KidsTraining', 'Kampala', 'ChildDevelopment', 'Education', 'Uganda']}
          />
        </div>
      </section>
    </div>
  );
};

export default Homepage;