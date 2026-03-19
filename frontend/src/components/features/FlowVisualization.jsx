import { User, Building2, Landmark, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../lib/utils';

export function FlowVisualization({ data, title }) {
  if (!data) return null;

  const nodes = [
    { 
      icon: User, 
      label: 'User Paid', 
      amount: data.user_paid,
      color: 'bg-blue-500'
    },
    { 
      icon: Building2, 
      label: 'PG Received', 
      amount: data.pg_received,
      color: 'bg-slate-500'
    },
    { 
      icon: Landmark, 
      label: 'Platform', 
      amount: data.platform_collected,
      color: 'bg-emerald-500'
    },
    { 
      icon: Store, 
      label: 'Vendor Paid', 
      amount: data.vendor_paid,
      color: 'bg-purple-500'
    },
  ];

  return (
    <Card data-testid="flow-visualization">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-container">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isLast = index === nodes.length - 1;
            
            return (
              <div key={node.label} className="flex items-center">
                <div className="flow-node">
                  <div className={`flow-node-icon ${node.color} text-white border-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="flow-node-label">{node.label}</span>
                  <span className="flow-node-amount">
                    {formatCurrency(node.amount, { compact: true })}
                  </span>
                </div>
                {!isLast && (
                  <div className="flow-arrow mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
