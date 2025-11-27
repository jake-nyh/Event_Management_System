import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminService, CommissionSettings, SubscriptionTier, User, DashboardAnalytics } from '@/services/adminService';
import { analyticsService } from '@/services/analyticsService';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Crown,
  Search,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { SimpleLineChart, SimpleBarChart, MetricCard } from '@/components/ui/chart';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, commissionData, tiersData, usersData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        adminService.getCommissionSettings(),
        adminService.getSubscriptionTiers(),
        adminService.getUsers(1, 20)
      ]);

      setAnalytics(analyticsData);
      setCommissionSettings(commissionData);
      setSubscriptionTiers(tiersData);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommissionSettings = async (settings: CommissionSettings) => {
    try {
      const updated = await adminService.updateCommissionSettings(settings);
      setCommissionSettings(updated);
      toast({
        title: "Success",
        description: "Commission settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating commission settings:', error);
      toast({
        title: "Error",
        description: "Failed to update commission settings",
        variant: "destructive",
      });
    }
  };

  const handleSearchUsers = async () => {
    try {
      const usersData = await adminService.getUsers(1, 20, searchTerm);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          <Crown className="w-4 h-4 mr-1" />
          Administrator
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Users"
              value={analytics?.totalUsers || 0}
              icon={<Users className="h-6 w-6" />}
            />
            <MetricCard
              title="Total Events"
              value={analytics?.totalEvents || 0}
              icon={<Calendar className="h-6 w-6" />}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <MetricCard
              title="Commission Earned"
              value={`$${(analytics?.commissionEarned || 0).toFixed(2)}`}
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={analytics?.userGrowth || []}
                  xKey="date"
                  yKey="count"
                  color="#3b82f6"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={analytics?.revenueGrowth || []}
                  xKey="date"
                  yKey="revenue"
                  color="#10b981"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest ticket purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentTransactions?.length > 0 ? (
                  analytics.recentTransactions.map((transaction: any, index: number) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.eventTitle}</p>
                        <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${parseFloat(transaction.totalAmount).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={handleSearchUsers}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Created</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b">
                    <div>{user.firstName} {user.lastName}</div>
                    <div>{user.email}</div>
                    <div>
                      <Badge variant={user.role === 'website_owner' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                    <div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>Configure platform commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventCreatorPercentage">Event Creator Percentage</Label>
                  <Input
                    id="eventCreatorPercentage"
                    type="number"
                    value={commissionSettings?.eventCreatorPercentage || 0}
                    onChange={(e) => setCommissionSettings(prev => prev ? {
                      ...prev,
                      eventCreatorPercentage: parseFloat(e.target.value)
                    } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="platformPercentage">Platform Percentage</Label>
                  <Input
                    id="platformPercentage"
                    type="number"
                    value={commissionSettings?.platformPercentage || 0}
                    onChange={(e) => setCommissionSettings(prev => prev ? {
                      ...prev,
                      platformPercentage: parseFloat(e.target.value)
                    } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="minCommission">Minimum Commission ($)</Label>
                  <Input
                    id="minCommission"
                    type="number"
                    value={commissionSettings?.minCommission || 0}
                    onChange={(e) => setCommissionSettings(prev => prev ? {
                      ...prev,
                      minCommission: parseFloat(e.target.value)
                    } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxCommission">Maximum Commission ($)</Label>
                  <Input
                    id="maxCommission"
                    type="number"
                    value={commissionSettings?.maxCommission || 0}
                    onChange={(e) => setCommissionSettings(prev => prev ? {
                      ...prev,
                      maxCommission: parseFloat(e.target.value)
                    } : null)}
                  />
                </div>
              </div>
              <Button onClick={() => commissionSettings && handleUpdateCommissionSettings(commissionSettings)}>
                Update Commission Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tiers</CardTitle>
              <CardDescription>Manage subscription plans for event creators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionTiers.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">${tier.price}/month</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{tier.maxEvents === -1 ? 'Unlimited' : `${tier.maxEvents} events`}</Badge>
                        <Badge variant="outline">{tier.commissionRate}% commission</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Tier
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input id="platformName" defaultValue="Event Management System" />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" defaultValue="support@example.com" />
                </div>
                <div>
                  <Label htmlFor="maxEventsPerUser">Max Events Per User</Label>
                  <Input id="maxEventsPerUser" type="number" defaultValue="10" />
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;