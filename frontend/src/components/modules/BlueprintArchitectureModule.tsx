import React, { useState } from 'react';
import { Database, Lock, Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
  Tabs,
} from '../ui/DesignSystem';

export const BlueprintArchitectureModule: React.FC = () => {
  const [tab, setTab] = useState('strategy');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [demoState, setDemoState] = useState<'populated' | 'loading' | 'empty' | 'error' | 'restricted'>('populated');
  const [selectedFlow, setSelectedFlow] = useState(0);

  const flows = [
    {
      title: 'Flow 1: Onboarding & Order Commitment',
      steps: 'Register → Create Company (GSTIN) → Invite Supplier → Supplier Accepts → Buyer Creates PO → Supplier Confirms',
      start: 'Signup / Company Creation',
      action: 'Buyer submits PO with industry fields; Supplier clicks Confirm Purchase Order',
      next: 'PO locked at Version 1; Dispatch unlocked',
      success: 'PO status moves to Confirmed; immutable audit entry written',
      error: 'Invalid 15-digit GSTIN or missing required industry custom field',
      empty: 'No connected suppliers yet → CTA prompts Business Network invitation',
      loading: 'Skeleton table row during GSTN verification lookup',
      permission: 'Only Owner & Procurement Manager can issue POs; Viewer is read-only',
    },
    {
      title: 'Flow 2: QR Dispatch & Gate Verification',
      steps: 'Supplier Dispatches Goods → QR Generated → Buyer Scans QR → Verifies Qty → Accepts Full or Reports Mismatch',
      start: 'Deliveries & QR (Supplier View)',
      action: 'Supplier binds E-Way Bill; Warehouse Lead scans QR and enters physical count',
      next: 'GRN Verified or Partial Delivery Discrepancy logged',
      success: 'Verified count updates PO line items and feeds 3-way invoice matcher',
      error: 'Unrecognized QR payload checksum or physical count > dispatched count',
      empty: 'No active dispatches in transit → CTA to Create Dispatch',
      loading: 'QR matrix generation & POD file upload progress indicator',
      permission: 'Only Warehouse Lead & Owner can finalize gate quantity receipts',
    },
    {
      title: 'Flow 3: Automated 3-Way Invoice Matching',
      steps: 'Supplier Uploads Invoice → System Compares PO, Delivery & Invoice → Buyer Approves or Raises Dispute',
      start: 'Invoices & 3-Way Match',
      action: 'Supplier uploads tax invoice; system computes PO vs GRN vs Invoice delta',
      next: 'Approved for Payment (if matched) or Variance Flagged',
      success: 'Matched (3-Way Verified) enters Accounts Payable schedule',
      error: 'Quantity or Amount Mismatch highlights exact INR variance',
      empty: 'No invoices submitted for PO yet',
      loading: '3-way matching engine comparison state',
      permission: 'Only Finance Controller & Owner can approve invoices for payment',
    },
    {
      title: 'Flow 4: Evidence-Preserved Dispute Resolution',
      steps: 'Dispute Opened → Evidence Submitted → Comments Exchanged → Resolution Recorded',
      start: 'Dispute Management',
      action: 'Upload weighbridge/photo proof, exchange thread messages, record Credit Note/Replacement',
      next: 'Dispute Resolved & linked invoice unblocked',
      success: 'SHA-256 stamped evidence preserved permanently in audit vault',
      error: 'Missing resolution summary before closing dispute',
      empty: 'Zero open disputes across active connections',
      loading: 'Evidence attachment hash verification state',
      permission: 'External companies can only view disputes where they are buyer or supplier',
    },
    {
      title: 'Flow 5: Payment Due & UTR Ledger Confirmation',
      steps: 'Payment Becomes Due → Reminder Appears → UTR Payment Recorded → Dual-Party Status Synced',
      start: 'Payment Tracking (AP/AR)',
      action: 'Finance Controller logs NEFT/RTGS/UPI UTR; Supplier confirms receipt',
      next: 'Confirmed Settled or Partially Paid balance updated',
      success: 'Transaction lifecycle closes cleanly with full payment history',
      error: 'Payment amount exceeds remaining invoice balance or missing UTR',
      empty: 'No scheduled payables due this cycle',
      loading: 'Ledger history reconciliation skeleton',
      permission: 'Warehouse Lead has zero access to payment ledger mutations',
    },
    {
      title: 'Flow 6: Team Members & RBAC Delegation',
      steps: 'Company Owner Invites Employees → Assigns Roles → Employees Access Permitted Modules',
      start: 'Settings → Members & Roles',
      action: 'Owner invites employee and assigns Procurement, Warehouse, Finance, or Viewer role',
      next: 'Employee joins company workspace with scoped module permissions',
      success: 'Role permissions enforced across every UI action and FastAPI endpoint',
      error: 'Duplicate corporate email or non-Owner attempting role elevation',
      empty: 'Single-owner workspace → prompt to invite Warehouse & Finance leads',
      loading: 'RBAC policy matrix loading state',
      permission: 'Strictly restricted to Company Owner',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
          TradeProof Product Architecture, Blueprint & MongoDB Stack
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete 15-deliverable SaaS specification: IA, Sitemap, Design System States, User Flows, Responsive Layouts, and FastAPI + MongoDB Atlas integration plan.
        </p>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'strategy', label: '1. Strategy, IA & Sitemap' },
          { id: 'flows', label: '2. User Flows (1–6)' },
          { id: 'states', label: '3. Design System & States' },
          { id: 'responsive', label: '4. Mobile & Responsive Spec' },
          { id: 'backend', label: '5. FastAPI & MongoDB Atlas' },
        ]}
      />

      {tab === 'strategy' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-950">Product Design Strategy & Principles</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              TradeProof unifies procurement, warehouse gate operations, finance reconciliation, and dispute governance under one tenant-isolated workspace. Every state change requires explicit actor attribution and prevents silent edits on confirmed commitments.
            </p>
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">Information Architecture & Sitemap</div>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li>/public → Landing · Product · Features · Industries · Pricing · About · Contact</li>
                <li>/auth → Sign Up · Login · Email OTP · Forgot/Reset · Create/Join Company · Wizard</li>
                <li>/app/dashboard → Buyer Workspace · Supplier Workspace · Platform Admin</li>
                <li>/app/network → Directory · Invitations · Connected Partners · KYB Profile</li>
                <li>/app/orders → PO List · Dynamic Industry Form · Versioned Amendments · History</li>
                <li>/app/deliveries → Dispatch & E-Way Bill · QR Generator · Gate Scanner · Partial GRN</li>
                <li>/app/invoices → Tax Invoice Upload · 3-Way Match Engine · Approve / Reject</li>
                <li>/app/disputes → Claim Filing · SHA-256 Evidence Vault · Thread · Resolution</li>
                <li>/app/payments → AP/AR Schedule · Partial Payments · UTR Ledger Confirmation</li>
                <li>/app/admin-ops → Reports (CSV) · Notifications · Settings (RBAC/Schema) · Support</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-950">Component Inventory & Implementation Plan</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {[
                ['Core Primitives', 'Button, Input, Select, Textarea, SearchInput, StatusBadge'],
                ['Overlays & Containers', 'Modal, Drawer, ConfirmDialog, ToastContainer, Tabs'],
                ['Data Display', 'DataTable (Desktop Grid + Mobile Card Stack), Pagination, Breadcrumbs'],
                ['Domain Widgets', 'QrCodeSvg Matrix, 3-Way Match Panel, Dynamic Industry Schema'],
                ['State Handlers', 'EmptyState, LoadingSkeleton, ErrorState, Permission Guard'],
                ['Screen Rollout', 'Phase 1: Auth/Network → Phase 2: PO/QR → Phase 3: Match/Dispute/UTR'],
              ].map(([title, items]) => (
                <div key={title} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-semibold text-slate-900">{title}</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">{items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'flows' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            {flows.map((f, idx) => (
              <button
                key={f.title}
                type="button"
                onClick={() => setSelectedFlow(idx)}
                className={`w-full text-left rounded-xl border p-3.5 text-xs transition-colors cursor-pointer ${
                  selectedFlow === idx
                    ? 'border-blue-700 bg-blue-50/40 text-slate-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">{f.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{f.steps}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">{flows[selectedFlow].title}</h2>
              <p className="font-mono text-xs text-blue-700 mt-1">{flows[selectedFlow].steps}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {[
                ['Starting Screen', flows[selectedFlow].start],
                ['User Action', flows[selectedFlow].action],
                ['Next Screen', flows[selectedFlow].next],
                ['Success State', flows[selectedFlow].success],
                ['Error State', flows[selectedFlow].error],
                ['Empty State', flows[selectedFlow].empty],
                ['Loading State', flows[selectedFlow].loading],
                ['Permission Restriction', flows[selectedFlow].permission],
              ].map(([k, v]) => (
                <div key={k} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-semibold text-slate-900">{k}</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'states' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Interactive UI State Completeness Preview
                </h2>
                <p className="text-xs text-slate-500">
                  Every TradeProof module supports populated, loading, empty, error, and RBAC-restricted states.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['populated', 'Populated'],
                    ['loading', 'Loading Skeleton'],
                    ['empty', 'Empty State'],
                    ['error', 'Error State'],
                    ['restricted', 'Permission Restricted'],
                  ] as const
                ).map(([id, label]) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={demoState === id ? 'primary' : 'outline'}
                    onClick={() => setDemoState(id)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {demoState === 'populated' && (
              <div className="border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">PO-2026-0841</div>
                  <div className="text-xs text-slate-500">Shakti Industrial Fasteners · ₹8,93,850.00</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="Confirmed" />
                  <StatusBadge status="Partially Delivered" />
                  <StatusBadge status="Quantity Mismatch" />
                </div>
              </div>
            )}
            {demoState === 'loading' && <LoadingSkeleton rows={3} />}
            {demoState === 'empty' && (
              <EmptyState
                title="No purchase orders match this filter"
                description="Create a new industry-configured Purchase Order or clear active status filters."
                actionLabel="Reset Filters"
                onAction={() => setDemoState('populated')}
              />
            )}
            {demoState === 'error' && (
              <ErrorState
                message="FastAPI settlement service returned HTTP 503 while verifying GSTIN."
                onRetry={() => setDemoState('populated')}
              />
            )}
            {demoState === 'restricted' && (
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex items-start gap-3">
                <Lock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Permission Restricted (Finance Controller Required)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Your current role (Warehouse Lead) can scan QR dispatches and upload gate proofs, but cannot approve invoices or record bank UTR payments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'responsive' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Desktop, Tablet & Mobile Layout Transformation
              </h2>
              <p className="text-xs text-slate-500">
                Tables convert to structured mobile card stacks; navigation collapses into a slide-over drawer.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={viewportMode === 'desktop' ? 'primary' : 'outline'}
                onClick={() => setViewportMode('desktop')}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </Button>
              <Button
                size="sm"
                variant={viewportMode === 'tablet' ? 'primary' : 'outline'}
                onClick={() => setViewportMode('tablet')}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </Button>
              <Button
                size="sm"
                variant={viewportMode === 'mobile' ? 'primary' : 'outline'}
                onClick={() => setViewportMode('mobile')}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </Button>
            </div>
          </div>

          <div
            className={`mx-auto border border-slate-300 rounded-xl bg-slate-50 p-4 transition-all ${
              viewportMode === 'mobile'
                ? 'max-w-[375px]'
                : viewportMode === 'tablet'
                  ? 'max-w-[768px]'
                  : 'w-full'
            }`}
          >
            <div className="text-[11px] font-mono text-slate-500 mb-3">
              Simulated Viewport: {viewportMode.toUpperCase()}
            </div>
            {viewportMode === 'mobile' ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono font-semibold text-slate-900">PO-2026-0841</span>
                    <StatusBadge status="Partially Delivered" />
                  </div>
                  <div className="text-slate-600">Shakti Industrial Fasteners</div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-mono">
                    <span className="text-slate-500">Grand Total</span>
                    <span className="font-semibold text-slate-900">₹8,93,850.00</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  Scan Gate QR (44px Touch Target)
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4 grid grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-500">PO Number</div>
                  <div className="font-mono font-semibold text-slate-900 mt-1">PO-2026-0841</div>
                </div>
                <div>
                  <div className="text-slate-500">Supplier</div>
                  <div className="font-medium text-slate-900 mt-1">Shakti Fasteners</div>
                </div>
                <div>
                  <div className="text-slate-500">Total (INR)</div>
                  <div className="font-mono font-semibold text-slate-900 mt-1">₹8,93,850.00</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="mt-1">
                    <StatusBadge status="Partially Delivered" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'backend' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-slate-950">
                FastAPI + MongoDB Atlas Production Integration Architecture
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This frontend prototype runs with clearly marked sample data. Connect it to your Python FastAPI backend and MongoDB Atlas 3-node replica set (`atlas-136z7r-shard-0`) via environment variables—never store database passwords inside client-side React bundles.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-900">1. Environment Configuration (.env)</div>
              <pre className="font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
{`# Server-side FastAPI .env (never expose to browser)
MONGODB_URI="mongodb://<db_username>:<db_password>@ac-dh5qxdk-shard-00-00.qjtkz6v.mongodb.net:27017,ac-dh5qxdk-shard-00-01.qjtkz6v.mongodb.net:27017,ac-dh5qxdk-shard-00-02.qjtkz6v.mongodb.net:27017/?ssl=true&replicaSet=atlas-136z7r-shard-0&authSource=admin"
MONGODB_DB_NAME="tradeproof_prod"`}
              </pre>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-900">2. MongoDB Collections & FastAPI Endpoints</div>
              <pre className="font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
{`Collections:
  - companies, memberships, connections
  - purchase_orders, po_amendments
  - dispatches, grn_verifications
  - invoices, disputes, payment_ledger
  - audit_trail (append-only indexed)

FastAPI Motor Async Client:
  client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
  db = client[os.environ["MONGODB_DB_NAME"]]`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
