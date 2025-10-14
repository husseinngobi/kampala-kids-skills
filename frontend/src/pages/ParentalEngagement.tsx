import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Home, 
  BookOpen, 
  MessageCircle,
  Heart,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Download,
  Phone
} from 'lucide-react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ParentalEngagement = () => {
  const [heroImage, setHeroImage] = useState('/placeholder.svg');
  const [loading, setLoading] = useState(true);

  // Fetch dining/family image for hero section
  useEffect(() => {
    // TEMPORARILY DISABLED TO STOP INFINITE LOOP
    console.log('🚫 Parental engagement image API call disabled to prevent infinite loop');
    setLoading(false);
    
    // const fetchHeroImage = async () => {
    //   try {
    //     const response = await fetch(`${API_BASE_URL}/api/gallery/media?category=DINING&limit=1`);
    //     if (response.ok) {
    //       const data = await response.json();
    //       if (data.data && data.data.length > 0) {
    //         setHeroImage(`${API_BASE_URL}${data.data[0].url}`);
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error fetching hero image:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchHeroImage();
  }, []);
  const engagementActivities = [
    {
      phase: "Opening Session",
      timing: "Day 1 - First Hour",
      icon: <Users className="w-8 h-8 text-primary" />,
      activities: [
        "Parents meet trainers and programme coordinators",
        "Overview of programme objectives and daily schedule",
        "Safety guidelines and emergency procedures explained",
        "Introduction to assessment criteria and expectations",
        "Q&A session with programme director"
      ],
      duration: "60 minutes",
      attendance: "Mandatory for all parents"
    },
    {
      phase: "Mid-Programme Check-in", 
      timing: "Day 2 - Evening",
      icon: <MessageCircle className="w-8 h-8 text-secondary" />,
      activities: [
        "Brief progress report on your child's development",
        "Feedback session with trainers",
        "Discussion of any challenges or concerns",
        "Tips for reinforcing skills at home",
        "Photo sharing of your child's activities"
      ],
      duration: "30 minutes",
      attendance: "Recommended (Phone/video call available)"
    },
    {
      phase: "Closing Session",
      timing: "Day 4 - Final Hour", 
      icon: <Star className="w-8 h-8 text-accent" />,
      activities: [
        "Children demonstrate learned skills to parents",
        "Presentation of certificates and awards",
        "Group photo session and celebration",
        "Detailed progress report and recommendations",
        "Home guidance materials distribution"
      ],
      duration: "90 minutes",
      attendance: "Mandatory - Celebration event!"
    }
  ];

  const homeGuidanceTopics = [
    {
      category: "Reinforcing Skills",
      icon: <Home className="w-6 h-6" />,
      tips: [
        "Create age-appropriate chore schedules",
        "Set up practice stations at home", 
        "Encourage daily skill practice",
        "Provide positive reinforcement and praise"
      ]
    },
    {
      category: "Building Confidence",
      icon: <Heart className="w-6 h-6" />,
      tips: [
        "Celebrate small achievements daily",
        "Allow children to take on new responsibilities",
        "Create opportunities for leadership at home",
        "Share their progress with extended family"
      ]
    },
    {
      category: "Maintaining Progress",
      icon: <CheckCircle className="w-6 h-6" />,
      tips: [
        "Keep skills journals or progress charts",
        "Schedule weekly skill review sessions",
        "Connect with other programme families",
        "Consider follow-up programmes or activities"
      ]
    },
    {
      category: "Supporting Development",
      icon: <BookOpen className="w-6 h-6" />,
      tips: [
        "Provide age-appropriate books and resources",
        "Create learning opportunities during daily activities",
        "Encourage questions and curiosity",
        "Model the skills and values taught in the programme"
      ]
    }
  ];

  const parentTestimonials = [
    {
      name: "Sarah Nakamura",
      child: "Emma, Age 10",
      quote: "The opening session really helped me understand what my daughter would be learning. Seeing her demonstrate her cooking skills at the closing ceremony was incredible!",
      rating: 5
    },
    {
      name: "David Okello", 
      child: "Michael, Age 13",
      quote: "The guidance materials were so helpful. We've maintained most of the routines at home, and Michael has become much more responsible.",
      rating: 5
    },
    {
      name: "Grace Namuli",
      child: "Twin daughters, Age 9",
      quote: "The mid-programme check-in call was reassuring. The trainers really knew my children well and gave specific advice for each twin's personality.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-50 to-white">      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Parental Engagement</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We believe parents are essential partners in their child's development. Our comprehensive 
            engagement programme ensures you're involved every step of the way.
          </p>
        </div>

        {/* Hero Image Section */}
        <section className="mb-16">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={heroImage} 
              alt="Children and parents during programme activities" 
              className={`w-full h-64 md:h-96 object-cover ${loading ? 'image-loading' : 'image-loaded'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="text-white p-8">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  Building Stronger Families Together
                </h2>
                <p className="text-lg md:text-xl text-white/90">
                  Your involvement makes the difference in your child's success
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Phases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Programme Engagement Phases</h2>
          <div className="space-y-8">
            {engagementActivities.map((phase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {phase.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-primary">{phase.phase}</CardTitle>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{phase.timing}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{phase.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{phase.attendance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.activities.map((activity, activityIndex) => (
                      <li key={activityIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Home Guidance */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Home Guidance Materials</h2>
          <p className="text-center text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Take the learning home with comprehensive guidance materials designed to help you 
            support your child's continued development.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {homeGuidanceTopics.map((topic, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
                      {topic.icon}
                    </div>
                    <CardTitle className="text-xl text-primary">{topic.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Parent Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">What Parents Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {parentTestimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <p className="text-sm text-gray-600">{testimonial.child}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  Downloadable Resources for Parents
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Access comprehensive guides, checklists, and activity sheets to continue 
                  your child's development at home.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="default" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Home Activity Guide
                  </Button>
                  <Button variant="outline" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Progress Tracking Sheets
                  </Button>
                  <Button variant="secondary" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Safety Guidelines
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact & Support */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Ongoing Support</h3>
              <p className="text-lg text-gray-600 mb-6">
                Our support doesn't end when the programme does. We're here to help you and 
                your child continue this journey of growth and development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" asChild>
                  <Link to="/contact">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Support Team
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/enrolment">
                    Enroll Your Child
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Available Monday-Friday, 8AM-5PM | WhatsApp support available 24/7
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ParentalEngagement;