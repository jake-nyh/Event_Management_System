import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TicketType, TicketTypeWithAvailability } from '../../services/ticketService';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { TicketTypeForm } from './TicketTypeForm';

interface TicketTypeListProps {
  eventId: string;
  ticketTypes: TicketTypeWithAvailability[];
  onTicketTypeUpdate: () => void;
  isLoading?: boolean;
}

export function TicketTypeList({ 
  eventId, 
  ticketTypes, 
  onTicketTypeUpdate, 
  isLoading = false 
}: TicketTypeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);

  const handleCreateTicketType = () => {
    setEditingTicketType(null);
    setShowForm(true);
  };

  const handleEditTicketType = (ticketType: TicketType) => {
    setEditingTicketType(ticketType);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    // This will be implemented in the parent component
    // For now, we'll just close the form
    setShowForm(false);
    setEditingTicketType(null);
    onTicketTypeUpdate();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTicketType(null);
  };

  if (showForm) {
    return (
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
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Ticket Types</h3>
          <p className="text-sm text-muted-foreground">
            Manage ticket types and pricing for your event
          </p>
        </div>
        <Button onClick={handleCreateTicketType} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Ticket Type
        </Button>
      </div>

      {ticketTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No ticket types yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first ticket type to start selling tickets
              </p>
              <Button onClick={handleCreateTicketType}>
                Create Ticket Type
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ticketTypes.map((ticketType) => (
            <Card key={ticketType.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{ticketType.name}</CardTitle>
                    <CardDescription>
                      ${parseFloat(ticketType.price).toFixed(2)} per ticket
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTicketType(ticketType)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete ticket type:', ticketType.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-medium">{ticketType.available}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{ticketType.quantityAvailable}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sold:</span>
                    <span className="font-medium">{ticketType.quantitySold || 0}</span>
                  </div>
                  <div className="pt-2">
                    <Badge 
                      variant={ticketType.available > 0 ? "default" : "secondary"}
                      className="w-full justify-center"
                    >
                      {ticketType.available > 0 ? 'Available' : 'Sold Out'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}