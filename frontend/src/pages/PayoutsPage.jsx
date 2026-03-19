import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { StatusBadge } from '../components/features/StatusBadge';
import { KPICard } from '../components/features/KPICard';
import { payoutsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statusParam = activeTab === 'all' ? undefined : activeTab;
        const [payoutsRes, statsRes] = await Promise.all([
          payoutsAPI.getAll(statusParam),
          payoutsAPI.getStats()
        ]);
        setPayouts(payoutsRes.data.payouts);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const kpiData = [
    { 
      title: 'Completed', 
      value: stats?.completed?.amount, 
      icon: CheckCircle, 
      change: `${stats?.completed?.count} payouts`,
      variant: 'highlight'
    },
    { 
      title: 'In Process', 
      value: stats?.processing?.amount, 
      icon: Clock, 
      change: `${stats?.processing?.count} payouts`
    },
    { 
      title: 'Failed', 
      value: stats?.failed?.amount, 
      icon: XCircle, 
      change: `${stats?.failed?.count} payouts`,
      changeType: 'negative'
    },
  ];

  return (
    <div className="space-y-6" data-testid="payouts-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
        <p className="text-slate-500">Manage vendor payouts and settlements</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
              <TabsTrigger value="processing" data-testid="tab-processing">In Process</TabsTrigger>
              <TabsTrigger value="failed" data-testid="tab-failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Linked Transaction</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id} data-testid={`payout-row-${payout.id}`}>
                    <TableCell className="font-mono font-medium">{payout.id}</TableCell>
                    <TableCell>{payout.beneficiary}</TableCell>
                    <TableCell className="text-right font-medium currency">
                      {formatCurrency(payout.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-500">
                      {payout.linked_transaction}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{payout.account_number}</p>
                        <p className="text-slate-500">{payout.ifsc}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payout.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(payout.date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Payout Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="timeline">
            {payouts.slice(0, 5).map((payout) => (
              <div key={payout.id} className="timeline-item">
                <div className={`timeline-dot ${payout.status === 'failed' ? 'failed' : payout.status === 'processing' ? 'pending' : ''}`} />
                <div className="timeline-content">
                  <p className="timeline-title">
                    {formatCurrency(payout.amount)} to {payout.beneficiary}
                  </p>
                  <p className="timeline-time">{formatDate(payout.date, { format: 'long' })}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
