import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleLineChart, SimpleBarChart, MetricCard } from '@/components/ui/chart';
import { analyticsService, EventAnalytics } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

const EventAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventAnalytics(id);
    }
  }, [id]);

  const loadEventAnalytics = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await analyticsService.getEventAnalytics(eventId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading event analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load event analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Analytics not found</h3>
        <p className="text-gray-500">The analytics for this event couldn't be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Event Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tickets Sold"
          value={analytics.totalTicketsSold}
          icon={<Users className="h-6 w-6" />}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Ticket sales trend</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={analytics.salesOverTime || []}
              xKey="date"
              yKey="ticketsSold"
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets by Type</CardTitle>
            <CardDescription>Breakdown by ticket type</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={analytics.ticketsByType || []}
              xKey="ticketTypeName"
              yKey="totalSold"
              color="#10b981"
            />
          </CardContent>
        </Card>
      </div>

      {/* Ticket Types Details */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Type Performance</CardTitle>
          <CardDescription>Detailed breakdown of ticket sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.ticketsByType?.length > 0 ? (
              analytics.ticketsByType.map((ticketType) => (
                <div key={ticketType.ticketTypeId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{ticketType.ticketTypeName}</h4>
                    <p className="text-sm text-gray-500">${ticketType.price.toFixed(2)} per ticket</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{ticketType.totalSold}</p>
                    <p className="text-sm text-gray-500">sold</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${(ticketType.totalSold * ticketType.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No ticket sales data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAnalyticsPage;