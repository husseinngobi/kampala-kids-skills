import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@kampala-kids-skills.com' },
      update: {},
      create: {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@kampala-kids-skills.com',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify([
          'MANAGE_USERS', 'MANAGE_ENROLLMENTS', 'MANAGE_VIDEOS', 
          'MANAGE_CONTENT', 'VIEW_REPORTS', 'MANAGE_SYSTEM'
        ]),
        isActive: true
      }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create programme levels
    const programmeLevels = [
      {
        name: 'Little Helpers (Beginners)',
        description: 'Perfect introduction to life skills for our youngest participants',
        ageMin: 5,
        ageMax: 8,
        fee: 150000, // UGX
        duration: '2 weeks',
        skills: JSON.stringify([
          'Basic cleaning habits',
          'Simple shoe care',
          'Basic table setting',
          'Personal hygiene',
          'Following instructions',
          'Teamwork basics'
        ]),
        isActive: true
      },
      {
        name: 'Junior Life Skills (Intermediate)',
        description: 'Building on basics with more independence and responsibility',
        ageMin: 9,
        ageMax: 12,
        fee: 200000, // UGX
        duration: '3 weeks',
        skills: JSON.stringify([
          'House cleaning techniques',
          'Pet care fundamentals',
          'Advanced shoe care',
          'Proper table setting',
          'Basic cooking safety',
          'Time management',
          'Responsibility building'
        ]),
        isActive: true
      },
      {
        name: 'Teen Life Masters (Advanced)',
        description: 'Comprehensive life skills preparation for independence',
        ageMin: 13,
        ageMax: 17,
        fee: 250000, // UGX
        duration: '4 weeks',
        skills: JSON.stringify([
          'Advanced cleaning techniques',
          'Complete pet care',
          'Professional shoe care',
          'Formal dining etiquette',
          'Basic cooking skills',
          'Leadership development',
          'Life planning basics',
          'Financial literacy introduction'
        ]),
        isActive: true
      }
    ];

    for (const level of programmeLevels) {
      await prisma.programmeLevel.upsert({
        where: { name: level.name },
        update: level,
        create: level
      });
    }
    console.log('✅ Programme levels created');

    // Create sample sessions
    const currentDate = new Date();
    const futureDate1 = new Date(currentDate);
    futureDate1.setDate(currentDate.getDate() + 30);
    const futureDate2 = new Date(currentDate);
    futureDate2.setDate(currentDate.getDate() + 60);

    const sessions = [
      {
        name: 'Holiday Programme - December 2024',
        description: 'Fun-filled holiday programme with comprehensive life skills training',
        startDate: futureDate1,
        endDate: new Date(futureDate1.getTime() + (21 * 24 * 60 * 60 * 1000)), // 21 days later
        location: 'Kampala Skills Center, Nakawa',
        maxCapacity: 30,
        currentEnrollment: 0,
        status: 'UPCOMING'
      },
      {
        name: 'New Year Skills Bootcamp - January 2025',
        description: 'Start the new year with new skills and confidence',
        startDate: futureDate2,
        endDate: new Date(futureDate2.getTime() + (28 * 24 * 60 * 60 * 1000)), // 28 days later
        location: 'Kampala Skills Center, Nakawa',
        maxCapacity: 25,
        currentEnrollment: 0,
        status: 'UPCOMING'
      }
    ];

    for (const session of sessions) {
      await prisma.programmeSession.upsert({
        where: { name: session.name },
        update: session,
        create: session
      });
    }
    console.log('✅ Programme sessions created');

    // Create sample videos with actual files
    const sampleVideos = [
      {
        title: 'House Cleaning Fundamentals',
        description: 'Learn essential house cleaning skills including proper techniques, safety measures, and organization methods that children can apply in their daily lives.',
        category: 'HOUSE_CLEANING',
        filename: 'house-cleaning.mp4',
        originalName: 'house-cleaning.mp4',
        fileSize: 15728640,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: true,
        views: 245,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Pet Care Essentials',
        description: 'Discover the basics of responsible pet care, including feeding, grooming, and understanding animal needs and behavior.',
        category: 'PET_CARE',
        filename: 'pet-care.mp4',
        originalName: 'pet-care.mp4',
        fileSize: 12582912,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: true,
        views: 189,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Shoe Care and Maintenance',
        description: 'Master the art of proper shoe care, cleaning techniques, and maintenance practices to keep footwear in excellent condition.',
        category: 'SHOE_CARE',
        filename: 'shoe-care.mp4',
        originalName: 'shoe-care.mp4',
        fileSize: 18874368,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: false,
        views: 312,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Basic Plant Care',
        description: 'Learn fundamental plant care skills including watering, soil care, and understanding plant needs for healthy growth.',
        category: 'GARDENING',
        filename: 'Basic Plant care.mp4',
        originalName: 'Basic Plant care.mp4',
        fileSize: 14523456,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: true,
        views: 156,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Car Cleaning Techniques',
        description: 'Master comprehensive car cleaning skills including interior and exterior care, proper tools usage, and maintenance techniques.',
        category: 'CLEANING',
        filename: 'Car Cleaning.mp4',
        originalName: 'Car Cleaning.mp4',
        fileSize: 21345678,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: true,
        views: 278,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Laundry Care Basics',
        description: 'Learn essential laundry skills including sorting, washing, drying, and proper care of different fabric types.',
        category: 'LAUNDRY',
        filename: 'Laundry Care.mp4',
        originalName: 'Laundry Care.mp4',
        fileSize: 17654321,
        mimeType: 'video/mp4',
        isPublic: true,
        isFeatured: false,
        views: 198,
        status: 'ACTIVE',
        uploaderId: admin.id
      }
    ];

    for (const video of sampleVideos) {
      await prisma.video.upsert({
        where: { filename: video.filename },
        update: video,
        create: video
      });
    }
    console.log('✅ Sample videos created');

    // Create sample images
    const sampleImages = [
      {
        title: 'Children Learning Activities',
        description: 'Students engaged in interactive learning sessions',
        category: 'LEARNING',
        filename: 'children-learning-1.jpg',
        originalName: 'children-learning-1.jpg',
        fileSize: 2048576, // 2MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: true,
        views: 156,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Learning Session 2',
        description: 'Hands-on skill development activities',
        category: 'LEARNING',
        filename: 'children-learning-2.jpg',
        originalName: 'children-learning-2.jpg',
        fileSize: 1843200, // 1.8MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: false,
        views: 89,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Group Activities',
        description: 'Children participating in fun group activities',
        category: 'ACTIVITIES',
        filename: 'children-activity-1.jpg',
        originalName: 'children-activity-1.jpg',
        fileSize: 1920000, // 1.9MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: true,
        views: 203,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Creative Activities',
        description: 'Students exploring creativity through various activities',
        category: 'ACTIVITIES',
        filename: 'children-activity-2.jpg',
        originalName: 'children-activity-2.jpg',
        fileSize: 1756800, // 1.7MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: false,
        views: 134,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Learning Through Play',
        description: 'Educational activities combined with play',
        category: 'ACTIVITIES',
        filename: 'children-activity-3.jpg',
        originalName: 'children-activity-3.jpg',
        fileSize: 2097152, // 2MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: false,
        views: 78,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Dining Etiquette Training',
        description: 'Children learning proper dining skills and table manners',
        category: 'DINING',
        filename: 'children-dining.jpg',
        originalName: 'children-dining.jpg',
        fileSize: 1638400, // 1.6MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: true,
        views: 178,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Table Setting Skills',
        description: 'Learning professional table setting techniques',
        category: 'TABLE_SETTING',
        filename: 'table-setting-1.jpg',
        originalName: 'table-setting-1.jpg',
        fileSize: 1485760, // 1.4MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: false,
        views: 145,
        status: 'ACTIVE',
        uploaderId: admin.id
      },
      {
        title: 'Advanced Table Setting',
        description: 'Advanced table setting and presentation skills',
        category: 'TABLE_SETTING',
        filename: 'table-setting-2.jpg',
        originalName: 'table-setting-2.jpg',
        fileSize: 1572864, // 1.5MB approximate
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        isPublic: true,
        isFeatured: false,
        views: 98,
        status: 'ACTIVE',
        uploaderId: admin.id
      }
    ];

    for (const image of sampleImages) {
      await prisma.image.upsert({
        where: { filename: image.filename },
        update: image,
        create: image
      });
    }
    console.log('✅ Sample images created');

    // Create sample feedback/testimonials
    const sampleTestimonials = [
      {
        name: 'Sarah Nakamya',
        email: 'sarah.nakamya@email.com',
        feedbackType: 'TESTIMONIAL',
        rating: 5,
        feedback: 'My daughter learned so much during the holiday programme! She now helps with house cleaning without being asked. The instructors were amazing.',
        allowPublicDisplay: true,
        status: 'APPROVED'
      },
      {
        name: 'James Okello',
        email: 'james.okello@email.com',
        feedbackType: 'TESTIMONIAL',
        rating: 5,
        feedback: 'Excellent programme! My son is now responsible for taking care of our dog and keeps his shoes clean. Worth every shilling!',
        allowPublicDisplay: true,
        status: 'APPROVED'
      },
      {
        name: 'Grace Namukasa',
        email: 'grace.namukasa@email.com',
        feedbackType: 'TESTIMONIAL',
        rating: 4,
        feedback: 'Great program that teaches practical skills. My children are more independent now. Would recommend to other parents.',
        allowPublicDisplay: true,
        status: 'APPROVED'
      }
    ];

    for (const testimonial of sampleTestimonials) {
      await prisma.feedback.create({
        data: testimonial
      });
    }
    console.log('✅ Sample testimonials created');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📧 Admin Login Details:
   Email: admin@kampala-kids-skills.com
   Password: admin123
   
🔗 Next Steps:
   1. Start the server: npm run dev
   2. Open admin dashboard: http://localhost:5000/admin
   3. Create programme sessions
   4. Upload actual video content
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });