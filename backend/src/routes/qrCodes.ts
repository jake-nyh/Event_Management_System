import { Router, Response } from 'express';
import { qrCodeService } from '../services/qrCodeService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: Router = Router();

// Generate QR code for a ticket
router.post('/generate/:ticketId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;

    const result = await qrCodeService.generateQRCode(ticketId);

    if (result.success) {
      return res.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          qrCodeImage: result.qrCodeImage,
          ticketId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate QR code',
      });
    }
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR code',
    });
  }
});

// Get QR code image for a ticket
router.get('/image/:ticketId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;

    const result = await qrCodeService.getTicketQRCodeImage(ticketId);

    if (result.success && result.qrCodeImage) {
      return res.json({
        success: true,
        data: {
          qrCodeImage: result.qrCodeImage,
          ticketId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to get QR code image',
      });
    }
  } catch (error: any) {
    console.error('Error getting QR code image:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get QR code image',
    });
  }
});

// Validate QR code (for event check-in)
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required',
      });
    }
    
    const result = await qrCodeService.validateQRCode(qrData);
    
    if (result.success) {
      return res.json({
        success: true,
        data: {
          ticket: result.ticket,
          message: 'QR code validated successfully',
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Invalid QR code',
      });
    }
  } catch (error: any) {
    console.error('Error validating QR code:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate QR code',
    });
  }
});

// Admin: Get QR code details and validate (for event organizers/admins)
router.post('/admin/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is event creator or website owner
    if (req.user.role !== 'event_creator' && req.user.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creators and website owners can validate QR codes.',
      });
    }

    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required',
      });
    }
    
    const result = await qrCodeService.validateQRCode(qrData);
    
    if (result.success) {
      return res.json({
        success: true,
        data: {
          ticket: result.ticket,
          message: 'QR code validated successfully',
          canCheckIn: result.ticket.status === 'active',
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Invalid QR code',
      });
    }
  } catch (error: any) {
    console.error('Error validating QR code:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate QR code',
    });
  }
});

// Admin: Mark ticket as used via QR code validation
router.post('/admin/mark-used', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is event creator or website owner
    if (req.user.role !== 'event_creator' && req.user.role !== 'website_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creators and website owners can mark tickets as used.',
      });
    }

    const { ticketId, qrData } = req.body;
    
    if (!ticketId || !qrData) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID and QR data are required',
      });
    }
    
    // First validate the QR code matches the ticket
    const validationResult = await qrCodeService.validateQRCode(qrData);
    
    if (!validationResult.success || !validationResult.ticket || validationResult.ticket.id !== ticketId) {
      return res.status(400).json({
        success: false,
        message: 'QR code does not match the provided ticket ID',
      });
    }
    
    // Check if ticket is already used
    if (validationResult.ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Ticket is already ${validationResult.ticket.status}`,
      });
    }
    
    // Mark the ticket as used
    const markUsedResult = await qrCodeService.markTicketAsUsed(ticketId);
    
    if (markUsedResult.success) {
      return res.json({
        success: true,
        data: {
          ticket: markUsedResult.ticket,
          message: 'Ticket marked as used successfully',
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: markUsedResult.error || 'Failed to mark ticket as used',
      });
    }
  } catch (error: any) {
    console.error('Error marking ticket as used:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark ticket as used',
    });
  }
});

// Generate QR codes for multiple tickets
router.post('/generate-multiple', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketIds } = req.body;
    
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid ticket IDs array is required',
      });
    }
    
    const result = await qrCodeService.generateMultipleQRCodes(ticketIds);
    
    return res.json({
      success: true,
      data: result.results,
    });
  } catch (error: any) {
    console.error('Error generating multiple QR codes:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR codes',
    });
  }
});

// Create QR code for event check-in (for organizers)
router.post('/event-check-in/:eventId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // For demo purposes, we'll allow any authenticated user to create check-in QR codes
    // In a real app, this would be restricted to event organizers
    const result = await qrCodeService.createEventCheckInQR(eventId, req.user.id);
    
    if (result.success) {
      return res.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          eventId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create event check-in QR',
      });
    }
  } catch (error: any) {
    console.error('Error creating event check-in QR:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event check-in QR',
    });
  }
});

export default router;