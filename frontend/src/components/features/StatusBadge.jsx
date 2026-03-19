import { Badge } from '../ui/badge';
import { cn, getStatusColor, getSeverityColor } from '../../lib/utils';

export function StatusBadge({ status, type = 'status' }) {
  const colorClass = type === 'severity' 
    ? getSeverityColor(status) 
    : getStatusColor(status);

  return (
    <Badge 
      variant="outline" 
      className={cn('capitalize font-medium', colorClass)}
      data-testid={`status-badge-${status}`}
    >
      {status?.replace(/_/g, ' ')}
    </Badge>
  );
}
