import express, { Router } from 'express';
import { TicketService } from '../services/ticketService';
import { authenticateToken } from '../middleware/auth';
import { validate, ticketTypeSchema } from '../utils/validation';

const router: Router = express.Router();

// Get all ticket types for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketTypes = await TicketService.getTicketTypesByEvent(eventId);
    return res.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
});

// Get ticket types with availability info for an event
router.get('/event/:eventId/availability', async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketTypes = await TicketService.getTicketTypesWithAvailability(eventId);
    return res.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types with availability:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket types with availability' });
  }
});

// Get a specific ticket type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticketType = await TicketService.getTicketTypeById(id);
    
    if (!ticketType) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }
    
    return res.json(ticketType);
  } catch (error) {
    console.error('Error fetching ticket type:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket type' });
  }
});

// Create a new ticket type (protected route)
router.post(
  '/',
  authenticateToken,
  validate(ticketTypeSchema),
  async (req, res) => {
    try {
      const { eventId, ...ticketTypeData } = req.body;
      const ticketType = await TicketService.createTicketType({
        ...ticketTypeData,
        eventId
      });
      return res.status(201).json(ticketType);
    } catch (error) {
      console.error('Error creating ticket type:', error);
      return res.status(500).json({ error: 'Failed to create ticket type' });
    }
  }
);

// Update a ticket type (protected route)
router.put(
  '/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, quantityAvailable } = req.body;
      
      // Basic validation
      if (name !== undefined && (typeof name !== 'string' || name.length < 1 || name.length > 100)) {
        return res.status(400).json({ error: 'Invalid name' });
      }
      if (price !== undefined && (typeof price !== 'number' || price < 0)) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      if (quantityAvailable !== undefined && (typeof quantityAvailable !== 'number' || quantityAvailable < 1 || !Number.isInteger(quantityAvailable))) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }
      
      const ticketType = await TicketService.updateTicketType(id, req.body);
      
      if (!ticketType) {
        return res.status(404).json({ error: 'Ticket type not found' });
      }
      
      return res.json(ticketType);
    } catch (error) {
      console.error('Error updating ticket type:', error);
      return res.status(500).json({ error: 'Failed to update ticket type' });
    }
  }
);

// Delete a ticket type (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await TicketService.deleteTicketType(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    return res.status(500).json({ error: 'Failed to delete ticket type' });
  }
});

// Check availability for a ticket type
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const isAvailable = await TicketService.checkAvailability(id);
    return res.json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking ticket availability:', error);
    return res.status(500).json({ error: 'Failed to check ticket availability' });
  }
});

// Get available count for a ticket type
router.get('/:id/available-count', async (req, res) => {
  try {
    const { id } = req.params;
    const count = await TicketService.getAvailableCount(id);
    return res.json({ availableCount: count });
  } catch (error) {
    console.error('Error getting available count:', error);
    return res.status(500).json({ error: 'Failed to get available count' });
  }
});

export default router;