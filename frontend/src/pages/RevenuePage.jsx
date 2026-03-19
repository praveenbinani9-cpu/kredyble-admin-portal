import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { KPICard } from '../components/features/KPICard';
import { revenueAPI } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

export default function RevenuePage() {
  const [analytics, setAnalytics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, trendRes] = await Promise.all([
          revenueAPI.getAnalytics(),
          revenueAPI.getTrend()
        ]);
        setAnalytics(analyticsRes.data);
        setTrend(trendRes.data);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
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
    { 
      title: 'Total Platform Fee', 
      value: analytics?.total_platform_fee, 
      icon: DollarSign,
      change: '+15.3% vs last month',
      changeType: 'positive'
    },
    { 
      title: 'Total PG Cost', 
      value: analytics?.total_pg_cost, 
      icon: CreditCard,
      change: '+12.1% vs last month',
      changeType: 'negative'
    },
    { 
      title: 'Net Revenue', 
      value: analytics?.net_revenue, 
      icon: TrendingUp,
      variant: 'highlight',
      change: '+23.4% vs last month',
      changeType: 'positive'
    },
  ];

  const flowData = [
    { name: 'Vendor Payments', revenue: analytics?.by_flow?.vendor?.revenue, cost: analytics?.by_flow?.vendor?.pg_cost },
    { name: 'Payment Links', revenue: analytics?.by_flow?.links?.revenue, cost: analytics?.by_flow?.links?.pg_cost },
  ];

  const modeData = Object.entries(analytics?.by_payment_mode || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    revenue: value.revenue,
    cost: value.pg_cost
  }));

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
    <div className="space-y-6" data-testid="revenue-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
        <p className="text-slate-500">Platform fee vs PG cost analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Platform Fee vs PG Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.slice(-14)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="platform_fee" name="Platform Fee" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pg_cost" name="PG Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Net Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Net Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={trend.slice(-14).map(d => ({ ...d, net: d.platform_fee - d.pg_cost }))} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="net" name="Net Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-6">
        {/* By Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Breakdown by Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowData} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="cost" name="PG Cost" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Payment Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Breakdown by Payment Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="PG Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
