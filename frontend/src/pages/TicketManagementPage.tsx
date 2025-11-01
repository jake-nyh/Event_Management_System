import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TicketTypeList } from '../components/tickets/TicketTypeList';
import { TicketTypeForm } from '../components/tickets/TicketTypeForm';
import { ticketService, CreateTicketTypeData, UpdateTicketTypeData, TicketType } from '../services/ticketService';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TicketManagementPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
  const { toast } = useToast();

  const fetchTicketTypes = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const data = await ticketService.getTicketTypesWithAvailability(eventId);
      setTicketTypes(data);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  const handleCreateTicketType = () => {
    setEditingTicketType(null);
    setShowForm(true);
  };

  const handleEditTicketType = (ticketType: TicketType) => {
    setEditingTicketType(ticketType);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateTicketTypeData | UpdateTicketTypeData) => {
    if (!eventId) return;

    try {
      setSubmitting(true);
      
      if (editingTicketType) {
        await ticketService.updateTicketType(editingTicketType.id, data);
        toast({
          title: 'Success',
          description: 'Ticket type updated successfully',
        });
      } else {
        await ticketService.createTicketType(data as CreateTicketTypeData);
        toast({
          title: 'Success',
          description: 'Ticket type created successfully',
        });
      }
      
      setShowForm(false);
      setEditingTicketType(null);
      await fetchTicketTypes();
    } catch (error) {
      console.error('Error saving ticket type:', error);
      toast({
        title: 'Error',
        description: editingTicketType 
          ? 'Failed to update ticket type' 
          : 'Failed to create ticket type',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTicketType(null);
  };

  const handleDeleteTicketType = async (ticketTypeId: string) => {
    try {
      await ticketService.deleteTicketType(ticketTypeId);
      toast({
        title: 'Success',
        description: 'Ticket type deleted successfully',
      });
      await fetchTicketTypes();
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ticket type',
        variant: 'destructive',
      });
    }
  };

  if (!eventId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The event you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/events/${eventId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ticket Management</h1>
          <p className="text-muted-foreground">
            Manage ticket types and pricing for your event
          </p>
        </div>
      </div>

      <Tabs defaultValue="ticket-types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ticket-types">Ticket Types</TabsTrigger>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ticket-types" className="space-y-4">
          {showForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {editingTicketType ? 'Edit Ticket Type' : 'Create Ticket Type'}
                </h3>
                <Button variant="outline" onClick={handleFormCancel}>
                  Back to List
                </Button>
              </div>
              <TicketTypeForm
                eventId={eventId}
                ticketType={editingTicketType || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={submitting}
              />
            </div>
          ) : (
            <TicketTypeList
              eventId={eventId}
              ticketTypes={ticketTypes}
              onTicketTypeUpdate={fetchTicketTypes}
              isLoading={loading}
            />
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Track ticket sales and revenue for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Sales analytics will be available once tickets are sold
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Settings</CardTitle>
              <CardDescription>
                Configure additional ticket settings and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Advanced ticket settings coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}