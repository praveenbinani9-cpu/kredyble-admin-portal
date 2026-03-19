import { useState, useEffect } from 'react';
import { Users, Building2, Banknote, Plus } from 'lucide-react';
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
import { beneficiariesAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await beneficiariesAPI.getAll();
        setBeneficiaries(response.data.beneficiaries);
      } catch (error) {
        console.error('Failed to fetch beneficiaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalReceived = beneficiaries.reduce((sum, b) => sum + b.total_received, 0);
  const activeBeneficiaries = beneficiaries.filter(b => b.status === 'active').length;

  return (
    <div className="space-y-6" data-testid="beneficiaries-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Beneficiaries</h1>
          <p className="text-slate-500">Manage vendor beneficiary accounts</p>
        </div>
        <Button data-testid="add-beneficiary-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Beneficiaries</p>
                <p className="text-xl font-bold">{beneficiaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Active</p>
                <p className="text-xl font-bold">{activeBeneficiaries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Received</p>
                <p className="text-xl font-bold">{formatCurrency(totalReceived, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beneficiaries Table */}
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
                  <TableHead>Beneficiary ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead className="text-right">Total Received</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id} data-testid={`beneficiary-row-${beneficiary.id}`}>
                    <TableCell className="font-mono font-medium">{beneficiary.id}</TableCell>
                    <TableCell className="font-medium">{beneficiary.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{beneficiary.bank_name}</p>
                        <p className="text-slate-500">{beneficiary.account_number} | {beneficiary.ifsc}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium currency">
                      {formatCurrency(beneficiary.total_received)}
                    </TableCell>
                    <TableCell className="text-right">{beneficiary.transactions_count}</TableCell>
                    <TableCell>
                      <StatusBadge status={beneficiary.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(beneficiary.added_at)}
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
