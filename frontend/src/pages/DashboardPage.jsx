import { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  PiggyBank,
  Receipt,
  Calculator,
  Link2,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { KPICard } from '../components/features/KPICard';
import { dashboardAPI } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0f172a', '#10b981', '#3b82f6', '#f59e0b'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, volumeRes, revenueRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getVolumeChart(),
          dashboardAPI.getRevenueChart()
        ]);
        setStats(statsRes.data);
        setVolumeData(volumeRes.data);
        setRevenueData(revenueRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpiData = [
    { title: 'Total Collected', value: stats?.total_collected, icon: Wallet, change: '+12.5% vs last month', changeType: 'positive' },
    { title: 'Via Vendor Payments', value: stats?.vendor_payments_collected, icon: Building2, change: '54% of total', changeType: 'neutral' },
    { title: 'Via Payment Links', value: stats?.links_collected, icon: Link2, change: '46% of total', changeType: 'neutral' },
    { title: 'Platform Revenue', value: stats?.platform_revenue, icon: TrendingUp, change: '+15.3% vs last month', changeType: 'positive', variant: 'highlight' },
    { title: 'PG Charges', value: stats?.pg_charges, icon: Receipt, change: '+7.1% vs last month', changeType: 'negative' },
    { title: 'GST Payable', value: stats?.gst_payable, icon: Calculator, change: 'Due: 20th Jan', changeType: 'neutral' },
  ];

  const pieData = [
    { name: 'Vendor Payments', value: stats?.vendor_payments_collected || 8500000 },
    { name: 'Payment Links', value: stats?.links_collected || 7289234 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your platform metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Daily Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Daily Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData.slice(-14)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="vendor" name="Vendor Payments" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="links" name="Payment Links" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue vs PG Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue vs PG Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.slice(-14)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Platform Revenue" stroke="#10b981" fill="#10b98133" />
                  <Area type="monotone" dataKey="pg_cost" name="PG Cost" stroke="#ef4444" fill="#ef444433" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total Transactions Today</p>
                  <p className="text-2xl font-bold">{stats?.total_transactions}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">{stats?.active_users}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Pending Settlements</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats?.pending_settlements, { compact: true })}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
