import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { eventService, Event, EventFilters } from '../services/eventService';
import { useAuthStore } from '../store/useAuthStore';
import { Search, Calendar, MapPin, Clock, Star, Users, TrendingUp, Sparkles, Shield, Zap, ArrowRight, ChevronRight, Check } from 'lucide-react';

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    location: '',
    category: '',
    tags: '',
    isFeatured: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents(filters);
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(filters.search?.toLowerCase() || '') ||
      event.description?.toLowerCase().includes(filters.search?.toLowerCase() || '') ||
      event.location.toLowerCase().includes(filters.search?.toLowerCase() || '')
    )
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'createdAt':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date':
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section with Banner Image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span>Your Premium Event Platform</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                Discover Extraordinary
                <span className="block mt-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                  Events & Experiences
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                Seamlessly create, manage, and discover unforgettable events. Join thousands of creators and attendees in a premium event ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <>
                    <Link to="/events" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold group">
                        Browse Events
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    {user.role === 'event_creator' && (
                      <Link to="/create-event" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold">
                          Create Event
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold group">
                        Get Started Free
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/events" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold">
                        Explore Events
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-indigo-200 text-sm">Events Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">50K+</div>
                <div className="text-indigo-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-indigo-200 text-sm">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
                <div className="text-indigo-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 text-sm mb-4 font-medium">
              <Star className="w-4 h-4" />
              <span>Premium Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive event management solution built for creators and attendees who demand excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full filter blur-3xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">Lightning Fast Setup</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  Create and launch events in minutes with our intuitive wizard. Set up tickets, pricing, and custom fields effortlessly.
                </CardDescription>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Drag & drop event builder</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Custom ticket types</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Real-time previews</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full filter blur-3xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">Grow Your Reach</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  Connect with passionate attendees. Build your community and amplify your events with built-in marketing tools.
                </CardDescription>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Email campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Social sharing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Attendee insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full filter blur-3xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <CardHeader className="relative">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  Deep dive into performance metrics. Track sales, revenue, and engagement with beautiful dashboards.
                </CardDescription>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Real-time reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Revenue tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Export reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
                <p className="text-sm text-gray-600">Bank-level encryption</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">QR Check-in</h3>
                <p className="text-sm text-gray-600">Contactless entry</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Custom Branding</h3>
                <p className="text-sm text-gray-600">Your unique style</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
                <p className="text-sm text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full text-purple-600 text-sm mb-4 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-600 mt-2">Discover your next unforgettable experience</p>
            </div>
            <Link to="/events">
              <Button size="lg" variant="outline" className="gap-2 hover:gap-3 transition-all border-2">
                View All Events
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for events, locations, or categories..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-12 h-14 text-base border-2 focus:border-indigo-500 rounded-xl shadow-sm"
              />
            </div>
            <Select value={filters.sortBy || 'createdAt'} onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}>
              <SelectTrigger className="w-full md:w-64 h-14 border-2 rounded-xl shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="date">Event Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <p className="text-gray-500">Loading amazing events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">No events found</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {filters.search ? 'Try adjusting your search terms' : 'Check back later for upcoming events'}
                </p>
                {user?.role === 'event_creator' && (
                  <Link to="/create-event">
                    <Button size="lg" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create the First Event
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.slice(0, 6).map((event) => (
                <Card key={event.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white">
                  <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getStatusColor(event.status)} shadow-lg backdrop-blur-sm font-semibold`}>
                        {event.status}
                      </Badge>
                    </div>
                    {event.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg backdrop-blur-sm font-semibold">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium">{formatDate(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{formatTime(event.eventTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-pink-600" />
                        </div>
                        <span className="line-clamp-1 font-medium">{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed pt-2 border-t">
                        {event.description}
                      </p>
                    )}
                    <Link to={`/events/${event.id}`} className="block">
                      <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg group/btn">
                        <span>View Details</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredEvents.length > 6 && (
            <div className="text-center mt-12">
              <Link to="/events">
                <Button variant="outline" size="lg" className="gap-2 hover:gap-3 transition-all border-2 px-8 py-6 text-lg">
                  View All {filteredEvents.length} Events
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span>Start Your Journey Today</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to Create Something
              <span className="block mt-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Extraordinary?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-indigo-100 leading-relaxed">
              Join thousands of event creators and attendees who trust our platform to deliver exceptional experiences.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-indigo-200">Events Created</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-indigo-200">Happy Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-indigo-200">Satisfaction Rate</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/create-event">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold group">
                    Create Your Event
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold group">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold">
                      Explore Events
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="mt-8 text-indigo-200 text-sm">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}