import { useState, useEffect } from 'react';
import { CreditCard, Percent, Receipt } from 'lucide-react';
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
import { pgChargesAPI } from '../lib/api';
import { formatCurrency, formatPercent, formatDate } from '../lib/utils';

export default function PGChargesPage() {
  const [charges, setCharges] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chargesRes, summaryRes] = await Promise.all([
          pgChargesAPI.getAll(),
          pgChargesAPI.getSummary()
        ]);
        setCharges(chargesRes.data.charges);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch PG charges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpiData = [
    { 
      title: 'Total PG Cost', 
      value: summary?.total_pg_cost, 
      icon: CreditCard,
      change: 'This month',
      changeType: 'negative'
    },
    { 
      title: 'Total PG GST', 
      value: summary?.total_pg_gst, 
      icon: Receipt,
      change: '18% of PG fee'
    },
    { 
      title: 'Avg PG Rate', 
      value: `${summary?.avg_pg_rate}%`, 
      icon: Percent
    },
    { 
      title: 'Transactions', 
      value: summary?.transactions_count, 
      icon: Receipt
    },
  ];

  return (
    <div className="space-y-6" data-testid="pg-charges-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PG Charges</h1>
        <p className="text-slate-500">Payment gateway fees and costs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Transaction-wise PG Charges</CardTitle>
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
                  <TableHead className="text-right">Transaction Amount</TableHead>
                  <TableHead className="text-right">PG Fee</TableHead>
                  <TableHead className="text-right">PG GST</TableHead>
                  <TableHead className="text-right">Effective %</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.transaction_id} data-testid={`pg-row-${charge.transaction_id}`}>
                    <TableCell className="font-mono font-medium">{charge.transaction_id}</TableCell>
                    <TableCell className="text-right font-medium currency">
                      {formatCurrency(charge.amount)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium currency">
                      -{formatCurrency(charge.pg_fee)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium currency">
                      -{formatCurrency(charge.pg_gst)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPercent(charge.effective_percent)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(charge.date)}
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
