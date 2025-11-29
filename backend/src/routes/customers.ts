import { Router, Response } from 'express';
import { customerService } from '../services/customerService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { qrCodeService } from '../services/qrCodeService';

const router: Router = Router();

// Get customer's tickets
router.get('/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const tickets = await customerService.getCustomerTickets(req.user.id);
    
    return res.json({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    console.error('Error getting customer tickets:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tickets',
    });
  }
});

// Get customer ticket statistics
router.get('/tickets/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const stats = await customerService.getCustomerTicketStats(req.user.id);
    
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting ticket stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ticket statistics',
    });
  }
});

// Get specific ticket by ID
router.get('/tickets/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const ticket = await customerService.getTicketById(id, req.user.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }
    
    return res.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('Error getting ticket:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ticket',
    });
  }
});

// Update ticket status (for transferring, etc.)
router.patch('/tickets/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'used', 'transferred', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const updatedTicket = await customerService.updateTicketStatus(
      id,
      req.user.id,
      status as 'active' | 'used' | 'transferred' | 'refunded'
    );
    
    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }
    
    return res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update ticket status',
    });
  }
});

// Mark ticket as used (for event check-in)
router.post('/tickets/:id/use', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // For demo purposes, we'll allow any authenticated user to mark tickets as used
    // In a real app, this would be restricted to event organizers
    const result = await customerService.markTicketAsUsed(id);

    if (result.success) {
      return res.json({
        success: true,
        data: result.ticket,
        message: 'Ticket marked as used successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to mark ticket as used',
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

// Regenerate QR code for a ticket
router.post('/tickets/:id/regenerate-qr', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify the ticket belongs to the user
    const ticket = await customerService.getTicketById(id, req.user.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied',
      });
    }

    // Generate QR code for this ticket
    const result = await qrCodeService.generateQRCode(id);

    if (result.success) {
      return res.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          qrCodeImage: result.qrCodeImage,
        },
        message: 'QR code generated successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate QR code',
      });
    }
  } catch (error: any) {
    console.error('Error regenerating QR code:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate QR code',
    });
  }
});

// Regenerate QR codes for all tickets without QR codes
router.post('/tickets/regenerate-all-qr', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get all tickets for the user
    const tickets = await customerService.getCustomerTickets(req.user.id);

    // Filter tickets without QR codes
    const ticketsWithoutQR = tickets.filter(t => !t.qrCode);

    if (ticketsWithoutQR.length === 0) {
      return res.json({
        success: true,
        data: { regenerated: 0 },
        message: 'All tickets already have QR codes',
      });
    }

    // Generate QR codes for each ticket
    const results = [];
    for (const ticket of ticketsWithoutQR) {
      const result = await qrCodeService.generateQRCode(ticket.id);
      results.push({
        ticketId: ticket.id,
        success: result.success,
        error: result.error,
      });
    }

    const successCount = results.filter(r => r.success).length;

    return res.json({
      success: true,
      data: {
        regenerated: successCount,
        total: ticketsWithoutQR.length,
        results,
      },
      message: `Generated QR codes for ${successCount} of ${ticketsWithoutQR.length} tickets`,
    });
  } catch (error: any) {
    console.error('Error regenerating QR codes:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate QR codes',
    });
  }
});

export default router;