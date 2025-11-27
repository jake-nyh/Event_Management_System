import { Router, Response } from 'express';
import { paymentService, CreatePaymentIntentData, ConfirmPaymentData } from '../services/paymentService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// Create payment intent
router.post('/create-intent', async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, ticketItems, customerEmail } = req.body as CreatePaymentIntentData;
    
    if (!eventId || !ticketItems || !Array.isArray(ticketItems) || ticketItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventId, ticketItems',
      });
    }
    
    const result = await paymentService.createPaymentIntent({
      eventId,
      ticketItems,
      customerEmail: customerEmail || (req.user?.email || ''),
    });
    
    res.json({
      success: true,
      data: result,
    });
    return;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
    return;
  }
});

// Confirm payment
router.post('/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body as ConfirmPaymentData;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing paymentIntentId',
      });
    }
    
    const result = await paymentService.confirmPayment({
      paymentIntentId,
      paymentMethodId,
    });
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          transactionId: result.transactionId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Payment confirmation failed',
      });
    }
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment',
    });
    return;
  }
});

// Get payment details
router.get('/:paymentIntentId', async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentDetails = await paymentService.getPaymentDetails(paymentIntentId);
    
    if (!paymentDetails) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found',
      });
    }
    
    res.json({
      success: true,
      data: paymentDetails,
    });
    return;
  } catch (error: any) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment details',
    });
    return;
  }
});

// Get transaction details
router.get('/transaction/:transactionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await paymentService.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }
    
    res.json({
      success: true,
      data: transaction,
    });
    return;
  } catch (error: any) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transaction',
    });
    return;
  }
});

// Refund payment (mock)
router.post('/refund/:transactionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const result = await paymentService.refundPayment(transactionId);
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Refund processed successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Refund failed',
      });
    }
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund',
    });
    return;
  }
});

// Get customer transactions
router.get('/customer/:customerId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { customerId } = req.params;
    
    // Only allow users to get their own transactions
    if (req.user?.id !== customerId && req.user?.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    const transactions = await paymentService.getCustomerTransactions(customerId);
    
    res.json({
      success: true,
      data: transactions,
    });
    return;
  } catch (error: any) {
    console.error('Error getting customer transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get transactions',
    });
    return;
  }
});

// Get event transactions (for event creators)
router.get('/event/:eventId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    
    // Check if user is the event creator or website owner
    if (req.user?.role !== 'website_owner') {
      // TODO: Add check to verify user owns the event
      // For now, we'll allow all authenticated users
    }
    
    const transactions = await paymentService.getEventTransactions(eventId);
    
    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Error getting event transactions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get event transactions',
    });
  }
});

export default router;