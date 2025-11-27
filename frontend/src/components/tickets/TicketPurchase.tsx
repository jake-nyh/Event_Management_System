import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventService, Event, TicketType } from '@/services/eventService';
import { paymentService, TicketItem } from '@/services/paymentService';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Plus, 
  Minus, 
  CreditCard, 
  CheckCircle,
  Users,
  Star,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';

interface SelectedTicket {
  ticketType: TicketType;
  quantity: number;
}

export function TicketPurchase() {
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

  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);

  useEffect(() => {
    if (ticketTypes) {
      setSelectedTickets(ticketTypes.map(tt => ({
        ticketType: tt,
        quantity: 0,
      })));
    }
  }, [ticketTypes]);

  const updateQuantity = (ticketTypeId: string, delta: number) => {
    setSelectedTickets(prev => 
      prev.map(st => 
        st.ticketType.id === ticketTypeId 
          ? { ...st, quantity: Math.max(0, st.quantity + delta) }
          : st
      )
    );
  };

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, st) => {
      return total + (parseFloat(st.ticketType.price) * st.quantity);
    }, 0);
  };

  const getTotalQuantity = () => {
    return selectedTickets.reduce((total, st) => total + st.quantity, 0);
  };

  const hasTickets = () => {
    return selectedTickets.some(st => st.quantity > 0);
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Authentication required');
      
      const selectedTicketItems: TicketItem[] = selectedTickets
        .filter(st => st.quantity > 0)
        .map(st => ({
          ticketTypeId: st.ticketType.id,
          quantity: st.quantity,
        }));

      if (selectedTicketItems.length === 0) throw new Error('No tickets selected');

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        eventId: id,
        ticketItems: selectedTicketItems,
        customerEmail: user.email,
      });

      // For demo purposes, we'll immediately confirm the payment
      const confirmResult = await paymentService.confirmPayment({
        paymentIntentId: paymentIntent.paymentIntentId,
      });

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Payment failed');
      }

      return {
        transactionId: confirmResult.transactionId,
        tickets: selectedTicketItems,
      };
    },
    onSuccess: (data) => {
      setPurchaseStep('success');
      setPurchasedTickets(data.tickets || []);
      toast({
        title: 'Purchase Successful!',
        description: 'Your tickets have been purchased successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['eventTicketTypes', id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase tickets',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

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

    if (!hasTickets()) {
      toast({
        title: 'No Tickets Selected',
        description: 'Please select at least one ticket to continue',
        variant: 'destructive',
      });
      return;
    }

    setPurchaseStep('checkout');
  };

  const confirmPurchase = () => {
    setIsProcessing(true);
    purchaseMutation.mutate();
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
        <Button onClick={() => navigate('/events')} className="mt-4">
          Back to Events
        </Button>
      </div>
    );
  }

  // Success screen
  if (purchaseStep === 'success') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tickets Purchased Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You're all set! Your tickets have been sent to your email and are available in your profile.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">1</div>
                  <div>
                    <h4 className="font-medium text-blue-900">Check Your Email</h4>
                    <p className="text-sm text-blue-700">You'll receive a confirmation email with your tickets</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">2</div>
                  <div>
                    <h4 className="font-medium text-blue-900">Save Your Tickets</h4>
                    <p className="text-sm text-blue-700">Access them anytime from your profile</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">3</div>
                  <div>
                    <h4 className="font-medium text-blue-900">Get Ready for the Event</h4>
                    <p className="text-sm text-blue-700">Arrive early and have your QR codes ready</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate(`/events/${id}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
              <Button onClick={() => navigate('/profile')}>
                View My Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Checkout screen
  if (purchaseStep === 'checkout') {
    const selectedTicketItems = selectedTickets.filter(st => st.quantity > 0);
    
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your ticket selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTicketItems.map((st) => (
                  <div key={st.ticketType.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{st.ticketType.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${parseFloat(st.ticketType.price).toFixed(2)} × {st.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${(parseFloat(st.ticketType.price) * st.quantity).toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {st.ticketType.quantityAvailable} remaining
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(event.eventTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & User Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Secure checkout powered by Stripe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Secure Payment</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment information is encrypted and secure
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={confirmPurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  This is a demo. No actual payment will be processed.
                </p>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-600">{user?.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => setPurchaseStep('select')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ticket Selection
          </Button>
        </div>
      </div>
    );
  }

  // Ticket selection screen
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {event.category && (
                      <Badge variant="outline" className="mr-2">
                        {event.category}
                      </Badge>
                    )}
                    {event.isFeatured && (
                      <Badge className="bg-yellow-400 text-yellow-900">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Date</div>
                      <div>{formatDate(event.eventDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Time</div>
                      <div>{formatTime(event.eventTime)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Location</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Expected Attendees</div>
                      <div>--</div>
                    </div>
                  </div>
                </div>
              </div>

              {event.tags && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.split(',').map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Tickets</CardTitle>
              <CardDescription>Choose the tickets you want to purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Available</h3>
                  <p className="text-gray-500">This event doesn't have any ticket types configured yet.</p>
                </div>
              ) : (
                selectedTickets.map((st) => (
                  <div key={st.ticketType.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{st.ticketType.name}</h4>
                        <p className="text-3xl font-bold text-blue-600">
                          ${parseFloat(st.ticketType.price).toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{st.ticketType.quantityAvailable} available</span>
                          {st.ticketType.quantityAvailable < 10 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(st.ticketType.id, -1)}
                          disabled={st.quantity <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-16 text-center font-semibold text-lg">
                          {st.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(st.ticketType.id, 1)}
                          disabled={st.quantity >= st.ticketType.quantityAvailable}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTotalQuantity() > 0 ? (
                <>
                  <div className="space-y-2">
                    {selectedTickets.filter(st => st.quantity > 0).map((st) => (
                      <div key={st.ticketType.id} className="flex justify-between text-sm">
                        <span>{st.ticketType.name} × {st.quantity}</span>
                        <span>${(parseFloat(st.ticketType.price) * st.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing Fee</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchase}
                    disabled={!hasTickets()}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Select tickets to see order summary</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Instant confirmation</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}