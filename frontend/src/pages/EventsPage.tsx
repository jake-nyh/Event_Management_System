import React, { useState, useEffect } from 'react';
import { EventList } from '@/components/events/EventList';
import { EventSearchFilters } from '@/components/events/EventSearchFilters';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { EventFilters, EventsResponse, eventService } from '@/services/eventService';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    location: '',
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [eventsData, setEventsData] = useState<EventsResponse>({ events: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const isCreator = user?.role === 'event_creator';

  useEffect(() => {
    fetchEvents();
  }, [filters, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents({
        ...filters,
        page: currentPage,
        limit: 12
      });
      setEventsData(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isCreator ? 'My Events' : 'Browse Events'}
        </h1>
        
        {isCreator && (
          <Button onClick={() => navigate('/create-event')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        )}
      </div>

      <EventSearchFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      <EventList
        events={eventsData.events}
        loading={loading}
        total={eventsData.total}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}