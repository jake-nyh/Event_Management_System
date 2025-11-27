import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { eventService, CreateEventData, CreateTicketType } from '@/services/eventService';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required').max(255, 'Location must be less than 255 characters'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  category: z.string().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  commissionRate: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
});

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket type name is required'),
  price: z.string().min(1, 'Price is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a valid positive number',
  }),
  quantityAvailable: z.number().min(1, 'Quantity must be at least 1'),
});

type EventFormData = z.infer<typeof eventSchema>;
type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;

export function EditEventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState<CreateTicketType[]>([
    { name: '', price: '', quantityAvailable: 1 },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });

  const { data: existingTicketTypes } = useQuery({
    queryKey: ['eventTicketTypes', id],
    queryFn: () => eventService.getTicketTypesForEvent(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; eventData: Partial<CreateEventData> }) => 
      eventService.updateEvent(data.id, data.eventData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Event updated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      eventDate: '',
      eventTime: '',
      category: '',
      tags: '',
      isFeatured: false,
      commissionRate: '5.00',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || '',
        location: event.location,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        category: event.category || '',
        tags: event.tags || '',
        isFeatured: event.isFeatured || false,
        commissionRate: event.commissionRate || '5.00',
        status: event.status,
      });
    }
  }, [event, form]);

  useEffect(() => {
    if (existingTicketTypes && existingTicketTypes.length > 0) {
      setTicketTypes(existingTicketTypes.map(tt => ({
        name: tt.name,
        price: tt.price,
        quantityAvailable: tt.quantityAvailable,
      })));
    }
  }, [existingTicketTypes]);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', quantityAvailable: 1 }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof TicketTypeFormData, value: string | number) => {
    const updatedTicketTypes = [...ticketTypes];
    updatedTicketTypes[index] = { ...updatedTicketTypes[index], [field]: value };
    setTicketTypes(updatedTicketTypes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateTicketTypes = (): boolean => {
    for (const ticketType of ticketTypes) {
      if (!ticketType.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'All ticket types must have a name',
          variant: 'destructive',
        });
        return false;
      }
      if (!ticketType.price.trim() || isNaN(parseFloat(ticketType.price)) || parseFloat(ticketType.price) <= 0) {
        toast({
          title: 'Validation Error',
          description: 'All ticket types must have a valid positive price',
          variant: 'destructive',
        });
        return false;
      }
      if (ticketType.quantityAvailable < 1) {
        toast({
          title: 'Validation Error',
          description: 'All ticket types must have at least 1 ticket available',
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (data: EventFormData) => {
    if (!validateTicketTypes()) {
      return;
    }

    if (!id) return;

    const eventData: Partial<CreateEventData> = {
      ...data,
      ticketTypes: ticketTypes.map(tt => ({
        name: tt.name,
        price: tt.price,
        quantityAvailable: tt.quantityAvailable,
      })),
    };

    // Update event first
    updateMutation.mutate({ id, eventData });
    
    // Upload image if provided
    if (imageFile) {
      const uploadResult = await eventService.uploadEventImage(id, imageFile);
      if (!uploadResult.success) {
        toast({
          title: 'Warning',
          description: `Event updated but image upload failed: ${uploadResult.error}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Event and image updated successfully!',
        });
      }
    }
  };

  if (eventLoading) {
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
        <p className="text-gray-500">The event you're trying to edit doesn't exist.</p>
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update the details of your event. You can save it as a draft or publish it immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter event description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your event to attract attendees.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="health">Health & Wellness</SelectItem>
                          <SelectItem value="arts">Arts & Culture</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="food">Food & Drink</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the category that best describes your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tags separated by commas"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add tags to help users find your event (e.g., tech, startup, networking).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Event</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select featured status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Featured events are highlighted on the homepage and in search results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <div className="space-y-4">
                <FormLabel>Event Image</FormLabel>
                <FormDescription>
                  Upload a new image for your event. This will replace the current image.
                </FormDescription>
                
                {imagePreview || event?.imageUrl ? (
                  <div className="relative">
                    <img
                      src={imagePreview || event?.imageUrl}
                      alt="Event preview"
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-gray-500">Click to upload or drag and drop</div>
                      <div className="text-sm text-gray-400">PNG, JPG, WEBP up to 5MB</div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="100" 
                          placeholder="5.00"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of ticket sales that goes to the platform.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Update the status of your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Ticket Types</h3>
                  <Button type="button" variant="outline" onClick={addTicketType}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ticket Type
                  </Button>
                </div>
                
                {ticketTypes.map((ticketType, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-1">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={ticketType.name}
                          onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                          placeholder="e.g., General Admission"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ticketType.price}
                          onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={ticketType.quantityAvailable}
                          onChange={(e) => updateTicketType(index, 'quantityAvailable', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeTicketType(index)}
                        disabled={ticketTypes.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Event'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}