'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/lv/context';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Palette, CreditCard, Truck, Megaphone,
  BarChart3, Settings, FileText, ChevronDown, ChevronRight, Plus, List, Tag, Grid,
  UserCheck, Star, Gift, Sliders, Type, Layout, Code, Wallet, ReceiptText, RotateCcw,
  Calculator, MapPin, Building2, DollarSign, Percent, Mail, Search, Link2, Users2,
  TrendingUp, Activity, Users as UsersIcon, Download, Store, Shield, Bell,
  Puzzle, Database, Key, ShoppingCart, AlertTriangle, Layers, ToggleLeft
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number | string;
  children?: NavItem[];
}

const navConfig: { section: string; items: NavItem[] }[] = [
  {
    section: '',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' }
    ]
  },
  {
    section: 'STORE',
    items: [
      {
        label: 'Orders', icon: ShoppingBag, badge: 7,
        children: [
          { label: 'All Orders', icon: List, href: '/orders' },
          { label: 'Pending', icon: AlertTriangle, href: '/orders?status=pending', badge: 3 },
          { label: 'Processing', icon: Activity, href: '/orders?status=processing', badge: 2 },
          { label: 'Shipped', icon: Truck, href: '/orders?status=shipped', badge: 2 },
          { label: 'Delivered', icon: ShoppingBag, href: '/orders?status=delivered' },
          { label: 'Returns', icon: RotateCcw, href: '/orders?status=returned' },
          { label: 'Abandoned Carts', icon: ShoppingCart, href: '/orders?status=abandoned' },
        ]
      },
      {
        label: 'Products', icon: Package,
        children: [
          { label: 'All Products', icon: List, href: '/products' },
          { label: 'Add New Product', icon: Plus, href: '/products/new' },
          { label: 'Categories', icon: Tag, href: '/products?tab=categories' },
          { label: 'Collections', icon: Layers, href: '/products?tab=collections' },
          { label: 'Inventory Manager', icon: ToggleLeft, href: '/products?tab=inventory' },
          { label: 'Bulk Import / Export', icon: Download, href: '/products?tab=bulk' },
        ]
      },
      {
        label: 'Customers', icon: Users,
        children: [
          { label: 'All Customers', icon: List, href: '/customers' },
          { label: 'Customer Groups', icon: Users2, href: '/customers?tab=groups' },
          { label: 'Reviews & Ratings', icon: Star, href: '/customers?tab=reviews' },
          { label: 'Loyalty Points', icon: Gift, href: '/customers?tab=loyalty' },
        ]
      },
    ]
  },
  {
    section: 'DESIGN',
    items: [
      {
        label: 'Theme Editor', icon: Palette,
        children: [
          { label: 'Live Customizer', icon: Sliders, href: '/theme' },
          { label: 'Colors & Fonts', icon: Type, href: '/theme?tab=colors' },
          { label: 'Layout & Sections', icon: Layout, href: '/theme?tab=layout' },
          { label: 'Header & Footer', icon: Layers, href: '/theme?tab=header' },
          { label: 'Custom Code', icon: Code, href: '/theme?tab=code' },
        ]
      },
    ]
  },
  {
    section: 'FINANCES',
    items: [
      {
        label: 'Payments', icon: CreditCard,
        children: [
          { label: 'Payment Gateways', icon: Wallet, href: '/payments' },
          { label: 'Transaction History', icon: ReceiptText, href: '/payments?tab=transactions' },
          { label: 'Refunds', icon: RotateCcw, href: '/payments?tab=refunds' },
          { label: 'Tax & GST Settings', icon: Calculator, href: '/payments?tab=tax' },
        ]
      },
      {
        label: 'Shipping', icon: Truck,
        children: [
          { label: 'Shipping Zones', icon: MapPin, href: '/shipping' },
          { label: 'Delivery Partners', icon: Building2, href: '/shipping?tab=partners' },
          { label: 'COD Settings', icon: DollarSign, href: '/shipping?tab=cod' },
          { label: 'Rate Calculator', icon: Calculator, href: '/shipping?tab=rates' },
        ]
      },
    ]
  },
  {
    section: 'MARKETING',
    items: [
      {
        label: 'Marketing', icon: Megaphone,
        children: [
          { label: 'Discount Codes', icon: Percent, href: '/marketing' },
          { label: 'Email Campaigns', icon: Mail, href: '/marketing?tab=email' },
          { label: 'SEO Manager', icon: Search, href: '/marketing?tab=seo' },
          { label: 'Referral Program', icon: Link2, href: '/marketing?tab=referral' },
          { label: 'Pop-up Manager', icon: Megaphone, href: '/marketing?tab=popups' },
        ]
      },
      {
        label: 'Analytics', icon: BarChart3,
        children: [
          { label: 'Sales Overview', icon: TrendingUp, href: '/analytics' },
          { label: 'Traffic & Behavior', icon: Activity, href: '/analytics?tab=traffic' },
          { label: 'Conversion Funnel', icon: BarChart3, href: '/analytics?tab=funnel' },
          { label: 'Customer Insights', icon: UsersIcon, href: '/analytics?tab=customers' },
          { label: 'Export Reports', icon: Download, href: '/analytics?tab=export' },
        ]
      },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      {
        label: 'Settings', icon: Settings,
        children: [
          { label: 'Store Details', icon: Store, href: '/settings' },
          { label: 'Team & Permissions', icon: UserCheck, href: '/settings?tab=team' },
          { label: 'Notifications', icon: Bell, href: '/settings?tab=notifications' },
          { label: 'Security & Sessions', icon: Shield, href: '/settings?tab=security' },
          { label: 'Integrations', icon: Puzzle, href: '/settings?tab=integrations' },
          { label: 'Data & Backups', icon: Database, href: '/settings?tab=data' },
          { label: 'API Keys', icon: Key, href: '/settings?tab=api' },
        ]
      },
      { label: 'Audit Log', icon: FileText, href: '/audit' },
    ]
  }
];

