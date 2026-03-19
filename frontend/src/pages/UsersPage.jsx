import { useState, useEffect } from 'react';
import { UserCircle, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
} from '../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { StatusBadge } from '../components/features/StatusBadge';
import { usersAPI } from '../lib/api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Search } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await usersAPI.getAll();
        setUsers(response.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredUsers = users.filter(user =>
    searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const activeUsers = users.filter(u => u.status === 'active').length;
  const verifiedUsers = users.filter(u => u.kyb_status === 'verified').length;

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users & KYB</h1>
        <p className="text-slate-500">Manage users and verification status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Active</p>
                <p className="text-xl font-bold text-emerald-600">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">KYB Verified</p>
                <p className="text-xl font-bold">{verifiedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Pending KYB</p>
                <p className="text-xl font-bold">{users.filter(u => u.kyb_status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-users"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYB Status</TableHead>
                  <TableHead className="text-right">Total Transactions</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Membership</TableHead>
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
                          <p className="text-xs text-slate-500">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{user.email}</p>
                        <p className="text-slate-500">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.kyb_status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{user.total_transactions}</TableCell>
                    <TableCell className="text-right font-medium currency">
                      {formatCurrency(user.total_volume, { compact: true })}
                    </TableCell>
                    <TableCell>
                      {user.membership ? (
                        <span className="capitalize text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {user.membership}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto" data-testid="user-drawer">
          {selectedUser && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-lg font-semibold">User Profile</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-slate-900 text-white text-xl">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <StatusBadge status={selectedUser.status} />
                      <StatusBadge status={selectedUser.kyb_status} />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="documents">KYB Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Total Transactions</p>
                        <p className="text-xl font-bold">{selectedUser.total_transactions}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Total Volume</p>
                        <p className="text-xl font-bold">{formatCurrency(selectedUser.total_volume, { compact: true })}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Linked Cards</p>
                        <p className="text-xl font-bold">{selectedUser.linked_cards}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Membership</p>
                        <p className="text-xl font-bold capitalize">{selectedUser.membership || 'None'}</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Applied Offers</h4>
                      {userDetail?.applied_offers?.map((offer, i) => (
                        <span key={i} className="inline-block bg-slate-100 text-sm px-2 py-1 rounded mr-2">
                          {offer}
                        </span>
                      ))}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Member Since</h4>
                      <p className="text-sm text-slate-600">{formatDate(selectedUser.joined_at, { format: 'long' })}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="mt-4">
                    <div className="space-y-2">
                      {userDetail?.transactions?.slice(0, 5).map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-mono text-sm font-medium">{txn.id}</p>
                            <p className="text-xs text-slate-500">{formatDate(txn.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(txn.total_charged)}</p>
                            <StatusBadge status={txn.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">PAN Card</p>
                            <p className="text-xs text-slate-500">Identity Document</p>
                          </div>
                        </div>
                        <StatusBadge status={selectedUser.kyb_status === 'verified' ? 'verified' : 'pending'} />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">GST Certificate</p>
                            <p className="text-xs text-slate-500">Business Document</p>
                          </div>
                        </div>
                        <StatusBadge status={selectedUser.kyb_status === 'verified' ? 'verified' : 'pending'} />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Bank Statement</p>
                            <p className="text-xs text-slate-500">Financial Document</p>
                          </div>
                        </div>
                        <StatusBadge status={selectedUser.kyb_status === 'verified' ? 'verified' : 'pending'} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
