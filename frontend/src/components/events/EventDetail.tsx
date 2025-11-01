import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventService, Event, TicketType } from '@/services/eventService';
import { Calendar, MapPin, Clock, ArrowLeft, Edit, Trash2, User, Star, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  const { data: ticketTypes } = useQuery({
    queryKey: ['eventTicketTypes', id],
    queryFn: () => eventService.getTicketTypesForEvent(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate(id!);
    }
  };

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isCreator = user && event && user.id === event.creatorId;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Event not found</h3>
        <p className="text-gray-500">The event you're looking for doesn't exist or you don't have access to it.</p>
        <Button className="mt-4" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                {event.isFeatured && (
                  <Badge className="bg-yellow-400 text-yellow-900">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                {event.category && (
                  <Badge variant="outline">
                    {event.category}
                  </Badge>
                )}
                {event.creator && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {event.creator.firstName} {event.creator.lastName}
                  </div>
                )}
              </div>
            </div>
            
            {isCreator && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/${id}/tickets`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Manage Tickets
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {event.imageUrl && (
            <div className="w-full">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          {event.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(event.eventDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{formatTime(event.eventTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          </div>

          {event.commissionRate && (
            <div>
              <p className="text-sm text-gray-500">Commission Rate</p>
              <p className="font-medium">{event.commissionRate}%</p>
            </div>
          )}

          {event.tags && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.split(',').map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {ticketTypes && ticketTypes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Tickets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticketTypes.map((ticketType) => (
                  <Card key={ticketType.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{ticketType.name}</h4>
                        <p className="text-2xl font-bold text-primary mt-1">
                          ${parseFloat(ticketType.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticketType.quantityAvailable} tickets available
                        </p>
                      </div>
                      {event.status === 'published' && ticketType.quantityAvailable > 0 && (
                        <Button
                          onClick={() => navigate(`/events/${id}/purchase?ticketType=${ticketType.id}`)}
                          size="sm"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {event.status === 'published' && ticketTypes && ticketTypes.some(tt => tt.quantityAvailable > 0) && (
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={() => navigate(`/events/${id}/purchase`)}
              >
                Purchase Tickets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}