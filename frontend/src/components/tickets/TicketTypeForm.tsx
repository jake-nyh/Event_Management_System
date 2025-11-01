import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { CreateTicketTypeData, UpdateTicketTypeData, TicketType } from '../../services/ticketService';
import { useToast } from '../ui/use-toast';

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket type name is required').max(100, 'Name cannot exceed 100 characters'),
  price: z.number().min(0, 'Price must be positive'),
  quantityAvailable: z.number().int().min(1, 'Quantity must be at least 1'),
});

type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;

interface TicketTypeFormProps {
  eventId: string;
  ticketType?: TicketType;
  onSubmit: (data: CreateTicketTypeData | UpdateTicketTypeData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TicketTypeForm({ 
  eventId, 
  ticketType, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: TicketTypeFormProps) {
  const { toast } = useToast();
  const isEditing = !!ticketType;

  const form = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      name: ticketType?.name || '',
      price: ticketType ? parseFloat(ticketType.price) : 0,
      quantityAvailable: ticketType?.quantityAvailable || 1,
    },
  });

  const handleSubmit = async (data: TicketTypeFormData) => {
    try {
      if (isEditing && ticketType) {
        await onSubmit({ ...data, eventId });
        toast({
          title: 'Success',
          description: 'Ticket type updated successfully',
        });
      } else {
        await onSubmit({ ...data, eventId });
        toast({
          title: 'Success',
          description: 'Ticket type created successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update ticket type' : 'Failed to create ticket type',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Ticket Type' : 'Create Ticket Type'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the ticket type information' 
            : 'Add a new ticket type for your event'
          }
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Type Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., General Admission, VIP" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantityAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="1"
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}