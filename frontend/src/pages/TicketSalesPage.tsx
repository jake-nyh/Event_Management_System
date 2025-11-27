import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Search,
  Download,
  Filter,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eventService, Event } from '@/services/eventService';
import { customerService, CustomerTicket } from '@/services/customerService';

export function TicketSalesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [soldTickets, setSoldTickets] = useState<CustomerTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchSoldTickets(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await eventService.getMyEvents({ limit: 50 });
      setEvents(eventsData.events);
      if (eventsData.events.length > 0) {
        setSelectedEvent(eventsData.events[0]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSoldTickets = async (eventId: string) => {
    try {
      const tickets = await customerService.getEventTickets(eventId);
      setSoldTickets(tickets);
    } catch (error) {
      console.error('Error fetching sold tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket sales data',
        variant: 'destructive',
      });
    }
  };

  const filteredTickets = soldTickets.filter(ticket => {
    const matchesSearch =
      ticket.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'used': return <CheckCircle className="w-4 h-4" />;
      case 'transferred': return <ArrowRight className="w-4 h-4" />;
      case 'refunded': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalRevenue = () => {
    return soldTickets
      .filter(t => t.status !== 'refunded')
      .reduce((total, ticket) => total + (ticket.ticketType?.price ? parseFloat(ticket.ticketType.price) : 0), 0);
  };

  const getTicketStats = () => {
    const active = soldTickets.filter(t => t.status === 'active').length;
    const used = soldTickets.filter(t => t.status === 'used').length;
    const refunded = soldTickets.filter(t => t.status === 'refunded').length;
    return { active, used, refunded };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getTicketStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ticket Sales</h1>
              <p className="text-gray-600">Manage and track ticket sales for your events</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const event = events.find(ev => ev.id === e.target.value);
                  setSelectedEvent(event || null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Sold Tickets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {soldTickets.length} tickets sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for check-in
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Used Tickets</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.used}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully checked in
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Refunded</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.refunded}</div>
                  <p className="text-xs text-muted-foreground">
                    Refunded tickets
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-auto p-4 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('tickets')}
                  >
                    <Ticket className="w-6 h-6" />
                    <span>View All Tickets</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/admin/qr-validation', '_blank')}
                  >
                    <Filter className="w-6 h-6" />
                    <span>Scan Tickets</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center space-y-2"
                  >
                    <Download className="w-6 h-6" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sold Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sold Tickets</CardTitle>
                    <CardDescription>
                      {selectedEvent ? `Tickets sold for ${selectedEvent.title}` : 'Select an event to view tickets'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="used">Used</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-500">
                      {selectedEvent 
                        ? 'No tickets have been sold for this event yet.' 
                        : 'Please select an event to view sold tickets.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Ticket Type</th>
                          <th className="text-left py-3 px-4 font-medium">Price</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Purchased</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">
                                  {ticket.customer?.firstName} {ticket.customer?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ticket.customer?.email}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{ticket.ticketType?.name || 'Unknown'}</div>
                            </td>
                            <td className="py-3 px-4">
                              ${ticket.ticketType ? parseFloat(ticket.ticketType.price).toFixed(2) : '0.00'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(ticket.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(ticket.status)}
                                  <span>{ticket.status}</span>
                                </div>
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {ticket.purchasedAt ? formatDate(ticket.purchasedAt) : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Detailed insights about your ticket sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Analytics features coming soon. Track sales trends, customer demographics, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}