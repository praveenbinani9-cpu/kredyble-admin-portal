import { X, Copy, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../../lib/utils';

export function TransactionDrawer({ transaction, open, onClose }) {
  if (!transaction) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto" data-testid="transaction-drawer">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Transaction Details</SheetTitle>
          </div>
          <SheetDescription>Complete breakdown of transaction {transaction.id}</SheetDescription>
        </SheetHeader>

        {/* Transaction ID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Transaction ID</p>
              <p className="font-mono font-semibold">{transaction.id}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => copyToClipboard(transaction.id)}
                data-testid="copy-txn-id"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <StatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Basic Info */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Basic Information</h4>
            <div className="space-y-3">
              <div className="breakdown-row">
                <span className="breakdown-label">User</span>
                <span className="breakdown-value">{transaction.user}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Beneficiary</span>
                <span className="breakdown-value">{transaction.beneficiary}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Type</span>
                <span className="breakdown-value capitalize">{transaction.type}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Payment Mode</span>
                <span className="breakdown-value uppercase">{transaction.payment_mode}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Date</span>
                <span className="breakdown-value">{formatDate(transaction.date, { format: 'long' })}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Breakdown */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Amount Breakdown</h4>
            <div className="space-y-3">
              <div className="breakdown-row">
                <span className="breakdown-label">Base Amount</span>
                <span className="breakdown-value">{formatCurrency(transaction.base_amount)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Platform Fee (2%)</span>
                <span className="breakdown-value">{formatCurrency(transaction.platform_fee)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">GST Collected (18%)</span>
                <span className="breakdown-value">{formatCurrency(transaction.gst_collected)}</span>
              </div>
              <Separator className="my-2" />
              <div className="breakdown-row font-semibold">
                <span className="text-slate-900">Total Charged</span>
                <span className="text-slate-900">{formatCurrency(transaction.total_charged)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Cost Breakdown</h4>
            <div className="space-y-3">
              <div className="breakdown-row">
                <span className="breakdown-label">PG Fee (1.8%)</span>
                <span className="breakdown-value negative">-{formatCurrency(transaction.pg_fee)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">PG GST (18%)</span>
                <span className="breakdown-value negative">-{formatCurrency(transaction.pg_gst)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Net Revenue */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Net Revenue</h4>
            <div className="space-y-3">
              <div className="breakdown-row">
                <span className="breakdown-label">Platform Fee</span>
                <span className="breakdown-value">{formatCurrency(transaction.platform_fee)}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Less: PG Fee</span>
                <span className="breakdown-value negative">-{formatCurrency(transaction.pg_fee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="breakdown-row font-semibold">
                <span className="text-slate-900">Net Revenue</span>
                <span className="breakdown-value positive">{formatCurrency(transaction.net_revenue)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cash Balance */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Net Cash Balance</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(transaction.net_cash_balance)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <ExternalLink className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
