import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  UserCircle, CheckCircle, Clock, AlertTriangle, CreditCard, 
  TrendingDown, FileText, Check, X, Eye, Building2, Users as UsersIcon,
  BarChart3, AlertCircle, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { StatusBadge } from '../components/features/StatusBadge';
import { usersAPI } from '../lib/api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [dropoffData, setDropoffData] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('all-users');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Update search when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllData();
  }, [searchQuery]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes, dropoffRes, journeyRes] = await Promise.all([
        usersAPI.getAll(searchQuery || undefined),
        usersAPI.getPendingApproval(),
        usersAPI.getDropoffAnalytics(),
        usersAPI.getJourneyAnalytics()
      ]);
      setUsers(usersRes.data.users);
      setPendingUsers(pendingRes.data.users);
      setDropoffData(dropoffRes.data);
      setJourneyData(journeyRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    try {
      const response = await usersAPI.getById(user.id);
      setUserDetail(response.data);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
  };

  const handleApproveDocument = async (userId, documentType) => {
    try {
      await usersAPI.approveDocument(userId, documentType, { action: 'approve' });
      
      // Update local state instead of refetching all data
      if (userDetail) {
        const updatedDocs = userDetail.documents.map(doc => 
          doc.type === documentType ? { ...doc, status: 'approved' } : doc
        );
        setUserDetail({ ...userDetail, documents: updatedDocs });
      }
      
      // Also update the selected user
      if (selectedUser) {
        const updatedDocs = selectedUser.documents?.map(doc => 
          doc.type === documentType ? { ...doc, status: 'approved' } : doc
        ) || [];
        setSelectedUser({ ...selectedUser, documents: updatedDocs });
      }
      
      // Update users list
      setUsers(users.map(u => {
        if (u.id === userId) {
          const updatedDocs = u.documents?.map(doc => 
            doc.type === documentType ? { ...doc, status: 'approved' } : doc
          ) || [];
          return { ...u, documents: updatedDocs };
        }
        return u;
      }));
      
      // Update pending users list
      setPendingUsers(pendingUsers.map(u => {
        if (u.id === userId) {
          const updatedDocs = u.documents?.map(doc => 
            doc.type === documentType ? { ...doc, status: 'approved' } : doc
          ) || [];
          return { ...u, documents: updatedDocs };
        }
        return u;
      }));
      
    } catch (error) {
      console.error('Failed to approve document:', error);
      alert('Failed to approve document. Please try again.');
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument) return;
    try {
      await usersAPI.approveDocument(selectedDocument.userId, selectedDocument.type, { 
        action: 'reject',
        rejection_reason: rejectReason 
      });
      
      // Update local state instead of refetching
      if (userDetail) {
        const updatedDocs = userDetail.documents.map(doc => 
          doc.type === selectedDocument.type ? { ...doc, status: 'rejected', rejection_reason: rejectReason } : doc
        );
        setUserDetail({ ...userDetail, documents: updatedDocs });
      }
      
      if (selectedUser) {
        const updatedDocs = selectedUser.documents?.map(doc => 
          doc.type === selectedDocument.type ? { ...doc, status: 'rejected', rejection_reason: rejectReason } : doc
        ) || [];
        setSelectedUser({ ...selectedUser, documents: updatedDocs });
      }
      
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to reject document:', error);
      alert('Failed to reject document. Please try again.');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await usersAPI.approveUser(userId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, approval_status: 'approved' } : u
      ));
      
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, approval_status: 'approved' });
      }
      
      if (userDetail && userDetail.id === userId) {
        setUserDetail({ ...userDetail, approval_status: 'approved' });
      }
      
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const activeUsers = users.filter(u => u.status === 'active').length;
  const verifiedUsers = users.filter(u => u.kyb_status === 'verified').length;
  const pendingApprovalCount = users.filter(u => u.approval_status === 'pending_approval').length;

  const getBusinessTypeLabel = (type) => {
    const labels = {
      'proprietorship': 'Proprietorship',
      'partnership': 'Partnership',
      'pvt_ltd': 'Pvt Ltd',
      'llp': 'LLP'
    };
    return labels[type] || type;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{payload[0].payload.stage || payload[0].payload.error}</p>
          <p className="text-sm text-slate-600">Count: {payload[0].value}</p>
          {payload[0].payload.percentage && (
            <p className="text-sm text-slate-600">{payload[0].payload.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users & KYB</h1>
        <p className="text-slate-500">Manage users, KYC/KYB verification, and analyze drop-offs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <UserCircle className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">KYB Verified</p>
                <p className="text-xl font-bold text-emerald-600">{verifiedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Pending Approval</p>
                <p className="text-xl font-bold text-amber-600">{pendingApprovalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Drop-off Rate</p>
                <p className="text-xl font-bold text-red-600">65.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Active Users</p>
                <p className="text-xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all-users" data-testid="tab-all-users">All Users</TabsTrigger>
          <TabsTrigger value="pending-approval" data-testid="tab-pending-approval">
            Pending Approval ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="dropoff-analytics" data-testid="tab-dropoff">Drop-off Analytics</TabsTrigger>
          <TabsTrigger value="journey-analytics" data-testid="tab-journey">User Journey</TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all-users" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users or business..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-users"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="pvt_ltd">Pvt Ltd</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>KYB Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleRowClick(user)}
                      data-testid={`user-row-${user.id}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{user.business_name}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm bg-slate-100 px-2 py-1 rounded capitalize">
                          {getBusinessTypeLabel(user.business_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.kyb_status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.approval_status} />
                      </TableCell>
                      <TableCell className="text-right font-medium currency">
                        {formatCurrency(user.total_volume, { compact: true })}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {formatDate(user.last_active, { format: 'relative' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending-approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                First-Time Users Pending Document Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => {
                    const pendingDocs = user.documents?.filter(d => d.status === 'pending').length || 0;
                    const totalDocs = user.documents?.length || 0;
                    return (
                      <TableRow key={user.id} data-testid={`pending-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-amber-100 text-amber-600 text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.business_name}</TableCell>
                        <TableCell>
                          <span className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {getBusinessTypeLabel(user.business_type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            <span className="text-amber-600 font-medium">{pendingDocs}</span>
                            <span className="text-slate-400">/{totalDocs} pending</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {formatDate(user.joined_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRowClick(user)}
                              data-testid={`review-${user.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApproveUser(user.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                              data-testid={`approve-user-${user.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve All
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drop-off Analytics Tab */}
        <TabsContent value="dropoff-analytics" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">User Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dropoffData?.funnel?.map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <span className="text-sm text-slate-600">{stage.users} users ({stage.percentage}%)</span>
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full rounded-lg transition-all"
                          style={{ 
                            width: `${stage.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Error Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dropoffData?.error_breakdown} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="error" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drop-off Reasons Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Drop-off by Stage</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Users Lost</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead>Top Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dropoffData?.drop_off_reasons?.map((item) => (
                    <TableRow key={item.stage}>
                      <TableCell className="font-medium capitalize">{item.stage.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{item.count}</TableCell>
                      <TableCell className="text-right">{item.percentage}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {item.top_errors.map((err) => (
                            <span key={err} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              {err}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey-analytics" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Avg Session Duration</p>
                <p className="text-2xl font-bold">{Math.floor((journeyData?.session_data?.avg_session_duration || 0) / 60)}m {(journeyData?.session_data?.avg_session_duration || 0) % 60}s</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Pages Per Session</p>
                <p className="text-2xl font-bold">{journeyData?.session_data?.avg_pages_per_session}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Returning User Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{journeyData?.session_data?.returning_user_rate}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Exit Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Exit Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journeyData?.exit_points?.map((point, index) => (
                    <div key={point.point} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-300">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{point.point}</p>
                          <p className="text-xs text-slate-500">{point.users} users</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-red-600">{point.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Page Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">Bounce Rate</TableHead>
                      <TableHead className="text-right">Exit Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journeyData?.page_analytics?.map((page) => (
                      <TableRow key={page.page}>
                        <TableCell className="font-medium">{page.page}</TableCell>
                        <TableCell className="text-right">{Math.floor(page.avg_time_seconds / 60)}m {page.avg_time_seconds % 60}s</TableCell>
                        <TableCell className="text-right">
                          <span className={page.bounce_rate > 15 ? 'text-red-600' : 'text-slate-600'}>
                            {page.bounce_rate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={page.exit_rate > 20 ? 'text-red-600' : 'text-slate-600'}>
                            {page.exit_rate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Device Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {journeyData?.device_breakdown?.map((device) => (
                  <div key={device.device} className="p-4 border rounded-lg text-center">
                    <p className="text-lg font-bold">{device.device}</p>
                    <p className="text-2xl font-bold text-slate-900">{device.users}</p>
                    <p className="text-sm text-slate-500">users</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm">
                        Completion: <span className="font-bold text-emerald-600">{device.completion_rate}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[640px] sm:max-w-[640px] overflow-y-auto" data-testid="user-drawer">
          {selectedUser && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-lg font-semibold">User Profile & Documents</SheetTitle>
                <SheetDescription>Review and approve KYC/KYB documents</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-slate-900 text-white text-xl">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    <p className="text-sm font-medium mt-1">{selectedUser.business_name}</p>
                    <div className="flex gap-2 mt-2">
                      <StatusBadge status={selectedUser.kyb_status} />
                      <StatusBadge status={selectedUser.approval_status} />
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {getBusinessTypeLabel(selectedUser.business_type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Business Type</p>
                      <p className="font-medium">{getBusinessTypeLabel(selectedUser.business_type)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Total Volume</p>
                      <p className="font-medium">{formatCurrency(selectedUser.total_volume)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Transactions</p>
                      <p className="font-medium">{selectedUser.total_transactions}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Member Since</p>
                      <p className="font-medium">{formatDate(selectedUser.joined_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Proprietors/Directors */}
                {userDetail?.proprietors && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="text-sm font-semibold mb-3">
                      {selectedUser.business_type === 'proprietorship' ? 'Proprietor' : 
                       selectedUser.business_type === 'partnership' ? 'Partners' : 'Directors'}
                    </h4>
                    <div className="space-y-2">
                      {userDetail.proprietors.map((person, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-xs text-slate-500">{person.designation}</p>
                          </div>
                          <div className="flex gap-2">
                            {person.aadhar_verified && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Aadhar ✓</span>
                            )}
                            {person.pan_verified && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">PAN ✓</span>
                            )}
                            {person.din_number && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{person.din_number}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents for Approval */}
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    KYC/KYB Documents
                  </h4>
                  <div className="space-y-3">
                    {(userDetail?.documents || selectedUser.documents)?.map((doc) => (
                      <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            doc.status === 'approved' ? 'bg-emerald-100' :
                            doc.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                          }`}>
                            <FileText className={`h-4 w-4 ${
                              doc.status === 'approved' ? 'text-emerald-600' :
                              doc.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{doc.label || doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-xs text-slate-500">
                              Submitted: {formatDate(doc.submitted_at)}
                            </p>
                            {doc.rejection_reason && (
                              <p className="text-xs text-red-600 mt-1">
                                Rejection: {doc.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={doc.status} />
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleApproveDocument(selectedUser.id, doc.type)}
                                data-testid={`approve-doc-${doc.type}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedDocument({ userId: selectedUser.id, type: doc.type, label: doc.label });
                                  setRejectDialogOpen(true);
                                }}
                                data-testid={`reject-doc-${doc.type}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drop-off Info (if any) */}
                {selectedUser.drop_off_stage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      User Drop-off Detected
                    </h4>
                    <p className="text-sm text-red-600">
                      Stage: <span className="font-medium capitalize">{selectedUser.drop_off_stage.replace(/_/g, ' ')}</span>
                    </p>
                    {selectedUser.last_error && (
                      <p className="text-sm text-red-600 mt-1">
                        Last Error: <span className="font-mono bg-red-100 px-1 rounded">{selectedUser.last_error}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {selectedUser.approval_status === 'pending_approval' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApproveUser(selectedUser.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve User
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        setSelectedDocument({ userId: selectedUser.id, type: 'user', label: 'User' });
                        setRejectDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject User
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedDocument?.label || 'Document'}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be communicated to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRejectDocument}
              disabled={!rejectReason}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
