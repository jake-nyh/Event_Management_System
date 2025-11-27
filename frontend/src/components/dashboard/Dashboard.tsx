import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Activity,
  BarChart3,
  Settings,
  Ticket,
  HelpCircle,
  MessageSquare,
  QrCode,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { eventService, Event } from '@/services/eventService';
import { customerService, CustomerTicket } from '@/services/customerService';
import { banners } from '@/lib/designSystem';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  primary?: boolean;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<CustomerTicket[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (user?.role === 'event_creator') {
          const eventsData = await eventService.getMyEvents({ limit: 6 });
          setMyEvents(eventsData.events);
        } else if (user?.role === 'customer') {
          const ticketsData = await customerService.getMyTickets();
          setMyTickets(ticketsData.tickets.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getQuickActions = (): QuickAction[] => {
    if (!user) return [];

    const actions: QuickAction[] = [];

    if (user.role === 'event_creator') {
      actions.push(
        {
          label: 'Create Event',
          icon: Plus,
          href: '/create-event',
          description: 'Start a new event',
          primary: true,
        },
        {
          label: 'My Events',
          icon: Calendar,
          href: '/dashboard',
          description: 'Manage your events',
        },
        {
          label: 'Manage Tickets',
          icon: Ticket,
          href: '/tickets',
          description: 'View & manage tickets',
        },
        {
          label: 'Scan Tickets',
          icon: QrCode,
          href: '/admin/qr-validation',
          description: 'Validate tickets at events',
        },
        {
          label: 'View Analytics',
          icon: BarChart3,
          href: '/admin/dashboard',
          description: 'Track performance',
        }
      );
    }

    if (user.role === 'customer') {
      actions.push(
        {
          label: 'Browse Events',
          icon: Eye,
          href: '/events',
          description: 'Discover events',
          primary: true,
        },
        {
          label: 'My Tickets',
          icon: Ticket,
          href: '/profile',
          description: 'View your tickets',
        }
      );
    }

    if (user.role === 'website_owner') {
      actions.push(
        {
          label: 'Admin Panel',
          icon: Settings,
          href: '/admin/dashboard',
          description: 'Platform management',
          primary: true,
        },
        {
          label: 'View Analytics',
          icon: BarChart3,
          href: '/admin/dashboard',
          description: 'Platform insights',
        }
      );
    }

    return actions;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-500 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Premium Hero Header with Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
        {/* Banner Image Overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(${banners.dashboard})`,
          }}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-4 border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {getGreeting()}, {user?.firstName}!
              </h1>
              <p className="text-xl text-indigo-100">Here's what's happening today</p>
            </div>

            {user?.role === 'event_creator' && (
              <Button
                size="lg"
                className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold"
                onClick={() => navigate('/create-event')}
              >
                <Plus className="mr-2 w-5 h-5" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,16C1120,11,1280,21,1360,26.7L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.href}
                  className={`group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                    action.primary
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                      : 'bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50'
                  }`}
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        action.primary
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                      }`}>
                        <Icon className={`w-7 h-7 ${action.primary ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <div className={`font-semibold mb-1 ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                          {action.label}
                        </div>
                        <div className={`text-sm ${action.primary ? 'text-white/80' : 'text-gray-600'}`}>
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {user?.role === 'event_creator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Events */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myEvents.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {myEvents.filter(e => e.status === 'published').length} published
                    </p>
                    
                    {myEvents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {myEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                event.status === 'published' ? 'bg-green-500' :
                                event.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="truncate">{event.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => navigate('/events')}
                    >
                      View All Events
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Published Events</span>
                        <span className="font-medium">{myEvents.filter(e => e.status === 'published').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Draft Events</span>
                        <span className="font-medium">{myEvents.filter(e => e.status === 'draft').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed Events</span>
                        <span className="font-medium">{myEvents.filter(e => e.status === 'completed').length}</span>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate('/admin/dashboard')}
                        >
                          View Analytics
                          <BarChart3 className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {user?.role === 'customer' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tickets */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Tickets</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myTickets.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {myTickets.filter(t => t.status === 'active').length} active
                    </p>
                    
                    {myTickets.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {myTickets.slice(0, 3).map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                ticket.status === 'active' ? 'bg-green-500' :
                                ticket.status === 'used' ? 'bg-blue-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="truncate">{ticket.ticketType?.event?.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {ticket.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => navigate('/profile')}
                    >
                      View All Tickets
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Browse Suggestions */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Discover Events</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Find exciting events happening near you
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/events')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {user?.role === 'website_owner' && (
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>
                    Manage your event platform from one central location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">--</div>
                      <div className="text-sm text-blue-600">Active Events</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">--</div>
                      <div className="text-sm text-green-600">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">--</div>
                      <div className="text-sm text-purple-600">Revenue</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <Button 
                      className="flex-1"
                      onClick={() => navigate('/admin/dashboard')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/events')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user?.role === 'event_creator' && myEvents.slice(0, 5).map((event, index) => (
                    <div key={event.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
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
                  
                  {user?.role === 'customer' && myTickets.slice(0, 5).map((ticket, index) => (
                    <div key={ticket.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        ticket.status === 'active' ? 'bg-green-500' :
                        ticket.status === 'used' ? 'bg-blue-500' :
                        ticket.status === 'transferred' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.status === 'active' ? 'Ticket purchased' :
                           ticket.status === 'used' ? 'Ticket used' :
                           ticket.status === 'transferred' ? 'Ticket transferred' :
                           'Ticket refunded'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.ticketType?.event?.title} • {ticket.purchasedAt ? new Date(ticket.purchasedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {((user?.role === 'event_creator' && myEvents.length === 0) ||
                    (user?.role === 'customer' && myTickets.length === 0)) && (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tips & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.role === 'event_creator' && (
                      <>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Optimize Your Events</h4>
                          <p className="text-sm text-blue-700">
                            Add detailed descriptions and high-quality images to attract more attendees.
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-1">Pricing Strategy</h4>
                          <p className="text-sm text-green-700">
                            Consider offering early bird discounts to boost initial sales.
                          </p>
                        </div>
                      </>
                    )}
                    
                    {user?.role === 'customer' && (
                      <>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-1">Discover More</h4>
                          <p className="text-sm text-purple-700">
                            Check out featured events for exclusive experiences and special offers.
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-1">Stay Updated</h4>
                          <p className="text-sm text-orange-700">
                            Enable notifications to never miss events in your favorite categories.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help Center
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}