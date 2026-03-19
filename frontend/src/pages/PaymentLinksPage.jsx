import { useState, useEffect } from 'react';
import { Link2, CheckCircle, Clock, XCircle, Copy, ExternalLink } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { StatusBadge } from '../components/features/StatusBadge';
import { KPICard } from '../components/features/KPICard';
import { paymentLinksAPI } from '../lib/api';
import { formatCurrency, formatDate, formatPercent } from '../lib/utils';

export default function PaymentLinksPage() {
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, statsRes] = await Promise.all([
          paymentLinksAPI.getAll(),
          paymentLinksAPI.getStats()
        ]);
        setLinks(linksRes.data.links);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch payment links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
  };

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
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          copyLink(link.link_url);
                        }}
                        data-testid={`copy-link-${link.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Link Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto" data-testid="link-drawer">
          {selectedLink && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-lg font-semibold">Payment Link Details</SheetTitle>
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
                    <Button size="sm" variant="outline" onClick={() => copyLink(selectedLink.link_url)}>
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
