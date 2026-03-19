import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Clock, XCircle, Copy, ExternalLink, Search, Calendar, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  SheetDescription,
} from '../components/ui/sheet';
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
import { KPICard } from '../components/features/KPICard';
import { paymentLinksAPI } from '../lib/api';
import { formatCurrency, formatDate, formatPercent } from '../lib/utils';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, statsRes] = await Promise.all([
          paymentLinksAPI.getAll(),
          paymentLinksAPI.getStats()
        ]);
        setLinks(linksRes.data.links);
        setFilteredLinks(linksRes.data.links);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch payment links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...links];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(link => 
        link.id.toLowerCase().includes(query) ||
        link.customer.toLowerCase().includes(query) ||
        link.customer_email.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(link => link.status === statusFilter);
    }
    
    // Payment mode filter
    if (paymentModeFilter !== 'all') {
      filtered = filtered.filter(link => link.payment_mode === paymentModeFilter);
    }
    
    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(link => new Date(link.created_at) >= dateRange.from);
    }
    if (dateRange.to) {
      filtered = filtered.filter(link => new Date(link.created_at) <= dateRange.to);
    }
    
    setFilteredLinks(filtered);
  }, [links, searchQuery, statusFilter, paymentModeFilter, dateRange]);

  const kpiData = [
    { title: 'Links Created', value: stats?.created, icon: Link2, change: 'This month' },
    { title: 'Paid', value: stats?.paid, icon: CheckCircle, variant: 'highlight' },
    { title: 'Expired', value: stats?.expired, icon: XCircle, changeType: 'negative' },
    { title: 'Conversion', value: `${stats?.conversion_percent}%`, icon: Clock },
  ];

  const handleRowClick = (link) => {
    setSelectedLink(link);
    setDrawerOpen(true);
  };

  const copyLink = (url, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(url);
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'upi':
        return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'netbanking':
        return <Building2 className="h-4 w-4 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getPaymentModeLabel = (mode) => {
    const labels = {
      'upi': 'UPI',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'netbanking': 'Net Banking'
    };
    return labels[mode] || mode;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentModeFilter('all');
    setDateRange({ from: null, to: null });
  };

  // Calculate payment mode breakdown
  const paymentModeBreakdown = links.reduce((acc, link) => {
    if (link.payment_mode) {
      acc[link.payment_mode] = (acc[link.payment_mode] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="payment-links-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Links</h1>
          <p className="text-slate-500">Create and manage payment collection links</p>
        </div>
        <Button data-testid="create-link-btn">
          <Link2 className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Payment Mode Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Payment Mode Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {Object.entries(paymentModeBreakdown).map(([mode, count]) => (
              <div key={mode} className="flex items-center gap-3 p-3 border rounded-lg">
                {getPaymentModeIcon(mode)}
                <div>
                  <p className="text-sm font-medium">{getPaymentModeLabel(mode)}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID, customer, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-links"
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Mode Filter */}
            <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
              <SelectTrigger className="w-40" data-testid="payment-mode-filter">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
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

      {/* Links Table */}
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
                  <TableHead>Link ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount Requested</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No payment links found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link) => (
                    <TableRow
                      key={link.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleRowClick(link)}
                      data-testid={`link-row-${link.id}`}
                    >
                      <TableCell className="font-mono font-medium">{link.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{link.customer}</p>
                          <p className="text-xs text-slate-500">{link.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium currency">
                        {formatCurrency(link.amount_requested)}
                      </TableCell>
                      <TableCell className="text-right font-medium currency">
                        {formatCurrency(link.amount_paid)}
                      </TableCell>
                      <TableCell>
                        {link.payment_mode ? (
                          <div className="flex items-center gap-2">
                            {getPaymentModeIcon(link.payment_mode)}
                            <div>
                              <p className="text-sm font-medium">{getPaymentModeLabel(link.payment_mode)}</p>
                              {link.card_last_four && (
                                <p className="text-xs text-slate-500">****{link.card_last_four} ({link.card_network})</p>
                              )}
                              {link.upi_id && (
                                <p className="text-xs text-slate-500">{link.upi_id}</p>
                              )}
                              {link.bank_name && (
                                <p className="text-xs text-slate-500">{link.bank_name}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={link.status} />
                      </TableCell>
                      <TableCell>{link.attempts}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(link.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => copyLink(link.link_url, e)}
                          data-testid={`copy-link-${link.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Link Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto" data-testid="link-drawer">
          {selectedLink && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-lg font-semibold">Payment Link Details</SheetTitle>
                <SheetDescription>Details for payment link {selectedLink.id}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Link Info */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 uppercase">Link ID</span>
                    <StatusBadge status={selectedLink.status} />
                  </div>
                  <p className="font-mono font-semibold">{selectedLink.id}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => copyLink(selectedLink.link_url, e)}>
                      <Copy className="h-3 w-3 mr-1" /> Copy Link
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" /> Open
                    </Button>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Customer</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Name</span>
                      <span className="text-sm font-medium">{selectedLink.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Email</span>
                      <span className="text-sm font-medium">{selectedLink.customer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Phone</span>
                      <span className="text-sm font-medium">{selectedLink.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Amount</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Requested</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedLink.amount_requested)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Paid</span>
                      <span className="text-sm font-medium text-emerald-600">{formatCurrency(selectedLink.amount_paid)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedLink.payment_mode && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Payment Details</h4>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        {getPaymentModeIcon(selectedLink.payment_mode)}
                        <span className="font-medium">{getPaymentModeLabel(selectedLink.payment_mode)}</span>
                      </div>
                      {selectedLink.card_last_four && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Card Number</span>
                            <span className="font-medium">****{selectedLink.card_last_four}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Network</span>
                            <span className="font-medium">{selectedLink.card_network}</span>
                          </div>
                          {selectedLink.card_type && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Card Type</span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                selectedLink.card_type === 'corporate' ? 'bg-amber-100 text-amber-800' :
                                selectedLink.card_type === 'business' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {selectedLink.card_type?.charAt(0).toUpperCase() + selectedLink.card_type?.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedLink.upi_id && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">UPI ID</span>
                          <span className="font-medium">{selectedLink.upi_id}</span>
                        </div>
                      )}
                      {selectedLink.bank_name && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Bank</span>
                          <span className="font-medium">{selectedLink.bank_name}</span>
                        </div>
                      )}
                      {selectedLink.paid_at && (
                        <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                          <span className="text-slate-600">Paid At</span>
                          <span className="font-medium">{formatDate(selectedLink.paid_at, { format: 'long' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Timeline</h4>
                  <div className="timeline">
                    {selectedLink.timeline?.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <p className="timeline-title capitalize">{event.event}</p>
                          <p className="timeline-time">{formatDate(event.timestamp, { format: 'long' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failure Reasons */}
                {selectedLink.failure_reasons && selectedLink.failure_reasons.some(f => f.count > 0) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Failure Reasons</h4>
                    <div className="space-y-2">
                      {selectedLink.failure_reasons.filter(f => f.count > 0).map((failure, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                          <span className="text-sm text-red-700">{failure.reason}</span>
                          <span className="text-sm font-bold text-red-700">{failure.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
