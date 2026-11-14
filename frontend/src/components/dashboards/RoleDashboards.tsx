import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileWarning,
  IndianRupee,
  PackageCheck,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import {
  AuditEntry,
  BusinessConnection,
  Company,
  DeliveryDispatch,
  DisputeRecord,
  InvoiceRecord,
  PaymentEntry,
  PurchaseOrder,
  WorkspaceRole,
} from '../../types/tradeproof';
import { formatCompactINR, formatDate, formatINR } from '../../utils/formatters';
import { Button, DataTable, StatusBadge } from '../ui/DesignSystem';
import { AppSectionId } from '../layout/AppShell';

interface RoleDashboardsProps {
  perspective: WorkspaceRole;
  activeCompany: Company;
  companies: Company[];
  connections: BusinessConnection[];
  purchaseOrders: PurchaseOrder[];
  dispatches: DeliveryDispatch[];
  invoices: InvoiceRecord[];
  disputes: DisputeRecord[];
  payments: PaymentEntry[];
  auditTrail: AuditEntry[];
  onNavigate: (section: AppSectionId) => void;
  onVerifyCompany?: (companyId: string) => void;
}

export const RoleDashboards: React.FC<RoleDashboardsProps> = ({
  perspective,
  activeCompany,
  companies,
  connections,
  purchaseOrders,
  dispatches,
  invoices,
  disputes,
  payments,
  auditTrail,
  onNavigate,
  onVerifyCompany,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const totalPoValue = purchaseOrders.reduce((acc, po) => acc + po.grandTotal, 0);
  const pendingSupplierConfirmation = purchaseOrders.filter(
    (p) => p.status === 'Pending Supplier Confirmation',
  ).length;
  const deliveriesExpected = dispatches.filter(
    (d) => d.status === 'In Transit' || d.status === 'Scheduled',
  ).length;
  const receivedDeliveries = dispatches.filter(
    (d) =>
      d.status === 'Verified & Accepted' ||
      d.status === 'Partial Delivery Accepted' ||
      d.status === 'Discrepancy Reported',
  ).length;
  const openDisputes = disputes.filter((d) => d.status !== 'Resolved').length;
  const outstandingPayables = payments.reduce((acc, p) => acc + p.balanceRemaining, 0);
  const overduePayments = payments.filter((p) => p.status === 'Overdue').length;
  const mismatchedInvoices = invoices.filter((i) => i.matchStatus !== 'Matched (3-Way Verified)').length;

  const monthlySeries = [
    { month: 'Jun', poLakhs: 18.4, settledLakhs: 16.9 },
    { month: 'Jul', poLakhs: 22.1, settledLakhs: 20.5 },
    { month: 'Aug', poLakhs: 19.8, settledLakhs: 19.2 },
    { month: 'Sep', poLakhs: 27.6, settledLakhs: 25.0 },
    { month: 'Oct', poLakhs: 24.3, settledLakhs: 21.8 },
    { month: 'Nov', poLakhs: Number((totalPoValue / 100000).toFixed(1)), settledLakhs: 14.2 },
  ];
  const maxBar = Math.max(...monthlySeries.map((m) => m.poLakhs), 30);

  if (perspective === 'buyer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
              Procurement & Settlement Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeCompany.name} · GSTIN {activeCompany.gstin} · {activeCompany.industry}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('deliveries')}>
              Scan Gate QR
            </Button>
            <Button size="sm" onClick={() => onNavigate('purchase-orders')}>
              Create Purchase Order
            </Button>
          </div>
        </div>

        {/* Action Required Priority Strip */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-900">Action Required Across Lifecycle</span>
            <span className="text-[11px] font-mono text-slate-500">Live Queue</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/40 px-3.5 py-2.5 text-left hover:bg-red-50 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-red-900 truncate">
                  {mismatchedInvoices} Invoices Flagged by 3-Way Match
                </div>
                <div className="text-[11px] text-red-700">₹42,480 shortage variance held</div>
              </div>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('payments')}
              className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/40 px-3.5 py-2.5 text-left hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-amber-900 truncate">
                  {overduePayments} Overdue Ledger Schedule
                </div>
                <div className="text-[11px] text-amber-800">Record bank UTR confirmation</div>
              </div>
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('deliveries')}
              className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/40 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-blue-950 truncate">
                  {deliveriesExpected} Shipment Awaiting Gate QR Scan
                </div>
                <div className="text-[11px] text-blue-800">DSP-2026-4429 · 18 MT TMT Rebar</div>
              </div>
              <Truck className="w-4 h-4 text-blue-700 shrink-0" />
            </button>
          </div>
        </div>

        {/* Buyer KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Active Purchase Orders',
              value: `${purchaseOrders.length}`,
              sub: `${formatCompactINR(totalPoValue)} gross value`,
              icon: PackageCheck,
              onClick: () => onNavigate('purchase-orders'),
            },
            {
              label: 'Awaiting Confirmation',
              value: `${pendingSupplierConfirmation}`,
              sub: `${invoices.filter((i) => i.status === 'Submitted' || i.status === 'Disputed').length} invoices under review`,
              icon: Clock,
              onClick: () => onNavigate('invoices'),
            },
            {
              label: 'In Transit / Gate Verified',
              value: `${deliveriesExpected} / ${receivedDeliveries}`,
              sub: 'E-Way Bill + QR bound',
              icon: Truck,
              onClick: () => onNavigate('deliveries'),
            },
            {
              label: 'Open Disputes & Payables',
              value: `${openDisputes} Open`,
              sub: `${formatCompactINR(outstandingPayables)} net payable`,
              icon: ShieldAlert,
              onClick: () => onNavigate('payments'),
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={kpi.onClick}
                className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="font-display text-2xl font-bold text-slate-950 mt-2 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 tabular-nums truncate">{kpi.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Transaction Analytics + Upcoming Payments */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Procurement Volume vs Settled Value (₹ Lakhs)
                </h2>
                <p className="text-xs text-slate-500">
                  {hoveredMonth
                    ? (() => {
                        const m = monthlySeries.find((x) => x.month === hoveredMonth);
                        return m
                          ? `${m.month}: ₹${m.poLakhs}L Ordered · ₹${m.settledLakhs}L Verified & Settled`
                          : '';
                      })()
                    : 'Hover a month column to inspect verified settlement ratio'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('reports')}>
                Full Analytics
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-4 border-b border-slate-100">
              {monthlySeries.map((bar) => (
                <div
                  key={bar.month}
                  onMouseEnter={() => setHoveredMonth(bar.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    <div
                      style={{ height: `${Math.round((bar.poLakhs / maxBar) * 100)}%` }}
                      className={`w-4 rounded-t-sm transition-opacity ${
                        hoveredMonth && hoveredMonth !== bar.month ? 'bg-slate-400' : 'bg-slate-900'
                      }`}
                    />
                    <div
                      style={{ height: `${Math.round((bar.settledLakhs / maxBar) * 100)}%` }}
                      className={`w-4 rounded-t-sm transition-opacity ${
                        hoveredMonth && hoveredMonth !== bar.month ? 'bg-blue-300' : 'bg-blue-600'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block" /> PO Volume
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> Verified & Settled
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">Upcoming & Overdue Payables</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('payments')}
                  className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                >
                  Open Ledger
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <div key={pay.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {pay.payeeCompany}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {pay.invoiceNumber} · Due {formatDate(pay.dueDate)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                        {formatINR(pay.balanceRemaining)}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={pay.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions + Supplier Activity */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Recent Purchase Orders</h2>
              <button
                type="button"
                onClick={() => onNavigate('purchase-orders')}
                className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
              >
                All Purchase Orders →
              </button>
            </div>
            <DataTable
              data={purchaseOrders}
              keyExtractor={(po) => po.id}
              onRowClick={() => onNavigate('purchase-orders')}
              columns={[
                {
                  key: 'po',
                  header: 'PO Number',
                  render: (po) => <span className="font-mono font-semibold text-slate-900">{po.poNumber}</span>,
                },
                {
                  key: 'supplier',
                  header: 'Supplier',
                  render: (po) => <span className="font-medium text-slate-800">{po.supplierName}</span>,
                },
                {
                  key: 'eta',
                  header: 'Expected Delivery',
                  render: (po) => <span className="text-xs text-slate-600">{formatDate(po.expectedDeliveryDate)}</span>,
                },
                {
                  key: 'amount',
                  header: 'Total (INR)',
                  align: 'right',
                  render: (po) => <span className="font-mono font-medium text-slate-900">{formatINR(po.grandTotal)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (po) => <StatusBadge status={po.status} />,
                },
              ]}
            />
          </div>

          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Audit Activity</h2>
            <div className="space-y-3.5">
              {auditTrail.slice(0, 5).map((entry) => (
                <div key={entry.id} className="pb-3 border-b border-slate-100 last:border-none last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">{entry.entityId}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">{entry.action}</div>
                  <p className="text-xs text-slate-600 mt-0.5">{entry.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (perspective === 'supplier') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
              Supplier Fulfillment & Receivables Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeCompany.name} · Incoming Buyer POs, QR Dispatches & AR Reconciliation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('invoices')}>
              Upload Tax Invoice
            </Button>
            <Button size="sm" onClick={() => onNavigate('deliveries')}>
              Create Dispatch & QR
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Incoming Purchase Orders',
              value: `${purchaseOrders.length}`,
              sub: `${pendingSupplierConfirmation} awaiting confirmation`,
              icon: PackageCheck,
            },
            {
              label: 'Active Orders & Pending Dispatches',
              value: `${purchaseOrders.filter((p) => p.status === 'Confirmed').length}`,
              sub: `${dispatches.filter((d) => d.status === 'In Transit').length} shipments in transit`,
              icon: Truck,
            },
            {
              label: 'Submitted Invoices',
              value: `${invoices.length}`,
              sub: `${mismatchedInvoices} require attention`,
              icon: FileWarning,
            },
            {
              label: 'Outstanding Receivables',
              value: formatCompactINR(outstandingPayables),
              sub: 'Tracked via buyer UTR confirmation',
              icon: IndianRupee,
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{kpi.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="font-display text-2xl font-bold text-slate-950 mt-2 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Incoming Orders Awaiting Confirmation or Dispatch
            </h2>
            <DataTable
              data={purchaseOrders}
              keyExtractor={(po) => po.id}
              onRowClick={() => onNavigate('purchase-orders')}
              columns={[
                {
                  key: 'po',
                  header: 'PO Ref',
                  render: (po) => <span className="font-mono font-semibold text-slate-900">{po.poNumber}</span>,
                },
                {
                  key: 'buyer',
                  header: 'Buyer Company',
                  render: (po) => <span className="font-medium text-slate-800">{po.buyerName}</span>,
                },
                {
                  key: 'terms',
                  header: 'Payment Terms',
                  render: (po) => <span className="text-xs text-slate-600">{po.paymentTerms}</span>,
                },
                {
                  key: 'total',
                  header: 'Order Value',
                  align: 'right',
                  render: (po) => <span className="font-mono font-medium text-slate-900">{formatINR(po.grandTotal)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (po) => <StatusBadge status={po.status} />,
                },
              ]}
            />
          </div>

          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Buyer & Settlement Feed</h2>
            {disputes.map((d) => (
              <div key={d.id} className="border border-red-200 bg-red-50/40 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-red-900">{d.disputeNumber}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-red-800">{d.category}: {formatINR(d.claimedImpactInr)} impact</p>
                <button
                  type="button"
                  onClick={() => onNavigate('disputes')}
                  className="text-blue-700 font-medium hover:underline cursor-pointer"
                >
                  Respond with Evidence / Credit Note →
                </button>
              </div>
            ))}
            <div className="divide-y divide-slate-100">
              {dispatches.map((dsp) => (
                <div key={dsp.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono font-medium text-slate-900">{dsp.dispatchNumber}</div>
                    <div className="text-slate-500">{dsp.transporterName} · {dsp.vehicleNumber}</div>
                  </div>
                  <StatusBadge status={dsp.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLATFORM ADMIN DASHBOARD
  const totalUsers = companies.reduce((acc, c) => acc + c.memberCount, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Platform Admin & Governance Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Entity KYB verification, network health, subscription distribution, and audit oversight
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onNavigate('blueprint')}>
          API & MongoDB Architecture
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registered Companies', value: `${companies.length}`, sub: `${companies.filter((c) => c.verificationStatus === 'Verified').length} GSTIN Verified` },
          { label: 'Registered Platform Users', value: `${totalUsers}`, sub: 'Across 5 RBAC role tiers' },
          { label: 'Active Business Connections', value: `${connections.filter((c) => c.status === 'Connected').length}`, sub: 'Mutual buyer-supplier links' },
          { label: 'Active Transactions & Disputes', value: `${purchaseOrders.length} / ${openDisputes}`, sub: '100% audit trail logged' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">{kpi.label}</div>
            <div className="font-display text-2xl font-bold text-slate-950 mt-2 tabular-nums">
              {kpi.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Company Verification Queue & Subscription Tiers
          </h2>
          <DataTable
            data={companies}
            keyExtractor={(c) => c.id}
            columns={[
              {
                key: 'name',
                header: 'Company & GSTIN',
                render: (c) => (
                  <div>
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">{c.gstin} · {c.city}</div>
                  </div>
                ),
              },
              {
                key: 'industry',
                header: 'Industry',
                render: (c) => <span className="text-xs text-slate-700">{c.industry}</span>,
              },
              {
                key: 'plan',
                header: 'Subscription',
                render: (c) => <span className="text-xs font-medium text-slate-800">{c.plan}</span>,
              },
              {
                key: 'status',
                header: 'Verification',
                render: (c) => <StatusBadge status={c.verificationStatus} />,
              },
              {
                key: 'action',
                header: 'Admin Action',
                align: 'right',
                render: (c) =>
                  c.verificationStatus !== 'Verified' && onVerifyCompany ? (
                    <Button size="sm" variant="outline" onClick={() => onVerifyCompany(c.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verify GSTIN
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">Approved</span>
                  ),
              },
            ]}
          />
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Subscription Distribution</h2>
          {(['Enterprise Hub', 'Growth Business', 'Starter MSME'] as const).map((tier) => {
            const count = companies.filter((c) => c.plan === tier).length;
            const pct = Math.round((count / Math.max(1, companies.length)) * 100);
            return (
              <div key={tier} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800">{tier}</span>
                  <span className="font-mono text-slate-600 tabular-nums">{count} orgs ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-700 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">Platform Audit Stream</h3>
            <div className="space-y-2.5 text-xs">
              {auditTrail.slice(0, 3).map((a) => (
                <div key={a.id} className="text-slate-600">
                  <span className="font-mono text-slate-900">{a.entityId}</span> · {a.action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
