import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  Command,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  IndianRupee,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Search,
  Settings,
  ShieldAlert,
  Truck,
  X,
} from 'lucide-react';
import {
  Company,
  DeliveryDispatch,
  InvoiceRecord,
  NotificationItem,
  PurchaseOrder,
  UserSession,
  WorkspaceRole,
} from '../../types/tradeproof';
import { formatINR } from '../../utils/formatters';
import { BrandLogo } from '../ui/BrandLogo';
import { Breadcrumbs, Drawer, Modal } from '../ui/DesignSystem';
import defaultAvatar from '../../assets/images/avatar_exec_india_1794640509958.jpg';

export type AppSectionId =
  | 'dashboard'
  | 'network'
  | 'purchase-orders'
  | 'deliveries'
  | 'invoices'
  | 'disputes'
  | 'payments'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'support'
  | 'blueprint';

interface AppShellProps {
  session: UserSession;
  companies: Company[];
  purchaseOrders: PurchaseOrder[];
  invoices: InvoiceRecord[];
  dispatches: DeliveryDispatch[];
  activeSection: AppSectionId;
  onSelectSection: (section: AppSectionId) => void;
  onSwitchCompany: (companyId: string) => void;
  onSwitchPerspective: (role: WorkspaceRole) => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onSignOut: () => void;
  onBackToPublicSite: () => void;
  children: React.ReactNode;
}

const SECTION_LABELS: Record<AppSectionId, string> = {
  dashboard: 'Dashboard',
  network: 'Business Network',
  'purchase-orders': 'Purchase Orders',
  deliveries: 'Deliveries & QR',
  invoices: 'Invoices & 3-Way Match',
  disputes: 'Disputes',
  payments: 'Payment Tracking',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
  settings: 'Settings',
  support: 'Platform Support',
  blueprint: 'API & Architecture',
};

