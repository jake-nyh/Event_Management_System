import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { eventService, CreateEventData, CreateTicketType } from '@/services/eventService';
import { 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Image, 
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Step schemas
const basicInfoSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Please provide a more detailed description').max(1000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
});

const detailsSchema = z.object({
  location: z.string().min(3, 'Location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  isVirtual: z.boolean().default(false),
});

const ticketsSchema = z.object({
  ticketTypes: z.array(z.object({
    name: z.string().min(1, 'Ticket name is required'),
    price: z.string().min(1, 'Price is required'),
    quantityAvailable: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one ticket type is required'),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;
type DetailsData = z.infer<typeof detailsSchema>;
type TicketsData = z.infer<typeof ticketsSchema>;

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Tell us about your event',
    icon: Calendar,
  },
  {
    id: 2,
    title: 'Event Details',
    description: 'When and where is your event?',
    icon: MapPin,
  },
  {
    id: 3,
    title: 'Ticket Types',
    description: 'Set up your tickets',
    icon: DollarSign,
  },
  {
    id: 4,
    title: 'Review & Publish',
    description: 'Review and publish your event',
    icon: CheckCircle,
  },
];

const categories = [
  'conference', 'workshop', 'seminar', 'networking', 
  'social', 'sports', 'entertainment', 'education', 'business',
  'technology', 'health', 'arts', 'music', 'food', 'other'
];

interface SimplifiedEventWizardProps {
  onSuccess?: () => void;
}

export function EventWizard({ onSuccess }: SimplifiedEventWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Form states for each step
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
    mode: 'onChange',
  });

  const detailsForm = useForm<DetailsData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      location: '',
      eventDate: '',
      eventTime: '',
      isVirtual: false,
    },
    mode: 'onChange',
  });

  const [ticketTypes, setTicketTypes] = useState<CreateTicketType[]>([
    { name: 'General Admission', price: '10.00', quantityAvailable: 50 },
  ]);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '0.00', quantityAvailable: 10 }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof CreateTicketType, value: string | number) => {
    const updatedTicketTypes = [...ticketTypes];
    updatedTicketTypes[index] = { ...updatedTicketTypes[index], [field]: value };
    setTicketTypes(updatedTicketTypes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        const basicData = basicInfoForm.getValues();
        const titleValid = basicData.title.trim().length >= 3;
        const descriptionValid = basicData.description.trim().length >= 10;
        const categoryValid = basicData.category.trim().length > 0;
        
        return titleValid && descriptionValid && categoryValid;
      case 2:
        const detailsData = detailsForm.getValues();
        const locationValid = detailsData.location.trim().length >= 3;
        const dateValid = detailsData.eventDate.trim().length > 0;
        const timeValid = detailsData.eventTime.trim().length > 0;
        
        return locationValid && dateValid && timeValid;
      case 3:
        return ticketTypes.every(tt =>
          tt.name.trim() &&
          parseFloat(tt.price) >= 0 &&
          tt.quantityAvailable > 0
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    } else {
      let errorMessage = 'Please complete all required fields';
      
      if (currentStep === 1) {
        const basicData = basicInfoForm.getValues();
        if (!basicData.title.trim() || basicData.title.trim().length < 3) {
          errorMessage = 'Event title must be at least 3 characters';
        } else if (!basicData.description.trim() || basicData.description.trim().length < 10) {
          errorMessage = 'Description must be at least 10 characters';
        } else if (!basicData.category.trim()) {
          errorMessage = 'Please select a category';
        }
      } else if (currentStep === 2) {
        const detailsData = detailsForm.getValues();
        if (!detailsData.location.trim() || detailsData.location.trim().length < 3) {
          errorMessage = 'Location must be at least 3 characters';
        } else if (!detailsData.eventDate.trim()) {
          errorMessage = 'Please select an event date';
        } else if (!detailsData.eventTime.trim()) {
          errorMessage = 'Please select an event time';
        }
      } else if (currentStep === 3) {
        errorMessage = 'Please ensure all ticket types have valid names, prices, and quantities';
      }
      
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: 'Please complete all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const basicData = basicInfoForm.getValues();
      const detailsData = detailsForm.getValues();

      const eventData: CreateEventData = {
        title: basicData.title,
        description: basicData.description,
        category: basicData.category,
        location: detailsData.location,
        eventDate: detailsData.eventDate,
        eventTime: detailsData.eventTime,
        ticketTypes: ticketTypes.map(tt => ({
          name: tt.name,
          price: tt.price,
          quantityAvailable: tt.quantityAvailable,
        })),
        status: 'published',
      };

      const newEvent = await eventService.createEvent(eventData);
      
      // Upload image if provided
      if (imageFile && newEvent.id) {
        await eventService.uploadEventImage(newEvent.id, imageFile);
      }
      
      toast({
        title: 'Event Created Successfully!',
        description: 'Your event is now live and ready for ticket sales.',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...basicInfoForm}>
            <div className="space-y-6">
              <FormField
                control={basicInfoForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Give your event a catchy title" 
                        {...field} 
                        className="text-lg h-12"
                      />
                    </FormControl>
                    <FormDescription>
                      Make it memorable and descriptive
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={basicInfoForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={basicInfoForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event in detail..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      What makes your event special? What can attendees expect?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        );

      case 2:
        return (
          <Form {...detailsForm}>
            <div className="space-y-6">
              <FormField
                control={detailsForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Event venue or address"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific so attendees can find you easily
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={detailsForm.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={detailsForm.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <input
                          type="time"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Event Image</span>
                </div>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-gray-500">Click to upload event image</div>
                      <div className="text-sm text-gray-400">PNG, JPG up to 5MB</div>
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
            </div>
          </Form>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Ticket Types</h3>
                <p className="text-sm text-gray-600">Create different ticket options for your event</p>
              </div>
              <Button type="button" variant="outline" onClick={addTicketType}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Type
              </Button>
            </div>
            
            <div className="space-y-4">
              {ticketTypes.map((ticketType, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <div className="text-sm font-medium mb-2">Name</div>
                      <Input
                        value={ticketType.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                        placeholder="e.g., General Admission"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Price ($)</div>
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
                      <div className="text-sm font-medium mb-2">Quantity</div>
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
          </div>
        );

      case 4:
        const basicData = basicInfoForm.getValues();
        const detailsData = detailsForm.getValues();
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Review Your Event</h3>
              <p className="text-gray-600">Check all details before publishing</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{basicData.title}</CardTitle>
                <CardDescription>
                  <Badge variant="outline">{basicData.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{basicData.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Date & Time</h4>
                    <p className="text-gray-600">
                      {new Date(detailsData.eventDate).toLocaleDateString()} at {detailsData.eventTime}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-gray-600">{detailsData.location}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ticket Types</h4>
                  <div className="space-y-2">
                    {ticketTypes.map((ticketType, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{ticketType.name}</span>
                        <span>${parseFloat(ticketType.price).toFixed(2)} • {ticketType.quantityAvailable} available</span>
                      </div>
                    ))}
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <h4 className="font-medium mb-2">Event Image</h4>
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Ready to Publish?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Once published, your event will be live and available for ticket sales. 
                    You can always edit details later if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep > step.id ? 'bg-green-600 text-white' : 
                  currentStep === step.id ? 'bg-blue-600 text-white' : 
                  'bg-gray-200 text-gray-600'}
              `}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs ${
                  currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-4 h-4 text-blue-600" })}
            </div>
            <div>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Event'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}