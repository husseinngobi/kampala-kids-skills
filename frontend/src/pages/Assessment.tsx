import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Award, 
  Star, 
  ClipboardCheck, 
  MessageSquare, 
  Gift,
  Trophy,
  Medal,
  ArrowRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const Assessment = () => {
  const assessmentCriteria = [
    {
      level: "Basic (Ages 8-11)",
      color: "bg-green-100 text-green-800",
      skills: [
        { skill: "Cleaning Skills", criteria: ["Can dust furniture properly", "Makes bed independently", "Organizes personal items", "Follows cleaning routine"] },
        { skill: "Cooking Basics", criteria: ["Prepares simple snacks safely", "Sets table correctly", "Washes fruits properly", "Follows recipe instructions"] },
        { skill: "Personal Care", criteria: ["Brushes teeth thoroughly", "Washes hands correctly", "Dresses appropriately", "Maintains personal hygiene"] },
        { skill: "Social Skills", criteria: ["Shows respect to others", "Follows instructions", "Shares willingly", "Helps when asked"] }
      ]
    },
    {
      level: "Intermediate (Ages 12-14)",
      color: "bg-blue-100 text-blue-800", 
      skills: [
        { skill: "Household Management", criteria: ["Washes dishes correctly", "Does basic laundry", "Cleans bathroom properly", "Organizes kitchen"] },
        { skill: "Cooking Skills", criteria: ["Cooks simple meals", "Plans meals ahead", "Practices food safety", "Uses kitchen equipment safely"] },
        { skill: "Leadership", criteria: ["Leads team activities", "Communicates clearly", "Solves problems independently", "Mentors younger children"] },
        { skill: "Responsibility", criteria: ["Completes tasks without reminders", "Takes care of belongings", "Manages time effectively", "Shows initiative"] }
      ]
    },
    {
      level: "Advanced (Ages 15-17)",
      color: "bg-purple-100 text-purple-800",
      skills: [
        { skill: "Advanced Life Skills", criteria: ["Cooks complete meals", "Manages household budget", "Plans and shops for groceries", "Handles money responsibly"] },
        { skill: "DIY & Maintenance", criteria: ["Performs basic repairs", "Uses tools safely", "Maintains equipment", "Completes projects independently"] },
        { skill: "Personal Development", criteria: ["Demonstrates leadership", "Makes informed decisions", "Manages personal finances", "Plans for future goals"] },
        { skill: "Beauty & Presentation", criteria: ["Maintains personal appearance", "Organizes wardrobe", "Practices good grooming", "Shows confidence in presentation"] }
      ]
    }
  ];

  const certificationLevels = [
    {
      title: "Bronze Certificate",
      description: "Successfully completed basic skills training",
      requirements: "70-79% of assessment criteria met",
      icon: <Award className="w-8 h-8 text-amber-600" />,
      color: "from-amber-400 to-amber-600"
    },
    {
      title: "Silver Certificate", 
      description: "Demonstrated proficiency in all core areas",
      requirements: "80-89% of assessment criteria met",
      icon: <Trophy className="w-8 h-8 text-gray-500" />,
      color: "from-gray-400 to-gray-600"
    },
    {
      title: "Gold Certificate",
      description: "Excellence in all skills with leadership qualities",
      requirements: "90-100% of assessment criteria met", 
      icon: <Medal className="w-8 h-8 text-yellow-500" />,
      color: "from-yellow-400 to-yellow-600"
    }
  ];

  const rewards = [
    { icon: <Star className="w-6 h-6 text-yellow-500" />, reward: "Achievement Stickers", description: "Daily progress stickers for completed tasks" },
    { icon: <Gift className="w-6 h-6 text-pink-500" />, reward: "Small Prizes", description: "Weekly rewards for outstanding performance" },
    { icon: <Trophy className="w-6 h-6 text-orange-500" />, reward: "Recognition Badges", description: "Special badges for leadership and teamwork" },
    { icon: <Medal className="w-6 h-6 text-blue-500" />, reward: "Certificates", description: "Formal certification of completed skills" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Assessment & Certification</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive assessment system tracks your child's progress through daily checklists, 
            trainer feedback, and skill demonstrations, culminating in formal certification.
          </p>
        </div>

        {/* Assessment Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">How We Assess Progress</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                    <ClipboardCheck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl text-primary">Daily Checklists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each child receives a daily checklist tracking specific skills and tasks. 
                  Trainers mark completion and quality of work throughout the day.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl text-primary">Trainer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Expert trainers provide detailed feedback on technique, safety, 
                  attitude, and improvement areas through one-on-one reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl text-primary">Skill Demonstrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Children demonstrate mastered skills to trainers and parents, 
                  showcasing their confidence and competency in real-world scenarios.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Assessment Criteria by Level */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Assessment Criteria by Level</h2>
          {assessmentCriteria.map((levelData, levelIndex) => (
            <div key={levelIndex} className="mb-12">
              <div className="text-center mb-6">
                <Badge className={`text-lg px-4 py-2 ${levelData.color}`}>
                  {levelData.level}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {levelData.skills.map((skillArea, skillIndex) => (
                  <Card key={skillIndex} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">{skillArea.skill}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {skillArea.criteria.map((criterion, criterionIndex) => (
                          <li key={criterionIndex} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="w-4 h-4 text-secondary mr-2 mt-0.5 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Certification Levels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Certification Levels</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {certificationLevels.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${cert.color}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    {cert.icon}
                  </div>
                  <CardTitle className="text-xl">{cert.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{cert.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {cert.requirements}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rewards System */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Rewards & Recognition</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((reward, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    {reward.icon}
                  </div>
                  <CardTitle className="text-lg">{reward.reward}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Ready to Start Your Child's Journey?</h3>
              <p className="text-lg text-gray-600 mb-6">
                Join our programme and watch your child gain confidence, skills, and recognition 
                through our comprehensive assessment and certification system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" asChild>
                  <Link to="/enrolment">
                    Enroll Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/curriculum">
                    View Curriculum
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Assessment;