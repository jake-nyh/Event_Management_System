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
    res.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
});

// Get ticket types with availability info for an event
router.get('/event/:eventId/availability', async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketTypes = await TicketService.getTicketTypesWithAvailability(eventId);
    res.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types with availability:', error);
    res.status(500).json({ error: 'Failed to fetch ticket types with availability' });
  }
});

// Get a specific ticket type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticketType = await TicketService.getTicketTypeById(id);
    
    if (!ticketType) {
      res.status(404).json({ error: 'Ticket type not found' });
      return;
    }
    
    res.json(ticketType);
  } catch (error) {
    console.error('Error fetching ticket type:', error);
    res.status(500).json({ error: 'Failed to fetch ticket type' });
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
      res.status(201).json(ticketType);
    } catch (error) {
      console.error('Error creating ticket type:', error);
      res.status(500).json({ error: 'Failed to create ticket type' });
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
        res.status(400).json({ error: 'Invalid name' });
        return;
      }
      if (price !== undefined && (typeof price !== 'number' || price < 0)) {
        res.status(400).json({ error: 'Invalid price' });
        return;
      }
      if (quantityAvailable !== undefined && (typeof quantityAvailable !== 'number' || quantityAvailable < 1 || !Number.isInteger(quantityAvailable))) {
        res.status(400).json({ error: 'Invalid quantity' });
        return;
      }
      
      const ticketType = await TicketService.updateTicketType(id, req.body);
      
      if (!ticketType) {
        res.status(404).json({ error: 'Ticket type not found' });
        return;
      }
      
      res.json(ticketType);
    } catch (error) {
      console.error('Error updating ticket type:', error);
      res.status(500).json({ error: 'Failed to update ticket type' });
    }
  }
);

// Delete a ticket type (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await TicketService.deleteTicketType(id);
    
    if (!success) {
      res.status(404).json({ error: 'Ticket type not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    res.status(500).json({ error: 'Failed to delete ticket type' });
  }
});

// Check availability for a ticket type
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const isAvailable = await TicketService.checkAvailability(id);
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking ticket availability:', error);
    res.status(500).json({ error: 'Failed to check ticket availability' });
  }
});

// Get available count for a ticket type
router.get('/:id/available-count', async (req, res) => {
  try {
    const { id } = req.params;
    const count = await TicketService.getAvailableCount(id);
    res.json({ availableCount: count });
  } catch (error) {
    console.error('Error getting available count:', error);
    res.status(500).json({ error: 'Failed to get available count' });
  }
});

export default router;