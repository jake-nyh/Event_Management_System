import { Router, Request, Response } from 'express';
import { eventService, CreateEventData, UpdateEventData, EventFilters, uploadEventImage } from '../services/eventService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router: Router = Router();

// Get all events (public endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: EventFilters = {
      search: req.query.search as string,
      location: req.query.location as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    // Only show published events to the public
    if (!filters.status) {
      filters.status = 'published';
    }

    const result = await eventService.getEvents(filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Failed to get events' });
  }
});

// Get event by ID (public endpoint)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Only allow access to published events unless the user is the creator
    if (event.status !== 'published') {
      // For now, we'll require authentication for non-published events
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ message: 'Authentication required for this event' });
        return;
      }
      
      // Simple token verification for this endpoint
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ message: 'Server configuration error' });
        return;
      }
      
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret) as any;
        if (!decoded || decoded.id !== event.creatorId) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      } catch (jwtError) {
        res.status(403).json({ message: 'Invalid token' });
        return;
      }
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: 'Failed to get event' });
  }
});

// Create new event (protected endpoint)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'event_creator') {
      res.status(403).json({ message: 'Only event creators can create events' });
      return;
    }

    const eventData: CreateEventData = req.body;
    const newEvent = await eventService.createEvent(user.id, eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event (protected endpoint)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const eventData: UpdateEventData = req.body;
    const updatedEvent = await eventService.updateEvent(id, user.id, eventData);
    
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event not found or access denied' });
      return;
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event (protected endpoint)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const deleted = await eventService.deleteEvent(id, user.id);
    
    if (!deleted) {
      res.status(404).json({ message: 'Event not found or access denied' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// Get events by creator (protected endpoint)
router.get('/creator/my-events', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const filters: EventFilters = {
      search: req.query.search as string,
      location: req.query.location as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await eventService.getEventsByCreator(user.id, filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting creator events:', error);
    res.status(500).json({ message: 'Failed to get events' });
  }
});

// Update event status (protected endpoint)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const { status } = req.body;
    
    const updatedEvent = await eventService.updateEventStatus(id, user.id, status);
    
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event not found or access denied' });
      return;
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ message: 'Failed to update event status' });
  }
});

// Get ticket types for an event
router.get('/:id/ticket-types', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticketTypes = await eventService.getTicketTypesForEvent(id);
    res.json(ticketTypes);
  } catch (error) {
    console.error('Error getting ticket types:', error);
    res.status(500).json({ message: 'Failed to get ticket types' });
  }
});

// Get sold tickets for an event (protected endpoint for event organizers)
router.get('/:id/sold-tickets', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // Check if user is the event creator
    const event = await eventService.getEventById(id);
    if (!event || event.creatorId !== user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const tickets = await eventService.getSoldTicketsForEvent(id);
    res.json(tickets);
  } catch (error) {
    console.error('Error getting sold tickets:', error);
    res.status(500).json({ message: 'Failed to get sold tickets' });
  }
});

// Upload event image (protected endpoint)
router.post('/:id/upload-image', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }
    
    const result = await uploadEventImage(req.file, id, user.id);
    
    if (!result.success) {
      res.status(400).json({ message: result.error || 'Failed to upload image' });
      return;
    }
    
    res.json({
      success: true,
      filename: result.filename,
      url: result.url,
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;