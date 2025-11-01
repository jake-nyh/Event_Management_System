import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventService, Event, TicketType } from '@/services/eventService';
import { Calendar, Clock, MapPin, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';

export function TicketPurchasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  const { data: ticketTypes } = useQuery({
    queryKey: ['eventTicketTypes', id],
    queryFn: () => eventService.getTicketTypesForEvent(id!),
    enabled: !!id,
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>('');

  const updateQuantity = (ticketTypeId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketTypeId]: Math.max(0, (prev[ticketTypeId] || 0) + delta),
    }));
  };

  const getTotalPrice = () => {
    if (!ticketTypes || !quantities) return 0;
    
    return ticketTypes.reduce((total, ticketType) => {
      const quantity = quantities[ticketType.id] || 0;
      const price = parseFloat(ticketType.price);
      return total + (price * quantity);
    }, 0);
  };

  const getTotalQuantity = () => {
    if (!quantities) return 0;
    return Object.values(quantities).reduce((total, quantity) => total + quantity, 0);
  };

  const canProceed = () => {
    return getTotalQuantity() > 0 && selectedTicketTypeId;
  };

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to purchase tickets',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const selectedTickets = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

    // TODO: Implement actual purchase logic with Stripe
    console.log('Purchase tickets:', selectedTickets);
    
    toast({
      title: 'Coming Soon',
      description: 'Ticket purchasing will be available soon. Payment integration is in progress.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Event not found</h3>
        <p className="text-gray-500">The event you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const availableTicketTypes = ticketTypes?.filter(tt => tt.quantityAvailable > 0) || [];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Event
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {event.category && (
                  <Badge variant="outline" className="mb-2">
                    {event.category}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              {event.description && (
                <p className="text-gray-700">{event.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{formatTime(event.eventTime)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>

              {event.tags && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.split(',').map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Tickets</CardTitle>
              <CardDescription>
                Choose the tickets you want to purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableTicketTypes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No tickets available for this event
                </p>
              ) : (
                availableTicketTypes.map((ticketType) => (
                  <div key={ticketType.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{ticketType.name}</h4>
                        <p className="text-2xl font-bold text-primary">
                          ${parseFloat(ticketType.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ticketType.quantityAvailable} available
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(ticketType.id, -1)}
                          disabled={quantities[ticketType.id] <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {quantities[ticketType.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(ticketType.id, 1)}
                          disabled={quantities[ticketType.id] >= ticketType.quantityAvailable}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Order Summary */}
              {getTotalQuantity() > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tickets:</span>
                      <span>{getTotalQuantity()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Price:</span>
                      <span className="font-bold text-lg">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Button */}
      <div className="mt-8">
        <Button
          size="lg"
          className="w-full"
          onClick={handlePurchase}
          disabled={!canProceed()}
        >
          Purchase Tickets
        </Button>
      </div>
    </div>
  );
}