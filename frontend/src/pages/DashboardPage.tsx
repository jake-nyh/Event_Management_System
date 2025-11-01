import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, DollarSign, Plus, BarChart3, Eye, LogOut, Activity, Ticket, Clock, Settings, ArrowRight, MapPin, Star, Filter, Search, Bell, Download, Upload, MoreVertical, ChevronRight, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { eventService, Event } from '@/services/eventService';
import { customerService, Ticket as CustomerTicket } from '@/services/customerService';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<CustomerTicket[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    avgRating: 0,
    myTickets: 0,
    eventsAttended: 0,
    moneySaved: 0,
    loyaltyPoints: 0,
    totalUsers: 0,
    activeEvents: 0,
    platformRevenue: 0,
    systemHealth: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        if (user?.role === 'event_creator') {
          const myEventsData = await eventService.getMyEvents({ limit: 10 });
          setMyEvents(myEventsData.events);
          setStats(prev => ({
            ...prev,
            totalEvents: myEventsData.total
          }));
        } else if (user?.role === 'customer') {
          const [eventsData, ticketsData] = await Promise.all([
            eventService.getEvents({ limit: 10 }),
            customerService.getMyTickets()
          ]);
          setAllEvents(eventsData.events);
          setMyTickets(ticketsData.tickets);
          setStats(prev => ({
            ...prev,
            myTickets: ticketsData.total
          }));
        } else if (user?.role === 'website_owner') {
          const eventsData = await eventService.getEvents({ limit: 100 });
          setAllEvents(eventsData.events);
          setStats(prev => ({
            ...prev,
            totalEvents: eventsData.total,
            activeEvents: eventsData.events.filter(e => e.status === 'published').length
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'event_creator':
        return 'Event Creator';
      case 'customer':
        return 'Customer';
      case 'website_owner':
        return 'Website Owner';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">EventHub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 mr-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-gray-500">{getRoleDisplayText(user.role)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout} className="sm:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}, {user.firstName}!</h2>
          <p className="text-gray-600">Welcome back to your dashboard. Here's what's happening with your events today.</p>
        </div>

        {/* Quick Stats - Role Specific */}
        {user.role === 'event_creator' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Events</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalEvents}</p>
                    <p className="text-blue-100 text-xs mt-1">Created events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Published Events</p>
                    <p className="text-3xl font-bold mt-1">{myEvents.filter(e => e.status === 'published').length}</p>
                    <p className="text-purple-100 text-xs mt-1">Live events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Draft Events</p>
                    <p className="text-3xl font-bold mt-1">{myEvents.filter(e => e.status === 'draft').length}</p>
                    <p className="text-green-100 text-xs mt-1">Pending publication</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Completed Events</p>
                    <p className="text-3xl font-bold mt-1">{myEvents.filter(e => e.status === 'completed').length}</p>
                    <p className="text-orange-100 text-xs mt-1">Past events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === 'customer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">My Tickets</p>
                    <p className="text-3xl font-bold mt-1">{stats.myTickets}</p>
                    <p className="text-blue-100 text-xs mt-1">Purchased tickets</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Featured Events</p>
                    <p className="text-3xl font-bold mt-1">{allEvents.filter(e => e.isFeatured).length}</p>
                    <p className="text-purple-100 text-xs mt-1">Recommended events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Available Events</p>
                    <p className="text-3xl font-bold mt-1">{allEvents.length}</p>
                    <p className="text-green-100 text-xs mt-1">Events to explore</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Featured Events</p>
                    <p className="text-3xl font-bold mt-1">{allEvents.filter(e => e.isFeatured).length}</p>
                    <p className="text-orange-100 text-xs mt-1">Recommended events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === 'website_owner' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Events</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalEvents}</p>
                    <p className="text-blue-100 text-xs mt-1">All platform events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Active Events</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeEvents}</p>
                    <p className="text-purple-100 text-xs mt-1">Currently published</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Draft Events</p>
                    <p className="text-3xl font-bold mt-1">{allEvents.filter(e => e.status === 'draft').length}</p>
                    <p className="text-green-100 text-xs mt-1">Pending review</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Featured Events</p>
                    <p className="text-3xl font-bold mt-1">{allEvents.filter(e => e.isFeatured).length}</p>
                    <p className="text-orange-100 text-xs mt-1">Promoted events</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role Specific Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {user.role === 'event_creator' && (
              <>
                {/* Events List with Table */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">My Events</CardTitle>
                          <CardDescription className="text-gray-600">Manage and track your events</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                          <Button onClick={() => navigate('/create-event')} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Event Name</th>
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Date</th>
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Location</th>
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Status</th>
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myEvents.length > 0 ? myEvents.slice(0, 5).map((event) => (
                              <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-gray-500">{event.category || 'General'}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">
                                  {new Date(event.eventDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">{event.location}</td>
                                <td className="py-3 px-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                                    event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event.id}`)}>
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                  No events found. Create your first event to get started!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {Math.min(myEvents.length, 5)} of {myEvents.length} events
                        </p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
                          View All Events
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats & Activity */}
                <div className="space-y-6">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Published Events</span>
                            <span className="text-sm font-medium text-gray-900">{myEvents.filter(e => e.status === 'published').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${myEvents.length > 0 ? (myEvents.filter(e => e.status === 'published').length / myEvents.length) * 100 : 0}%`}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Draft Events</span>
                            <span className="text-sm font-medium text-gray-900">{myEvents.filter(e => e.status === 'draft').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: `${myEvents.length > 0 ? (myEvents.filter(e => e.status === 'draft').length / myEvents.length) * 100 : 0}%`}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Completed Events</span>
                            <span className="text-sm font-medium text-gray-900">{myEvents.filter(e => e.status === 'completed').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: `${myEvents.length > 0 ? (myEvents.filter(e => e.status === 'completed').length / myEvents.length) * 100 : 0}%`}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {myEvents.slice(0, 3).map((event, index) => (
                          <div key={event.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              event.status === 'published' ? 'bg-green-500' :
                              event.status === 'draft' ? 'bg-blue-500' :
                              event.status === 'completed' ? 'bg-gray-500' :
                              'bg-orange-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {event.status === 'published' ? 'Event published' :
                                 event.status === 'draft' ? 'Event created' :
                                 event.status === 'completed' ? 'Event completed' :
                                 'Event updated'}
                              </p>
                              <p className="text-xs text-gray-500">{event.title} • {new Date(event.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                        {myEvents.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No recent activity
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {user.role === 'customer' && (
              <>
                {/* My Tickets Section */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">My Tickets</CardTitle>
                          <CardDescription className="text-gray-600">Your purchased tickets and event access</CardDescription>
                        </div>
                        <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
                          View All Tickets
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {myTickets.length > 0 ? myTickets.slice(0, 3).map((ticket) => (
                          <div key={ticket.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {ticket.status === 'active' ? 'Active' :
                                   ticket.status === 'used' ? 'Used' :
                                   ticket.status === 'transferred' ? 'Transferred' : 'Refunded'}
                                </span>
                                {ticket.ticketType?.event?.isFeatured && (
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">4.5+</span>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.ticketType?.event?.title || 'Event'}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {ticket.ticketType?.event ? new Date(ticket.ticketType.event.eventDate).toLocaleDateString() : 'N/A'}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {ticket.ticketType?.event?.eventTime || 'N/A'}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {ticket.ticketType?.event?.location || 'N/A'}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  {ticket.ticketType?.name} • ${ticket.ticketType?.price}
                                </span>
                              </div>
                              <Button size="sm" onClick={() => navigate(`/events/${ticket.ticketType?.event?.id}`)}>
                                View Ticket
                              </Button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No tickets purchased yet. Browse events to get started!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations & Interests */}
                <div className="space-y-6">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">Recommended for You</CardTitle>
                      <CardDescription className="text-gray-600">Based on your interests</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {allEvents.filter(e => e.isFeatured).slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{event.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(event.eventDate).toLocaleDateString()} • {event.category || 'General'}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">4.5+</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/events/${event.id}`)}>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">Your Interests</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(allEvents.map(e => e.category).filter(Boolean))).slice(0, 6).map((category) => (
                          <span key={category} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/events')}>
                          <Plus className="w-3 h-3 mr-1" />
                          Browse All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {user.role === 'website_owner' && (
              <>
                {/* Analytics Overview */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">Platform Analytics</CardTitle>
                          <CardDescription className="text-gray-600">Real-time platform performance metrics</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Events by Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Published</span>
                              <span className="text-sm font-medium text-gray-900">{allEvents.filter(e => e.status === 'published').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Draft</span>
                              <span className="text-sm font-medium text-gray-900">{allEvents.filter(e => e.status === 'draft').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Completed</span>
                              <span className="text-sm font-medium text-gray-900">{allEvents.filter(e => e.status === 'completed').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Cancelled</span>
                              <span className="text-sm font-medium text-gray-900">{allEvents.filter(e => e.status === 'cancelled').length}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Featured Events</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Total Featured</span>
                              <span className="text-sm font-medium text-gray-900">{allEvents.filter(e => e.isFeatured).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Featured Rate</span>
                              <span className="text-sm font-medium text-gray-900">
                                {allEvents.length > 0 ? Math.round((allEvents.filter(e => e.isFeatured).length / allEvents.length) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Total Events</span>
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                          <p className="text-xs text-gray-600">All platform events</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Active Events</span>
                            <Activity className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
                          <p className="text-xs text-gray-600">Currently published</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Categories</span>
                            <Star className="w-4 h-4 text-orange-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{new Set(allEvents.map(e => e.category).filter(Boolean)).size}</p>
                          <p className="text-xs text-gray-600">Event categories</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Status & Alerts */}
                <div className="space-y-6">
                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">API Services</span>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Database</span>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-900">Payment Gateway</span>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Degraded</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Email Service</span>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Operational</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900">Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">High server load detected</p>
                            <p className="text-xs text-gray-500">2 hours ago • Server-03</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Payment gateway timeout</p>
                            <p className="text-xs text-gray-500">5 hours ago • Stripe API</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Database backup completed</p>
                            <p className="text-xs text-gray-500">1 day ago • Automated</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {user.role === 'event_creator' && (
              <>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/create-event')}>
                  <Plus className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Create Event</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <Eye className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Browse Events</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <span className="text-sm">My Events</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/profile')}>
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Profile</span>
                </Button>
              </>
            )}
            {user.role === 'customer' && (
              <>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Browse Events</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/profile')}>
                  <Ticket className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">My Tickets</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <Activity className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Categories</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/profile')}>
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Profile</span>
                </Button>
              </>
            )}
            {user.role === 'website_owner' && (
              <>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm">All Events</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Categories</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/events')}>
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Featured</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white hover:shadow-sm transition-all" onClick={() => navigate('/profile')}>
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Profile</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}