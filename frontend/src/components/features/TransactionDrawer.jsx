import { X, Copy, ExternalLink, CreditCard, Smartphone, Building2 } from 'lucide-react';
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

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'upi':
        return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'netbanking':
        return <Building2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-slate-600" />;
    }
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
              {transaction.user_email && (
                <div className="breakdown-row">
                  <span className="breakdown-label">Email</span>
                  <span className="breakdown-value">{transaction.user_email}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span className="breakdown-label">Beneficiary</span>
                <span className="breakdown-value">{transaction.beneficiary}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Type</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  transaction.type === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {transaction.type === 'vendor' ? 'Vendor Payment' : 'Payment Link'}
                </span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">Date</span>
                <span className="breakdown-value">{formatDate(transaction.date, { format: 'long' })}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Method Details */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Payment Method</h4>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {getPaymentModeIcon(transaction.payment_mode)}
                <span className="font-medium">{getPaymentModeLabel(transaction.payment_mode)}</span>
              </div>
              <div className="space-y-2 text-sm">
                {transaction.card_last_four && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Card Number</span>
                      <span className="font-medium">****{transaction.card_last_four}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Network</span>
                      <span className="font-medium">{transaction.card_network}</span>
                    </div>
                  </>
                )}
                {transaction.card_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Card Type</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      transaction.card_type === 'corporate' ? 'bg-amber-100 text-amber-800' :
                      transaction.card_type === 'business' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {getCardTypeLabel(transaction.card_type)}
                    </span>
                  </div>
                )}
                {transaction.upi_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">UPI ID</span>
                    <span className="font-medium">{transaction.upi_id}</span>
                  </div>
                )}
                {transaction.bank_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bank</span>
                    <span className="font-medium">{transaction.bank_name}</span>
                  </div>
                )}
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
