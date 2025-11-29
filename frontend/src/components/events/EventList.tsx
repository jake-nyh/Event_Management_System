import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DateRangePicker } from '../ui/date-range-picker';
import { Event, EventFilters, eventService } from '../../services/eventService';
import { getImageUrl } from '../../services/api';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Star,
  Search,
  Filter,
  Heart,
  Share2,
  ChevronDown,
  ArrowRight,
  X
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface EventListProps {
  showFilters?: boolean;
}

export function EventList({ showFilters = true }: EventListProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  // Advanced filters
  const [locationFilter, setLocationFilter] = useState('');
  const [isFeaturedFilter, setIsFeaturedFilter] = useState('all');

  // Debounce search and location for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);

  // Convert DateRange to API format
  const formatDateForApi = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'networking', label: 'Networking' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'health', label: 'Health' },
    { value: 'arts', label: 'Arts' },
    { value: 'music', label: 'Music' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' }
  ];

  // Sort options that match backend
  const sortOptions = [
    { value: 'date-asc', label: 'Date (Earliest First)', sortBy: 'date', sortOrder: 'asc' },
    { value: 'date-desc', label: 'Date (Latest First)', sortBy: 'date', sortOrder: 'desc' },
    { value: 'title-asc', label: 'Title (A-Z)', sortBy: 'title', sortOrder: 'asc' },
    { value: 'title-desc', label: 'Title (Z-A)', sortBy: 'title', sortOrder: 'desc' },
    { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
    { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
  ];

  const featuredOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'regular', label: 'Regular Only' }
  ];

  // Handle sort change
  const handleSortChange = (value: string) => {
    const option = sortOptions.find(o => o.value === value);
    if (option) {
      setSortBy(option.sortBy);
      setSortOrder(option.sortOrder as 'asc' | 'desc');
    }
  };

  const currentSortValue = `${sortBy}-${sortOrder}`;

  // Build filters object for API
  const buildFilters = (): EventFilters => {
    const filters: EventFilters = {
      limit: 50,
      sortBy: sortBy as 'title' | 'date' | 'createdAt',
      sortOrder: sortOrder,
    };

    if (debouncedSearchTerm) {
      filters.search = debouncedSearchTerm;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }
    if (dateRange?.from) {
      filters.startDate = formatDateForApi(dateRange.from);
    }
    if (dateRange?.to) {
      filters.endDate = formatDateForApi(dateRange.to);
    }
    if (debouncedLocation) {
      filters.location = debouncedLocation;
    }
    if (isFeaturedFilter === 'featured') {
      filters.isFeatured = true;
    } else if (isFeaturedFilter === 'regular') {
      filters.isFeatured = false;
    }

    return filters;
  };

  // TanStack Query for fetching events
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['events', debouncedSearchTerm, selectedCategory, dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), sortBy, sortOrder, debouncedLocation, isFeaturedFilter],
    queryFn: () => eventService.getEvents(buildFilters()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });

  const events = data?.events || [];

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' ||
           selectedCategory !== 'all' ||
           dateRange !== undefined ||
           locationFilter !== '' ||
           isFeaturedFilter !== 'all' ||
           sortBy !== 'date' ||
           sortOrder !== 'asc';
  }, [searchTerm, selectedCategory, dateRange, locationFilter, isFeaturedFilter, sortBy, sortOrder]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
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

  const toggleSaveEvent = (eventId: string) => {
    setSavedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const shareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setDateRange(undefined);
    setSortBy('date');
    setSortOrder('asc');
    setLocationFilter('');
    setIsFeaturedFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && <FiltersSkeleton />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse border-0 shadow-xl overflow-hidden">
              <div className="h-56 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-2 border-dashed border-red-300 bg-red-50">
        <CardContent className="text-center py-16">
          <h3 className="text-xl font-bold mb-3 text-red-900">Error loading events</h3>
          <p className="text-red-600 mb-4">{(error as Error)?.message || 'Something went wrong'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search events by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  className="w-full sm:w-[280px]"
                  placeholder="Select dates"
                />

                <Select value={currentSortValue} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                      <Input
                        placeholder="Enter city or venue"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
                      <Select value={isFeaturedFilter} onValueChange={setIsFeaturedFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All events" />
                        </SelectTrigger>
                        <SelectContent>
                          {featuredOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {events.length} {events.length === 1 ? 'event' : 'events'} found
          {data?.total && data.total > events.length && ` (showing ${events.length} of ${data.total})`}
        </p>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">No events found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white">
              <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {event.imageUrl ? (
                  <img
                    src={getImageUrl(event.imageUrl) || ''}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarIcon className="w-16 h-16 text-indigo-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>

                {/* Overlay Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSaveEvent(event.id);
                    }}
                  >
                    <Heart className={`w-4 h-4 ${savedEvents.has(event.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      shareEvent(event);
                    }}
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

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
                {event.category && (
                  <Badge variant="outline" className="text-xs mt-2 w-fit">
                    {event.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{formatEventDate(event.eventDate)}</span>
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
                {event.tags && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {event.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                <Link to={`/events/${event.id}`} className="block">
                  <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 text-white to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg group/btn">
                    <span>View Details</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton for filters section
function FiltersSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
