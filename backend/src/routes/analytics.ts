import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// Get dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Only website owners can access dashboard analytics
    if (req.user?.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only website owners can access dashboard analytics.'
      });
    }

    const analytics = await analyticsService.getDashboardAnalytics(
      startDate as string,
      endDate as string
    );

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting dashboard analytics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard analytics'
    });
  }
});

// Get event analytics
router.get('/events/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user is the event creator or website owner
    if (req.user?.role !== 'website_owner') {
      // TODO: Add check to verify user owns the event
      // For now, we'll allow event creators to access their own events
    }

    const analytics = await analyticsService.getEventAnalytics(id);

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting event analytics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get event analytics'
    });
  }
});

// Get sales analytics
router.get('/sales', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Only website owners can access sales analytics
    if (req.user?.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only website owners can access sales analytics.'
      });
    }

    const analytics = await analyticsService.getSalesAnalytics(
      startDate as string,
      endDate as string
    );

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting sales analytics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sales analytics'
    });
  }
});

// Get commission analytics
router.get('/commissions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Only website owners can access commission analytics
    if (req.user?.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only website owners can access commission analytics.'
      });
    }

    const analytics = await analyticsService.getCommissionAnalytics(
      startDate as string,
      endDate as string
    );

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting commission analytics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get commission analytics'
    });
  }
});

// Get creator analytics (for event creators)
router.get('/creator', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Only event creators can access their analytics
    if (req.user?.role !== 'event_creator' && req.user?.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creators can access creator analytics.'
      });
    }

    const analytics = await analyticsService.getCreatorAnalytics(userId);

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting creator analytics:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get creator analytics'
    });
  }
});

export default router;