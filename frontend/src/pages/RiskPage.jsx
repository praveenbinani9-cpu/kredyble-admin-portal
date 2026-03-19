import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Clock, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
import { riskAPI } from '../lib/api';
import { formatCurrency, formatDate, getSeverityColor } from '../lib/utils';
import { cn } from '../lib/utils';

export default function RiskPage() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, summaryRes] = await Promise.all([
          riskAPI.getAlerts(),
          riskAPI.getSummary()
        ]);
        setAlerts(alertsRes.data.alerts);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (alertId, action) => {
    try {
      await riskAPI.action(alertId, action);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: action } : alert
      ));
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const kpiData = [
    { 
      title: 'High Severity', 
      value: summary?.high_severity, 
      icon: AlertTriangle,
      changeType: 'negative'
    },
    { 
      title: 'Medium Severity', 
      value: summary?.medium_severity, 
      icon: Clock
    },
    { 
      title: 'Low Severity', 
      value: summary?.low_severity, 
      icon: ShieldAlert
    },
    { 
      title: 'Pending Review', 
      value: summary?.pending_review, 
      icon: Clock,
      change: 'Requires attention'
    },
  ];

  return (
    <div className="space-y-6" data-testid="risk-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk & Flags</h1>
        <p className="text-slate-500">Monitor suspicious activity and risk alerts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} data-testid={`alert-row-${alert.id}`}>
                    <TableCell className="font-mono font-medium">{alert.id}</TableCell>
                    <TableCell className="font-mono text-sm">{alert.transaction_id}</TableCell>
                    <TableCell>{alert.user}</TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{alert.type.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex px-2 py-1 rounded text-xs font-medium border capitalize',
                        getSeverityColor(alert.severity)
                      )}>
                        {alert.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium currency">
                      {formatCurrency(alert.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={alert.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {formatDate(alert.created_at, { format: 'relative' })}
                    </TableCell>
                    <TableCell>
                      {alert.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleAction(alert.id, 'cleared')}
                            data-testid={`clear-${alert.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleAction(alert.id, 'blocked')}
                            data-testid={`block-${alert.id}`}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Risk Info */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alert Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Suspicious Pattern</p>
                    <p className="text-xs text-slate-500">Unusual transaction patterns</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Repeated Failures</p>
                    <p className="text-xs text-slate-500">Multiple failed attempts</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <ShieldAlert className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">High Value</p>
                    <p className="text-xs text-slate-500">Transaction exceeds threshold</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Blocked Today</span>
                <span className="text-lg font-bold text-red-600">{summary?.blocked_today}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cleared Today</span>
                <span className="text-lg font-bold text-emerald-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">False Positive Rate</span>
                <span className="text-lg font-bold">8.2%</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">{summary?.pending_review}</span> alerts require immediate review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
