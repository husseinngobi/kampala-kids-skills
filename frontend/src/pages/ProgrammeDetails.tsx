import React from 'react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';

const ProgrammeDetails = () => {
  const programmes = [
    {
      level: "Basic",
      ages: "8-11 years", 
      duration: "4 days",
      fee: "UGX 200,000",
      maxLearners: "15 students",
      skills: ["Basic cooking", "Bed making", "Plant care", "Personal hygiene", "Simple cleaning"]
    },
    {
      level: "Intermediate", 
      ages: "12-14 years",
      duration: "4 days", 
      fee: "UGX 200,000",
      maxLearners: "15 students",
      skills: ["Dish washing", "Meal preparation", "Laundry basics", "Pet care", "Leadership basics"]
    },
    {
      level: "Advanced",
      ages: "15-17 years",
      duration: "4 days",
      fee: "UGX 200,000", 
      maxLearners: "15 students",
      skills: ["Deep cleaning", "Full meal cooking", "Financial literacy", "DIY projects", "Beauty & grooming"]
    }
  ];

  const skillingPrograms = [
    "Culinary Arts & Nutrition",
    "House Cleaning & Organization", 
    "Laundry Management",
    "Pet & Plant Care",
    "Personal Care & Hygiene",
    "Leadership & Social Skills",
    "Financial Literacy & Budgeting",
    "DIY & Maker Skills",
    "Beauty & Cosmetology"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <SEO 
        title="Programme Details & Levels | Children's Life Skills Programme"
        description="Discover our 3 programme levels: Basic (8-11), Intermediate (12-14), Advanced (15-17). Each 4-day programme costs UGX 200,000 and covers cooking, cleaning, leadership & more."
        keywords="children programme levels, life skills training details, cooking classes kids Kampala, leadership development children, practical skills curriculum, children education fees Uganda"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Programme Details</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our structured holiday programme is designed to equip children with practical life skills, 
            building confidence and responsibility through hands-on learning experiences.
          </p>
        </div>

        {/* Programme Levels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Programme Levels</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {programmes.map((program) => (
              <Card key={program.level} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">{program.level}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">{program.ages}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-primary">{program.fee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{program.maxLearners}</span>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Key Skills:</h4>
                    <ul className="space-y-1">
                      {program.skills.map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">• {skill}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Skilling Programmes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Skilling Programmes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {skillingPrograms.map((skill, index) => (
              <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-primary">{skill}</h3>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary">Ready to Enroll Your Child?</h2>
          <p className="text-gray-600 mb-6">Join our next programme and watch your child develop essential life skills!</p>
          <Button size="lg" className="mr-4">Enroll Now</Button>
          <Button variant="outline" size="lg">Download Brochure</Button>
        </div>
      </main>
    </div>
  );
};

export default ProgrammeDetails;