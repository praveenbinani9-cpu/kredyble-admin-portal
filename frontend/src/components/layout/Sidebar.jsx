import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Receipt, 
  Wallet,
  Link2,
  Users,
  Tag,
  Crown,
  UserCircle,
  PieChart,
  CreditCard,
  FileText,
  ShieldAlert,
  Headphones,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { ScrollArea } from '../ui/scroll-area';

const navigationItems = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Collections & Flow', href: '/collections', icon: ArrowRightLeft },
    ]
  },
  {
    section: 'Transactions',
    items: [
      { name: 'Transactions', href: '/transactions', icon: Receipt },
      { name: 'Payouts', href: '/payouts', icon: Wallet },
      { name: 'Payment Links', href: '/payment-links', icon: Link2 },
    ]
  },
  {
    section: 'Management',
    items: [
      { name: 'Beneficiaries', href: '/beneficiaries', icon: Users },
      { name: 'Offers & Pricing', href: '/offers', icon: Tag },
      { name: 'Memberships', href: '/memberships', icon: Crown },
      { name: 'Users & KYB', href: '/users', icon: UserCircle },
    ]
  },
  {
    section: 'Analytics',
    items: [
      { name: 'Revenue Analytics', href: '/revenue', icon: PieChart },
      { name: 'PG Charges', href: '/pg-charges', icon: CreditCard },
      { name: 'GST & Tax', href: '/gst', icon: FileText },
    ]
  },
  {
    section: 'Security',
    items: [
      { name: 'Risk & Flags', href: '/risk', icon: ShieldAlert },
      { name: 'Support', href: '/support', icon: Headphones },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Kredyble</h1>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <nav className="sidebar-nav">
          {navigationItems.map((group) => (
            <div key={group.section} className="sidebar-section">
              <h3 className="sidebar-section-title">{group.section}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={cn(
                        'sidebar-link',
                        isActive && 'active'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <button
          onClick={logout}
          data-testid="logout-btn"
          className="sidebar-link w-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
