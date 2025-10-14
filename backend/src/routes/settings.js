import express from 'express';

const router = express.Router();

// In-memory storage for watermark settings (in production, use database)
let watermarkSettings = {
  id: 'logo-main',
  name: 'Kampala Kids Skills Logo',
  url: '/assets/life-skills-logo.png',
  localPath: '/src/assets/life-skills-logo.png',
  position: 'bottom-right',
  opacity: 0.8,
  size: 'medium',
  isActive: true,
  pages: ['home', 'gallery', 'about', 'contact'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Available watermark presets
const watermarkPresets = [
  {
    id: 'logo-main',
    name: 'Main Logo',
    url: '/assets/life-skills-logo.png',
    localPath: '/src/assets/life-skills-logo.png',
    position: 'bottom-right',
    opacity: 0.8,
    size: 'medium'
  },
  {
    id: 'logo-center',
    name: 'Center Logo (Light)',
    url: '/assets/life-skills-logo.png',
    localPath: '/src/assets/life-skills-logo.png',
    position: 'center',
    opacity: 0.1,
    size: 'large'
  },
  {
    id: 'logo-corner',
    name: 'Corner Logo (Small)',
    url: '/assets/life-skills-logo.png',
    localPath: '/src/assets/life-skills-logo.png',
    position: 'top-right',
    opacity: 0.9,
    size: 'small'
  }
];

/**
 * @swagger
 * /api/settings/watermark:
 *   get:
 *     summary: Get current watermark configuration
 *     description: Retrieve the active watermark settings for the application
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Current watermark configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 watermark:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                     position:
 *                       type: string
 *                       enum: [top-left, top-right, bottom-left, bottom-right, center]
 *                     opacity:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     size:
 *                       type: string
 *                       enum: [small, medium, large]
 *                     isActive:
 *                       type: boolean
 */
router.get('/watermark', (req, res) => {
  try {
    console.log('🎨 Getting watermark configuration');
    
    res.json({
      success: true,
      watermark: watermarkSettings,
      message: 'Watermark configuration retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting watermark configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get watermark configuration'
    });
  }
});

/**
 * @swagger
 * /api/settings/watermark:
 *   put:
 *     summary: Update watermark configuration
 *     description: Update the active watermark settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               presetId:
 *                 type: string
 *                 description: ID of watermark preset to use
 *               position:
 *                 type: string
 *                 enum: [top-left, top-right, bottom-left, bottom-right, center]
 *               opacity:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               size:
 *                 type: string
 *                 enum: [small, medium, large]
 *               isActive:
 *                 type: boolean
 *               pages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Watermark configuration updated successfully
 *       400:
 *         description: Invalid watermark configuration
 *       500:
 *         description: Server error
 */
router.put('/watermark', (req, res) => {
  try {
    console.log('🎨 Updating watermark configuration:', req.body);
    
    const { presetId, position, opacity, size, isActive, pages } = req.body;
    
    // If preset ID is provided, use preset as base
    if (presetId) {
      const preset = watermarkPresets.find(p => p.id === presetId);
      if (!preset) {
        return res.status(400).json({
          success: false,
          error: 'Invalid preset ID'
        });
      }
      
      // Update with preset values
      watermarkSettings = {
        ...watermarkSettings,
        ...preset,
        isActive: isActive !== undefined ? isActive : true,
        pages: pages || watermarkSettings.pages,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Apply individual overrides
    if (position !== undefined) watermarkSettings.position = position;
    if (opacity !== undefined) watermarkSettings.opacity = Math.max(0, Math.min(1, opacity));
    if (size !== undefined) watermarkSettings.size = size;
    if (isActive !== undefined) watermarkSettings.isActive = isActive;
    if (pages !== undefined) watermarkSettings.pages = pages;
    
    watermarkSettings.updatedAt = new Date().toISOString();
    
    console.log('✅ Watermark configuration updated:', watermarkSettings);
    
    res.json({
      success: true,
      watermark: watermarkSettings,
      message: 'Watermark configuration updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating watermark configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update watermark configuration'
    });
  }
});

/**
 * @swagger
 * /api/settings/watermark/presets:
 *   get:
 *     summary: Get available watermark presets
 *     description: Retrieve all available watermark preset configurations
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: List of available watermark presets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 presets:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/watermark/presets', (req, res) => {
  try {
    console.log('🎨 Getting watermark presets');
    
    res.json({
      success: true,
      presets: watermarkPresets,
      current: watermarkSettings,
      message: 'Watermark presets retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting watermark presets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get watermark presets'
    });
  }
});

/**
 * @swagger
 * /api/settings/watermark/toggle:
 *   post:
 *     summary: Toggle watermark visibility
 *     description: Enable or disable the watermark display
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Watermark visibility toggled successfully
 */
router.post('/watermark/toggle', (req, res) => {
  try {
    console.log('🎨 Toggling watermark visibility');
    
    watermarkSettings.isActive = !watermarkSettings.isActive;
    watermarkSettings.updatedAt = new Date().toISOString();
    
    console.log(`✅ Watermark ${watermarkSettings.isActive ? 'enabled' : 'disabled'}`);
    
    res.json({
      success: true,
      watermark: watermarkSettings,
      message: `Watermark ${watermarkSettings.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('❌ Error toggling watermark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle watermark'
    });
  }
});

export default router;