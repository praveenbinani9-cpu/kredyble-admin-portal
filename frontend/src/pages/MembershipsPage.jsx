import { useState, useEffect } from 'react';
import { Crown, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { StatusBadge } from '../components/features/StatusBadge';
import { membershipsAPI } from '../lib/api';
import { formatDate, formatPercent } from '../lib/utils';

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await membershipsAPI.getAll();
        setMemberships(response.data.memberships);
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeMemberships = memberships.filter(m => m.status === 'active').length;
  const planCounts = memberships.reduce((acc, m) => {
    acc[m.plan_type] = (acc[m.plan_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="memberships-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Memberships</h1>
        <p className="text-slate-500">Manage user membership plans</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Memberships</p>
                <p className="text-xl font-bold">{memberships.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Active</p>
                <p className="text-xl font-bold text-emerald-600">{activeMemberships}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Premium</p>
                <p className="text-xl font-bold">{planCounts['premium'] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Enterprise</p>
                <p className="text-xl font-bold">{planCounts['enterprise'] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memberships Table */}
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
                  <TableHead>Membership ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Fee %</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id} data-testid={`membership-row-${membership.id}`}>
                    <TableCell className="font-mono font-medium">{membership.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{membership.user}</p>
                        <p className="text-xs text-slate-500">{membership.user_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize px-2 py-1 rounded text-sm font-medium ${
                        membership.plan_type === 'enterprise' ? 'bg-amber-100 text-amber-800' :
                        membership.plan_type === 'premium' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {membership.plan_type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{membership.fee_percent}%</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(membership.start_date)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(membership.expiry_date)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={membership.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
