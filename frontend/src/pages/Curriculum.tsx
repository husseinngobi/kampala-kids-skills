import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Home, Shirt, Heart, Lightbulb, DollarSign, Wrench, Scissors } from 'lucide-react';

const Curriculum = () => {
  const curriculumData = [
    {
      level: "Basic (Ages 8-11)",
      color: "bg-green-100 text-green-800",
      activities: [
        { icon: <Home className="w-6 h-6" />, skill: "Cleaning", tasks: ["Dusting furniture", "Organizing toys", "Making beds", "Sweeping floors"] },
        { icon: <ChefHat className="w-6 h-6" />, skill: "Cooking", tasks: ["Preparing sandwiches", "Making simple snacks", "Washing fruits", "Setting table"] },
        { icon: <Heart className="w-6 h-6" />, skill: "Personal Care", tasks: ["Brushing teeth properly", "Hand washing", "Hair care basics", "Dressing appropriately"] },
        { icon: <Lightbulb className="w-6 h-6" />, skill: "Life Skills", tasks: ["Plant watering", "Pet feeding basics", "Telling time", "Following routines"] }
      ]
    },
    {
      level: "Intermediate (Ages 12-14)", 
      color: "bg-blue-100 text-blue-800",
      activities: [
        { icon: <Home className="w-6 h-6" />, skill: "Cleaning", tasks: ["Dishwashing", "Bathroom cleaning", "Laundry sorting", "Kitchen organization"] },
        { icon: <ChefHat className="w-6 h-6" />, skill: "Cooking", tasks: ["Simple meals", "Food safety", "Meal planning", "Kitchen hygiene"] },
        { icon: <Shirt className="w-6 h-6" />, skill: "Laundry", tasks: ["Washing clothes", "Folding techniques", "Ironing basics", "Stain removal"] },
        { icon: <Lightbulb className="w-6 h-6" />, skill: "Leadership", tasks: ["Teamwork", "Communication", "Problem solving", "Helping others"] }
      ]
    },
    {
      level: "Advanced (Ages 15-17)",
      color: "bg-purple-100 text-purple-800", 
      activities: [
        { icon: <ChefHat className="w-6 h-6" />, skill: "Advanced Cooking", tasks: ["Complete meals", "Nutritional planning", "Food budgeting", "Hosting guests"] },
        { icon: <DollarSign className="w-6 h-6" />, skill: "Financial Literacy", tasks: ["Budgeting basics", "Saving strategies", "Smart shopping", "Money management"] },
        { icon: <Wrench className="w-6 h-6" />, skill: "DIY & Repairs", tasks: ["Basic repairs", "Tool usage", "Home maintenance", "Creative projects"] },
        { icon: <Scissors className="w-6 h-6" />, skill: "Beauty & Style", tasks: ["Personal grooming", "Hair styling", "Skincare routine", "Wardrobe organization"] }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">      
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Curriculum & Activities</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Age-appropriate activities designed to build practical life skills through structured learning and hands-on experience.
          </p>
        </div>

        {curriculumData.map((levelData, levelIndex) => (
          <section key={levelIndex} className="mb-16">
            <div className="text-center mb-8">
              <Badge className={`text-lg px-4 py-2 ${levelData.color}`}>
                {levelData.level}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levelData.activities.map((activity, activityIndex) => (
                <Card key={activityIndex} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center text-primary mb-2">
                      {activity.icon}
                    </div>
                    <CardTitle className="text-lg">{activity.skill}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activity.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Daily Schedule Example */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">Sample Daily Schedule</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary">Morning Session (9:00 AM - 12:00 PM)</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Welcome & Morning Assembly</li>
                    <li>• Skill Introduction & Demo</li>
                    <li>• Hands-on Practice</li>
                    <li>• Mid-morning Break</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary">Afternoon Session (1:00 PM - 4:00 PM)</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Lunch & Social Time</li>
                    <li>• Advanced Practice</li>
                    <li>• Group Activities</li>
                    <li>• Reflection & Assessment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Curriculum;