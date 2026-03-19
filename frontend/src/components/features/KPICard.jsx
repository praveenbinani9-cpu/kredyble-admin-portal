import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn, formatCurrency } from '../../lib/utils';

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  variant = 'default',
  onClick 
}) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <Card 
      className={cn(
        'kpi-card border',
        onClick && 'cursor-pointer',
        variant === 'highlight' && 'border-emerald-200 bg-emerald-50'
      )}
      onClick={onClick}
      data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-xl font-bold text-slate-900 currency">
              {typeof value === 'number' ? formatCurrency(value, { compact: true }) : value}
            </p>
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive && 'text-emerald-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-slate-500'
              )}>
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg',
              variant === 'highlight' ? 'bg-emerald-100' : 'bg-slate-100'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                variant === 'highlight' ? 'text-emerald-600' : 'text-slate-600'
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
