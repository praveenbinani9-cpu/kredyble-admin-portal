import { useState, useEffect } from 'react';
import { Receipt, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { KPICard } from '../components/features/KPICard';
import { gstAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function GSTPage() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, transactionsRes] = await Promise.all([
          gstAPI.getSummary(),
          gstAPI.getTransactions()
        ]);
        setSummary(summaryRes.data);
        setTransactions(transactionsRes.data.transactions);
      } catch (error) {
        console.error('Failed to fetch GST data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpiData = [
    { 
      title: 'GST Collected', 
      value: summary?.gst_collected, 
      icon: TrendingUp,
      change: 'Output tax',
      changeType: 'positive'
    },
    { 
      title: 'Input Credit', 
      value: summary?.input_credit, 
      icon: TrendingDown,
      change: 'PG GST paid'
    },
    { 
      title: 'Net Payable', 
      value: summary?.net_payable, 
      icon: Calculator,
      variant: 'highlight',
      change: 'Due: 20th of month'
    },
  ];

  return (
    <div className="space-y-6" data-testid="gst-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">GST & Tax</h1>
        <p className="text-slate-500">GST collection and input credit management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* CGST/SGST Split */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">GST Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-700">CGST (Central)</p>
                  <p className="text-xs text-blue-600">9% of Platform Fee</p>
                </div>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(summary?.cgst)}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-700">SGST (State)</p>
                  <p className="text-xs text-purple-600">9% of Platform Fee</p>
                </div>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(summary?.sgst)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tax Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-600">Output GST (Collected)</span>
                <span className="font-medium text-emerald-600">+{formatCurrency(summary?.gst_collected)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-600">Input Credit (PG GST)</span>
                <span className="font-medium text-red-600">-{formatCurrency(summary?.input_credit)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-emerald-50 -mx-4 px-4 rounded-lg mt-2">
                <span className="font-semibold text-emerald-700">Net GST Payable</span>
                <span className="text-xl font-bold text-emerald-700">{formatCurrency(summary?.net_payable)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction-level GST */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Transaction-level GST</CardTitle>
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Base Amount</TableHead>
                  <TableHead className="text-right">Platform Fee</TableHead>
                  <TableHead className="text-right">GST Collected</TableHead>
                  <TableHead className="text-right">CGST</TableHead>
                  <TableHead className="text-right">SGST</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.transaction_id} data-testid={`gst-row-${txn.transaction_id}`}>
                    <TableCell className="font-mono font-medium">{txn.transaction_id}</TableCell>
                    <TableCell className="text-right currency">{formatCurrency(txn.base_amount)}</TableCell>
                    <TableCell className="text-right currency">{formatCurrency(txn.platform_fee)}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 currency">
                      {formatCurrency(txn.gst_collected)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 currency">{formatCurrency(txn.cgst)}</TableCell>
                    <TableCell className="text-right text-purple-600 currency">{formatCurrency(txn.sgst)}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(txn.date)}</TableCell>
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
