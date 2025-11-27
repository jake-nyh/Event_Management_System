import { Router, Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router: Router = Router();

// Get commission settings
router.get('/commissions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const settings = await adminService.getCommissionSettings();
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting commission settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get commission settings'
    });
  }
});

// Update commission settings
router.put('/commissions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { eventCreatorPercentage, platformPercentage, minCommission, maxCommission } = req.body;
    
    const settings = await adminService.updateCommissionSettings({
      eventCreatorPercentage,
      platformPercentage,
      minCommission,
      maxCommission
    });
    
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating commission settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update commission settings'
    });
  }
});

// Get subscription tiers
router.get('/subscriptions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tiers = await adminService.getSubscriptionTiers();
    return res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Error getting subscription tiers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscription tiers'
    });
  }
});

// Create subscription tier
router.post('/subscriptions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, price, duration, features, maxEvents, maxTicketsPerEvent, commissionRate } = req.body;
    
    const tier = await adminService.createSubscriptionTier({
      name,
      price,
      duration,
      features,
      maxEvents,
      maxTicketsPerEvent,
      commissionRate
    });
    
    return res.json({
      success: true,
      data: tier
    });
  } catch (error) {
    console.error('Error creating subscription tier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription tier'
    });
  }
});

// Update subscription tier
router.put('/subscriptions/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, features, maxEvents, maxTicketsPerEvent, commissionRate } = req.body;
    
    const tier = await adminService.updateSubscriptionTier(id, {
      name,
      price,
      duration,
      features,
      maxEvents,
      maxTicketsPerEvent,
      commissionRate
    });
    
    return res.json({
      success: true,
      data: tier
    });
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update subscription tier'
    });
  }
});

// Delete subscription tier
router.delete('/subscriptions/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const success = await adminService.deleteSubscriptionTier(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Subscription tier deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete subscription tier'
      });
    }
  } catch (error) {
    console.error('Error deleting subscription tier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subscription tier'
    });
  }
});

// Get user's subscription
router.get('/subscriptions/my-subscription', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const subscription = await adminService.getUserSubscription(userId);
    
    return res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user subscription'
    });
  }
});

// Subscribe to tier
router.post('/subscriptions/subscribe', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { tierId } = req.body;
    
    if (!userId || !tierId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and tier ID are required'
      });
    }
    
    const subscription = await adminService.subscribeUser(userId, { 
      name: tierId,
      price: 0, // Will be determined by tier
      duration: 1,
      features: [],
      maxEvents: 0,
      maxTicketsPerEvent: 0,
      commissionRate: 0
    });
    
    return res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error subscribing user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe user'
    });
  }
});

// Cancel subscription
router.post('/subscriptions/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const success = await adminService.cancelUserSubscription(userId);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Get users
router.get('/users', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const search = req.query.search as string;
    
    const result = await adminService.getUsers(page, limit, search);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// Update user status
router.put('/users/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const success = await adminService.updateUserStatus(id, isActive);
    
    if (success) {
      return res.json({
        success: true,
        message: 'User status updated successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const success = await adminService.deleteUser(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

export default router;