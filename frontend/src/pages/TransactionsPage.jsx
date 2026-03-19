import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, CreditCard } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { StatusBadge } from '../components/features/StatusBadge';
import { TransactionDrawer } from '../components/features/TransactionDrawer';
import { transactionsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [cardTypeFilter, setCardTypeFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Update search and type when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlType = searchParams.get('type') || 'all';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlType !== typeFilter) {
      setTypeFilter(urlType);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(cardTypeFilter !== 'all' && { card_type: cardTypeFilter }),
        ...(paymentModeFilter !== 'all' && { payment_mode: paymentModeFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(dateRange.from && { start_date: dateRange.from.toISOString() }),
        ...(dateRange.to && { end_date: dateRange.to.toISOString() }),
      };
      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, cardTypeFilter, paymentModeFilter, debouncedSearch, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, cardTypeFilter, paymentModeFilter, debouncedSearch, dateRange]);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  };

  const getPaymentModeLabel = (mode) => {
    const labels = {
      'card': 'Card',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'upi': 'UPI',
      'netbanking': 'Net Banking'
    };
    return labels[mode] || mode;
  };

  const getCardTypeLabel = (type) => {
    const labels = {
      'retail': 'Retail',
      'business': 'Business',
      'corporate': 'Corporate'
    };
    return labels[type] || type;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setCardTypeFilter('all');
    setPaymentModeFilter('all');
    setSearchQuery('');
    setDateRange({ from: null, to: null });
  };

  return (
    <div className="space-y-6" data-testid="transactions-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500">View and manage all transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID, user, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-transactions"
              />
            </div>
            
            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="date-range-filter">
                  <Calendar className="h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <span className="text-sm">
                        {formatDate(dateRange.from.toISOString())} - {formatDate(dateRange.to.toISOString())}
                      </span>
                    ) : (
                      <span className="text-sm">{formatDate(dateRange.from.toISOString())}</span>
                    )
                  ) : (
                    <span className="text-sm">Date Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: null, to: null })}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36" data-testid="type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendor Payment</SelectItem>
                <SelectItem value="link">Payment Link</SelectItem>
              </SelectContent>
            </Select>

            {/* Card Type Filter (for vendor payments) */}
            <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
              <SelectTrigger className="w-36" data-testid="card-type-filter">
                <SelectValue placeholder="Card Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Mode Filter */}
            <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
              <SelectTrigger className="w-40" data-testid="payment-mode-filter">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Card Type</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead className="text-right">Total Charged</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No transactions found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((txn) => (
                      <TableRow
                        key={txn.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleRowClick(txn)}
                        data-testid={`transaction-row-${txn.id}`}
                      >
                        <TableCell className="font-mono font-medium">{txn.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.user}</p>
                            <p className="text-xs text-slate-500">{txn.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`capitalize text-xs px-2 py-1 rounded font-medium ${
                            txn.type === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {txn.type === 'vendor' ? 'Vendor' : 'Link'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getPaymentModeLabel(txn.payment_mode)}</span>
                          {txn.card_last_four && (
                            <span className="text-xs text-slate-500 ml-1">****{txn.card_last_four}</span>
                          )}
                          {txn.upi_id && (
                            <p className="text-xs text-slate-500">{txn.upi_id}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {txn.card_type ? (
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              txn.card_type === 'corporate' ? 'bg-amber-100 text-amber-800' :
                              txn.card_type === 'business' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {getCardTypeLabel(txn.card_type)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium currency">
                          {formatCurrency(txn.base_amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium currency">
                          {formatCurrency(txn.total_charged)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={txn.status} />
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(txn.date)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