export default function Sidebar() {
  const { state } = useApp();
  const pathname = usePathname();
  const collapsed = state.sidebarCollapsed;
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    'Orders': pathname?.startsWith('/orders') || false,
    'Products': pathname?.startsWith('/products') || false,
    'Customers': pathname?.startsWith('/customers') || false,
    'Theme Editor': pathname?.startsWith('/theme') || false,
    'Payments': pathname?.startsWith('/payments') || false,
    'Shipping': pathname?.startsWith('/shipping') || false,
    'Marketing': pathname?.startsWith('/marketing') || false,
    'Analytics': pathname?.startsWith('/analytics') || false,
    'Settings': pathname?.startsWith('/settings') || false,
  });

  const isActive = (href?: string) => {
    if (!href) return false;
    const base = href.split('?')[0];
    return pathname === base || pathname?.startsWith(base + '/');
  };

  const toggleItem = (label: string) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`lv-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="brand-cinzel" style={{ fontSize: 18 }}>LV</span>
          </div>
        ) : (
          <div>
            <div className="brand-cinzel" style={{ fontSize: 20 }}>LUSSOVOGUE</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.2em', marginTop: 2 }}>ADMIN PANEL</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px' }}>
        {navConfig.map(({ section, items }) => (
          <div key={section || 'root'}>
            {section && !collapsed && (
              <div className="nav-section-label">{section}</div>
            )}
            {items.map(item => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className={`nav-item ${item.children.some(c => isActive(c.href)) ? 'active' : ''}`}
                      onClick={() => !collapsed && toggleItem(item.label)}
                      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon size={18} style={{ flexShrink: 0 }} />
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.label === 'Theme Editor' && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--gold)', color: '#0A0A0A', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em' }}>PREMIUM</span>
                          )}
                          {typeof item.badge === 'number' && (
                            <span className="nav-count-badge">{item.badge}</span>
                          )}
                          {expandedItems[item.label]
                            ? <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                            : <ChevronRight size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                          }
                        </>
                      )}
                    </button>
                    {!collapsed && expandedItems[item.label] && (
                      <div style={{ paddingLeft: 16, marginBottom: 4 }}>
                        {item.children.map(child => (
                          <Link key={child.label} href={child.href || '#'}>
                            <div className={`nav-item ${isActive(child.href) ? 'active' : ''}`}
                              style={{ fontSize: 13, padding: '7px 12px' }}>
                              <child.icon size={14} style={{ flexShrink: 0 }} />
                              <span style={{ flex: 1 }}>{child.label}</span>
                              {typeof child.badge === 'number' && (
                                <span className="nav-count-badge">{child.badge}</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href || '#'}>
                    <div className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                      title={collapsed ? item.label : undefined}>
                      <item.icon size={18} style={{ flexShrink: 0 }} />
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {typeof item.badge === 'number' && (
                            <span className="nav-count-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            LussoVogue Admin v2.0<br />
            <span style={{ color: 'var(--success)', fontSize: 11 }}>● All systems operational</span>
          </div>
        </div>
      )}
    </aside>
  );
}