export const AppShell: React.FC<AppShellProps> = ({
  session,
  companies,
  purchaseOrders,
  invoices,
  dispatches,
  activeSection,
  onSelectSection,
  onSwitchCompany,
  onSwitchPerspective,
  globalSearch,
  onGlobalSearchChange,
  notifications,
  onMarkNotificationRead,
  onSignOut,
  onBackToPublicSite,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeCompany = companies.find((c) => c.id === session.activeCompanyId) || companies[0];
  const activeMembership = session.memberships.find((m) => m.companyId === activeCompany.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: {
    id: AppSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: WorkspaceRole[];
    group: 'Operations' | 'Finance & Risk' | 'Workspace';
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['buyer', 'supplier', 'admin'], group: 'Operations' },
    { id: 'network', label: 'Business Network', icon: Network, roles: ['buyer', 'supplier', 'admin'], group: 'Operations' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText, roles: ['buyer', 'supplier'], group: 'Operations' },
    { id: 'deliveries', label: 'Deliveries & QR', icon: Truck, roles: ['buyer', 'supplier'], group: 'Operations' },
    { id: 'invoices', label: 'Invoices & Match', icon: FileSpreadsheet, roles: ['buyer', 'supplier'], group: 'Finance & Risk' },
    { id: 'disputes', label: 'Disputes & Evidence', icon: ShieldAlert, roles: ['buyer', 'supplier', 'admin'], group: 'Finance & Risk' },
    { id: 'payments', label: 'Payment Ledger', icon: IndianRupee, roles: ['buyer', 'supplier'], group: 'Finance & Risk' },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3, roles: ['buyer', 'supplier', 'admin'], group: 'Finance & Risk' },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['buyer', 'supplier', 'admin'], group: 'Workspace' },
    { id: 'settings', label: 'Settings & RBAC', icon: Settings, roles: ['buyer', 'supplier', 'admin'], group: 'Workspace' },
    { id: 'support', label: 'Help & Tickets', icon: HelpCircle, roles: ['buyer', 'supplier', 'admin'], group: 'Workspace' },
    { id: 'blueprint', label: 'API & Architecture', icon: Layers, roles: ['buyer', 'supplier', 'admin'], group: 'Workspace' },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(session.activePerspective));

  const q = cmdQuery.trim().toLowerCase();
  const cmdOrders = purchaseOrders.filter(
    (p) => !q || p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q),
  );
  const cmdInvoices = invoices.filter(
    (i) => !q || i.invoiceNumber.toLowerCase().includes(q) || i.poNumber.toLowerCase().includes(q),
  );
  const cmdDispatches = dispatches.filter(
    (d) => !q || d.dispatchNumber.toLowerCase().includes(q) || d.vehicleNumber.toLowerCase().includes(q),
  );

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBackToPublicSite}
          className="cursor-pointer focus-visible:outline-none"
        >
          <BrandLogo dark size="sm" />
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-Company Switcher */}
      <div className="p-3 border-b border-slate-800/80 relative">
        <button
          type="button"
          onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
          className="w-full flex items-center justify-between gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-left hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{activeCompany.name}</div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              {activeCompany.gstin} · {activeMembership?.role || 'Member'}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {companyMenuOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 z-30 rounded-lg border border-slate-700 bg-slate-900 shadow-xl py-1">
            <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400">
              Switch Legal Entity
            </div>
            {session.memberships.map((m) => {
              const comp = companies.find((c) => c.id === m.companyId);
              if (!comp) return null;
              const isSelected = comp.id === activeCompany.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    onSwitchCompany(comp.id);
                    setCompanyMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                    isSelected ? 'bg-slate-800/80 text-white' : 'text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{comp.name}</div>
                    <div className="text-[11px] text-slate-400">{m.role} · {comp.city}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Perspective Toggle */}
      <div className="px-3 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
          {(
            [
              ['buyer', 'Buyer'],
              ['supplier', 'Supplier'],
              ['admin', 'Admin'],
            ] as [WorkspaceRole, string][]
          ).map(([role, label]) => (
            <button
              key={role}
              type="button"
              onClick={() => onSwitchPerspective(role)}
              className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                session.activePerspective === role
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {(['Operations', 'Finance & Risk', 'Workspace'] as const).map((group) => {
          const items = visibleNav.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="space-y-0.5">
              <div className="px-3 pb-1 text-[11px] font-medium text-slate-500">{group}</div>
              {items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="font-mono text-[11px] text-amber-300 tabular-nums">{unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Quiet Commercial Environment Footer */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Sandbox Ledger</span>
        <button
          type="button"
          onClick={() => onSelectSection('blueprint')}
          className="text-slate-300 hover:text-white hover:underline cursor-pointer"
        >
          API Status
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 h-full">{renderSidebarContent()}</div>
          <div className="flex-1 bg-slate-950/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs
              items={[
                { label: activeCompany.name, onClick: () => onSelectSection('dashboard') },
                {
                  label:
                    session.activePerspective === 'buyer'
                      ? 'Buyer'
                      : session.activePerspective === 'supplier'
                        ? 'Supplier'
                        : 'Admin',
                },
                { label: SECTION_LABELS[activeSection] },
              ]}
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Command Palette Trigger + Filter */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => onGlobalSearchChange(e.target.value)}
                  placeholder="Filter active view..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600 inline-flex items-center gap-1.5 cursor-pointer"
                title="Quick Jump (Ctrl+K / Cmd+K)"
              >
                <Command className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">K</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotifDrawerOpen(true)}
              aria-label="Open notifications"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-sm bg-blue-700 text-white font-mono text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <img
                  src={session.avatarUrl || defaultAvatar}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                  alt={session.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-md object-cover bg-slate-200"
                />
                <span className="hidden sm:inline text-xs font-medium text-slate-800 whitespace-nowrap">
                  {session.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">{session.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{session.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection('settings');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Company & RBAC Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSection('blueprint');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    API & MongoDB Integration
                  </button>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="w-full px-4 py-2 text-left text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Command Palette (Ctrl/Cmd + K) */}
      <Modal
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        title="Quick Jump & Global Lookup"
        subtitle="Jump directly to Purchase Orders, Invoices, Dispatches, or Modules"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Type PO-2026-0841, SIF/26-27, vehicle number..."
              className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-700"
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto text-xs">
            {cmdOrders.slice(0, 3).map((po) => (
              <button
                key={po.id}
                type="button"
                onClick={() => {
                  onSelectSection('purchase-orders');
                  setCmdOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-left"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-900">{po.poNumber}</span>
                  <span className="text-slate-500 ml-2">{po.supplierName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-700">
                  <span>{formatINR(po.grandTotal)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>
            ))}

            {cmdInvoices.slice(0, 3).map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  onSelectSection('invoices');
                  setCmdOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-left"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-900">{inv.invoiceNumber}</span>
                  <span className="text-slate-500 ml-2">{inv.matchStatus}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-700">
                  <span>{formatINR(inv.invoicedTotal)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>
            ))}

            {cmdDispatches.slice(0, 2).map((dsp) => (
              <button
                key={dsp.id}
                type="button"
                onClick={() => {
                  onSelectSection('deliveries');
                  setCmdOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-left"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-900">{dsp.dispatchNumber}</span>
                  <span className="text-slate-500 ml-2">{dsp.vehicleNumber} · {dsp.status}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Notification Slide-Over Drawer */}
      <Drawer
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        title="Notification Center"
        subtitle="Transaction alerts, mismatch warnings, and payment reminders"
      >
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkNotificationRead(n.id)}
              className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                n.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-900">{n.title}</span>
                <span className="font-mono text-[11px] text-slate-500">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {n.category} · <span className="font-mono text-slate-700">{n.entityRef}</span>
                </span>
                {!n.read && <span className="text-blue-700 font-medium">Mark as read</span>}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setNotifDrawerOpen(false);
                onSelectSection('notifications');
              }}
              className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
            >
              Open Full Notification Center & Preferences →
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
