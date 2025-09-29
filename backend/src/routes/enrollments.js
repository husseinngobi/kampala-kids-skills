import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Create new enrollment (parent registration)
router.post('/', [
  // Parent validation
  body('parent.firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Parent first name must be 2-50 characters'),
  body('parent.lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Parent last name must be 2-50 characters'),
  body('parent.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('parent.phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('parent.occupation').optional().trim().isLength({ max: 100 }),
  body('parent.emergencyContact').optional().trim().isLength({ max: 100 }),
  body('parent.emergencyPhone').optional().isMobilePhone(),
  body('parent.address').optional().trim().isLength({ max: 200 }),
  
  // Child validation
  body('child.firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Child first name must be 2-50 characters'),
  body('child.lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Child last name must be 2-50 characters'),
  body('child.age').isInt({ min: 5, max: 17 }).withMessage('Child age must be between 5-17 years'),
  body('child.gender').isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('child.medicalConditions').optional().trim().isLength({ max: 500 }),
  body('child.allergies').optional().trim().isLength({ max: 500 }),
  body('child.specialNeeds').optional().trim().isLength({ max: 500 }),
  
  // Enrollment details
  body('programmeLevelId').isUUID().withMessage('Programme level ID is required'),
  body('sessionId').isUUID().withMessage('Session ID is required'),
  body('preferredSchedule').optional().isIn(['MORNING', 'AFTERNOON', 'EVENING']),
  body('transportNeeded').optional().isBoolean(),
  body('lunchRequired').optional().isBoolean(),
  body('specialRequests').optional().trim().isLength({ max: 500 })
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

    const { parent: parentData, child: childData, ...enrollmentData } = req.body;

    // Check if programme level and session exist and are available
    const [programmeLevel, session] = await Promise.all([
      prisma.programmeLevel.findUnique({ where: { id: enrollmentData.programmeLevelId } }),
      prisma.programmeSession.findUnique({ 
        where: { id: enrollmentData.sessionId },
        include: { _count: { select: { enrollments: true } } }
      })
    ]);

    if (!programmeLevel) {
      return res.status(400).json({
        success: false,
        message: 'Invalid programme level selected'
      });
    }

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session selected'
      });
    }

    if (session.status !== 'UPCOMING') {
      return res.status(400).json({
        success: false,
        message: 'Selected session is no longer available for enrollment'
      });
    }

    if (session._count.enrollments >= session.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Selected session is fully booked'
      });
    }

    // Check if child age is within programme level range
    if (childData.age < programmeLevel.ageMin || childData.age > programmeLevel.ageMax) {
      return res.status(400).json({
        success: false,
        message: `Child age must be between ${programmeLevel.ageMin}-${programmeLevel.ageMax} for selected programme level`
      });
    }

    // Use database transaction for enrollment
    const result = await prisma.$transaction(async (tx) => {
      // Check if parent already exists
      let parent = await tx.parent.findUnique({
        where: { email: parentData.email }
      });

      if (!parent) {
        // Create new parent with temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        parent = await tx.parent.create({
          data: {
            ...parentData,
            password: hashedPassword,
            isActive: true
          }
        });

        // Note: In production, you'd send the temp password via email
        console.log(`Temp password for ${parent.email}: ${tempPassword}`);
      }

      // Check if child already exists for this parent
      let child = await tx.child.findFirst({
        where: {
          parentId: parent.id,
          firstName: childData.firstName,
          lastName: childData.lastName
        }
      });

      if (!child) {
        child = await tx.child.create({
          data: {
            ...childData,
            parentId: parent.id
          }
        });
      }

      // Check if enrollment already exists
      const existingEnrollment = await tx.enrollment.findFirst({
        where: {
          childId: child.id,
          sessionId: enrollmentData.sessionId
        }
      });

      if (existingEnrollment) {
        throw new Error('Child is already enrolled in this session');
      }

      // Create enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          childId: child.id,
          programmeLevelId: enrollmentData.programmeLevelId,
          sessionId: enrollmentData.sessionId,
          preferredSchedule: enrollmentData.preferredSchedule || 'MORNING',
          transportNeeded: enrollmentData.transportNeeded || false,
          lunchRequired: enrollmentData.lunchRequired || false,
          specialRequests: enrollmentData.specialRequests,
          status: 'PENDING',
          totalFee: programmeLevel.fee,
          amountPaid: 0
        }
      });

      return { parent, child, enrollment };
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully! We will contact you within 24 hours to confirm.',
      data: {
        enrollmentId: result.enrollment.id,
        parentEmail: result.parent.email,
        childName: `${result.child.firstName} ${result.child.lastName}`,
        programmeName: programmeLevel.name,
        sessionDates: `${session.startDate} - ${session.endDate}`,
        totalFee: result.enrollment.totalFee,
        enrollmentNumber: `KKS-${result.enrollment.id.slice(0, 8).toUpperCase()}`
      }
    });

  } catch (error) {
    console.error('Error creating enrollment:', error);
    
    if (error.message === 'Child is already enrolled in this session') {
      return res.status(400).json({
        success: false,
        message: 'This child is already enrolled in the selected session'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process enrollment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check enrollment status by email and enrollment number
router.post('/check-status', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('enrollmentNumber').trim().isLength({ min: 5 }).withMessage('Enrollment number is required')
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

    const { email, enrollmentNumber } = req.body;

    // Extract enrollment ID from number (remove KKS- prefix)
    const enrollmentId = enrollmentNumber.replace(/^KKS-/i, '').toLowerCase();

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: { startsWith: enrollmentId },
        child: {
          parent: { email }
        }
      },
      include: {
        child: {
          select: { firstName: true, lastName: true }
        },
        programmeLevel: {
          select: { name: true, fee: true }
        },
        session: {
          select: { startDate: true, endDate: true, location: true, status: true }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found. Please check your email and enrollment number.'
      });
    }

    res.json({
      success: true,
      data: {
        enrollmentNumber: `KKS-${enrollment.id.slice(0, 8).toUpperCase()}`,
        status: enrollment.status,
        childName: `${enrollment.child.firstName} ${enrollment.child.lastName}`,
        programmeName: enrollment.programmeLevel.name,
        sessionDates: `${enrollment.session.startDate} - ${enrollment.session.endDate}`,
        location: enrollment.session.location,
        totalFee: enrollment.totalFee,
        amountPaid: enrollment.amountPaid,
        balanceDue: enrollment.totalFee - enrollment.amountPaid,
        paymentStatus: enrollment.amountPaid >= enrollment.totalFee ? 'PAID' : 'PENDING',
        sessionStatus: enrollment.session.status,
        createdAt: enrollment.createdAt
      }
    });

  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get available programme levels for enrollment
router.get('/programme-levels', async (req, res) => {
  try {
    const levels = await prisma.programmeLevel.findMany({
      where: { isActive: true },
      orderBy: { ageMin: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        ageMin: true,
        ageMax: true,
        fee: true,
        skills: true,
        duration: true
      }
    });

    const formattedLevels = levels.map(level => ({
      ...level,
      skills: JSON.parse(level.skills || '[]'),
      feeFormatted: new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0
      }).format(level.fee),
      ageRange: `${level.ageMin}-${level.ageMax} years`
    }));

    res.json({
      success: true,
      data: formattedLevels
    });
  } catch (error) {
    console.error('Error fetching programme levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programme levels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get available sessions for enrollment
router.get('/sessions', async (req, res) => {
  try {
    const { programmeLevelId } = req.query;

    const where = {
      status: 'UPCOMING',
      startDate: {
        gte: new Date()
      }
    };

    // If programme level is specified, filter sessions
    if (programmeLevelId) {
      // Note: You might want to add a relation between sessions and programme levels
      // For now, we'll return all upcoming sessions
    }

    const sessions = await prisma.programmeSession.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    const formattedSessions = sessions.map(session => ({
      ...session,
      enrolledCount: session._count.enrollments,
      spotsRemaining: session.maxCapacity - session._count.enrollments,
      isAvailable: session._count.enrollments < session.maxCapacity,
      dateRange: `${session.startDate.toLocaleDateString()} - ${session.endDate.toLocaleDateString()}`
    }));

    res.json({
      success: true,
      data: formattedSessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;