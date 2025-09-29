import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';

const router = express.Router();

// Submit contact form
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('subject').optional().trim().isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10-1000 characters'),
  body('inquiryType').optional().isIn(['GENERAL', 'ENROLLMENT', 'FEEDBACK', 'COMPLAINT', 'SUGGESTION'])
    .withMessage('Invalid inquiry type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message, inquiryType = 'GENERAL' } = req.body;

    // Check if parent exists in the system
    let parent = null;
    try {
      parent = await prisma.parent.findUnique({
        where: { email }
      });
    } catch (e) {
      // Parent doesn't exist, that's fine for contact forms
    }

    // Create contact inquiry
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject: subject || `${inquiryType.toLowerCase()} inquiry`,
        message,
        inquiryType,
        parentId: parent?.id || null,
        status: 'NEW',
        priority: determinePriority(inquiryType, message)
      }
    });

    // Send auto-reply based on inquiry type
    const autoReplyMessage = getAutoReplyMessage(inquiryType);

    res.status(201).json({
      success: true,
      message: autoReplyMessage,
      data: {
        id: inquiry.id,
        referenceNumber: `INQ-${inquiry.id.slice(0, 8).toUpperCase()}`,
        createdAt: inquiry.createdAt,
        estimatedResponse: getEstimatedResponseTime(inquiry.priority)
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your inquiry. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get contact inquiry status
router.get('/status/:referenceNumber', async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    
    // Extract inquiry ID from reference number (remove INQ- prefix)
    const inquiryId = referenceNumber.replace(/^INQ-/i, '').toLowerCase();

    const inquiry = await prisma.contactInquiry.findFirst({
      where: {
        id: { startsWith: inquiryId }
      },
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        priority: true,
        inquiryType: true,
        createdAt: true,
        respondedAt: true,
        response: true
      }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found. Please check your reference number.'
      });
    }

    res.json({
      success: true,
      data: {
        referenceNumber: `INQ-${inquiry.id.slice(0, 8).toUpperCase()}`,
        name: inquiry.name,
        subject: inquiry.subject,
        status: inquiry.status,
        priority: inquiry.priority,
        inquiryType: inquiry.inquiryType,
        submittedAt: inquiry.createdAt,
        respondedAt: inquiry.respondedAt,
        response: inquiry.response,
        statusMessage: getStatusMessage(inquiry.status)
      }
    });

  } catch (error) {
    console.error('Error checking inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check inquiry status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get FAQ data
router.get('/faq', async (req, res) => {
  try {
    // This could be stored in the database, but for now we'll return static FAQ data
    const faqs = [
      {
        id: 1,
        category: 'ENROLLMENT',
        question: 'What age groups do you accept?',
        answer: 'We accept children from 5 to 17 years old. We have different programme levels based on age groups: Beginners (5-8 years), Intermediate (9-12 years), and Advanced (13-17 years).',
        order: 1
      },
      {
        id: 2,
        category: 'ENROLLMENT',
        question: 'How much does the programme cost?',
        answer: 'Our programme fees vary by level and duration. Please check our programme levels page for current pricing. We also offer payment plans and some scholarships for qualifying families.',
        order: 2
      },
      {
        id: 3,
        category: 'PROGRAMME',
        question: 'What skills will my child learn?',
        answer: 'Children will learn essential life skills including house cleaning, pet care, shoe care, table setting, basic cooking, personal hygiene, time management, and responsibility. The curriculum is age-appropriate and progressive.',
        order: 3
      },
      {
        id: 4,
        category: 'PROGRAMME',
        question: 'How long is each programme session?',
        answer: 'Our holiday programmes typically run for 2-4 weeks, with daily sessions of 3-4 hours. We offer morning, afternoon, and evening schedules to accommodate different family needs.',
        order: 4
      },
      {
        id: 5,
        category: 'LOGISTICS',
        question: 'Do you provide transportation?',
        answer: 'We can arrange transportation for an additional fee. Please indicate your transportation needs during enrollment, and we will provide details about routes and costs.',
        order: 5
      },
      {
        id: 6,
        category: 'LOGISTICS',
        question: 'Do you provide meals?',
        answer: 'We provide healthy snacks and can arrange lunch for an additional fee. We accommodate dietary restrictions and allergies. Please inform us of any special dietary needs during enrollment.',
        order: 6
      },
      {
        id: 7,
        category: 'SAFETY',
        question: 'What safety measures do you have in place?',
        answer: 'We maintain a low student-to-instructor ratio, conduct background checks on all staff, have first aid trained personnel on site, and require emergency contact information for all children.',
        order: 7
      },
      {
        id: 8,
        category: 'PAYMENT',
        question: 'What payment methods do you accept?',
        answer: 'We accept cash, mobile money (MTN Mobile Money, Airtel Money), bank transfers, and credit/debit cards. Payment plans are available for qualifying families.',
        order: 8
      }
    ];

    // Group FAQs by category
    const faqsByCategory = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        faqs: faqsByCategory,
        categories: ['ENROLLMENT', 'PROGRAMME', 'LOGISTICS', 'SAFETY', 'PAYMENT']
      }
    });

  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit feedback or testimonial
router.post('/feedback', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('feedbackType').isIn(['TESTIMONIAL', 'SUGGESTION', 'COMPLAINT', 'GENERAL'])
    .withMessage('Invalid feedback type'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('feedback').trim().isLength({ min: 10, max: 1000 }).withMessage('Feedback must be between 10-1000 characters'),
  body('allowPublicDisplay').optional().isBoolean().withMessage('allowPublicDisplay must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, feedbackType, rating, feedback, allowPublicDisplay = false } = req.body;

    // Check if parent exists
    let parent = null;
    if (email) {
      try {
        parent = await prisma.parent.findUnique({
          where: { email }
        });
      } catch (e) {
        // Parent doesn't exist
      }
    }

    // Create feedback record
    const feedbackRecord = await prisma.feedback.create({
      data: {
        name,
        email,
        feedbackType,
        rating,
        feedback,
        allowPublicDisplay: Boolean(allowPublicDisplay),
        parentId: parent?.id || null,
        status: 'NEW'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      data: {
        id: feedbackRecord.id,
        referenceNumber: `FB-${feedbackRecord.id.slice(0, 8).toUpperCase()}`,
        createdAt: feedbackRecord.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get public testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await prisma.feedback.findMany({
      where: {
        feedbackType: 'TESTIMONIAL',
        allowPublicDisplay: true,
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        feedback: true,
        rating: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: testimonials
    });

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Utility functions
function determinePriority(inquiryType, message) {
  const urgentKeywords = ['urgent', 'emergency', 'complaint', 'problem', 'issue', 'help'];
  const messageText = message.toLowerCase();
  
  if (inquiryType === 'COMPLAINT' || urgentKeywords.some(keyword => messageText.includes(keyword))) {
    return 'HIGH';
  }
  
  if (inquiryType === 'ENROLLMENT') {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

function getAutoReplyMessage(inquiryType) {
  const messages = {
    GENERAL: 'Thank you for your inquiry! We will get back to you within 24-48 hours.',
    ENROLLMENT: 'Thank you for your enrollment inquiry! Our admissions team will contact you within 24 hours with detailed information.',
    FEEDBACK: 'Thank you for your feedback! We value your input and will review your message promptly.',
    COMPLAINT: 'Thank you for bringing this to our attention. We take all concerns seriously and will respond within 24 hours.',
    SUGGESTION: 'Thank you for your suggestion! We appreciate your ideas for improving our programme.'
  };
  
  return messages[inquiryType] || messages.GENERAL;
}

function getEstimatedResponseTime(priority) {
  const times = {
    HIGH: '24 hours',
    MEDIUM: '24-48 hours',
    LOW: '2-3 business days'
  };
  
  return times[priority] || times.MEDIUM;
}

function getStatusMessage(status) {
  const messages = {
    NEW: 'Your inquiry has been received and is being reviewed.',
    IN_PROGRESS: 'Your inquiry is being processed by our team.',
    RESPONDED: 'We have responded to your inquiry. Please check your email.',
    RESOLVED: 'Your inquiry has been resolved.',
    CLOSED: 'Your inquiry has been closed.'
  };
  
  return messages[status] || 'Status unknown';
}

export default router;