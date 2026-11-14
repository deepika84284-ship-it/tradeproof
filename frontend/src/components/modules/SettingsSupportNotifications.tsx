import React, { useState } from 'react';
import { Bell, Check, HelpCircle, Lock, Plus, Send, Shield, UserPlus } from 'lucide-react';
import { INDUSTRY_FIELD_CONFIGS } from '../../data/mockData';
import {
  Company,
  CompanyMember,
  IndustryFieldSchema,
  IndustryType,
  MemberRole,
  NotificationItem,
  SupportTicket,
  UserSession,
} from '../../types/tradeproof';
import {
  Button,
  DataTable,
  Input,
  Modal,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
} from '../ui/DesignSystem';

/* ---------------- NOTIFICATIONS MODULE ---------------- */
export const NotificationsModule: React.FC<{
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}> = ({ notifications, onMarkAllRead, onMarkRead }) => {
  const [tab, setTab] = useState('feed');
  const [prefs, setPrefs] = useState({
    poConfirmed: true,
    qrDiscrepancy: true,
    invoiceMismatch: true,
    paymentOverdue: true,
    dailyDigest: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Notifications & Alert Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time transaction events, 3-way mismatch alerts, and email notification rules.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onMarkAllRead}>
          <Check className="w-4 h-4" />
          Mark All as Read
        </Button>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'feed', label: 'Notification History', count: notifications.length },
          { id: 'preferences', label: 'Email & Alert Preferences' },
        ]}
      />

      {tab === 'feed' && (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`rounded-xl border p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                n.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.read ? 'text-slate-400' : 'text-blue-700'}`} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <div className="text-[11px] text-slate-500 mt-1.5 font-mono">
                    {n.category} · {n.entityRef} · {n.timestamp}
                  </div>
                </div>
              </div>
              <StatusBadge status={n.read ? 'Read' : 'Unread'} tone={n.read ? 'neutral' : 'info'} />
            </div>
          ))}
        </div>
      )}

      {tab === 'preferences' && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Email & In-App Trigger Rules</h2>
          {(
            [
              ['poConfirmed', 'Purchase Order confirmations & formal amendment requests'],
              ['qrDiscrepancy', 'Warehouse QR scan quantity shortages or damage flags'],
              ['invoiceMismatch', 'Automated 3-way invoice match failures'],
              ['paymentOverdue', 'Payment due & overdue ledger reminders (3 days prior)'],
              ['dailyDigest', 'Daily 08:30 IST settlement & dispatch summary digest'],
            ] as [keyof typeof prefs, string][]
          ).map(([key, desc]) => (
            <label key={key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-none cursor-pointer">
              <span className="text-xs text-slate-700">{desc}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-700"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- SETTINGS MODULE ---------------- */
export const SettingsModule: React.FC<{
  session: UserSession;
  activeCompany: Company;
  members: CompanyMember[];
  onInviteMember: (name: string, email: string, role: MemberRole, dept: string) => void;
  onUpdateMemberRole: (memberId: string, role: MemberRole) => void;
  onSaveIndustryField: (industry: IndustryType, field: IndustryFieldSchema) => void;
}> = ({
  session,
  activeCompany,
  members,
  onInviteMember,
  onUpdateMemberRole,
  onSaveIndustryField,
}) => {
  const [tab, setTab] = useState('company');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState<MemberRole>('Warehouse Lead');
  const [invDept, setInvDept] = useState('Receiving & Dispatch');

  const [customIndustry, setCustomIndustry] = useState<IndustryType>(activeCompany.industry);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [localSchemas, setLocalSchemas] = useState<Record<IndustryType, IndustryFieldSchema[]>>(
    INDUSTRY_FIELD_CONFIGS,
  );

  const permissionsMatrix: {
    module: string;
    Owner: string;
    'Procurement Manager': string;
    'Warehouse Lead': string;
    'Finance Controller': string;
    Viewer: string;
  }[] = [
    { module: 'Purchase Orders', Owner: 'Full', 'Procurement Manager': 'Create / Amend', 'Warehouse Lead': 'Read', 'Finance Controller': 'Read', Viewer: 'Read' },
    { module: 'Deliveries & QR Scan', Owner: 'Full', 'Procurement Manager': 'Read', 'Warehouse Lead': 'Dispatch / Scan', 'Finance Controller': 'Read', Viewer: 'Read' },
    { module: 'Invoices & 3-Way Match', Owner: 'Full', 'Procurement Manager': 'Read', 'Warehouse Lead': 'Read', 'Finance Controller': 'Approve / Reject', Viewer: 'Read' },
    { module: 'Disputes & Evidence', Owner: 'Full', 'Procurement Manager': 'Raise / Resolve', 'Warehouse Lead': 'Upload Proof', 'Finance Controller': 'Credit Note', Viewer: 'Read' },
    { module: 'Payment Ledger', Owner: 'Full', 'Procurement Manager': 'Read', 'Warehouse Lead': 'None', 'Finance Controller': 'Record UTR', Viewer: 'Read' },
    { module: 'Members & RBAC', Owner: 'Full', 'Procurement Manager': 'None', 'Warehouse Lead': 'None', 'Finance Controller': 'None', Viewer: 'None' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
          Workspace & Company Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure company identity, team RBAC permissions, industry schemas, and subscription billing.
        </p>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'company', label: 'Company & Profile' },
          { id: 'members', label: 'Members & Roles', count: members.length },
          { id: 'industry', label: 'Industry Configuration' },
          { id: 'security', label: 'Security & Billing' },
        ]}
      />

      {tab === 'company' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Personal Profile</h2>
            <Input label="Full Name" defaultValue={session.name} />
            <Input label="Work Email" defaultValue={session.email} disabled />
            <Input label="Mobile (+91)" defaultValue={session.phone} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Company Legal Profile</h2>
              <StatusBadge status={activeCompany.verificationStatus} />
            </div>
            <Input label="Legal Entity Name" defaultValue={activeCompany.name} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="GSTIN" defaultValue={activeCompany.gstin} className="font-mono" />
              <Input label="PAN / Udyam" defaultValue={activeCompany.pan} className="font-mono" />
            </div>
            <Input label="Registered Address" defaultValue={activeCompany.address} />
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900">Company Members</h2>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Invite Employee
            </Button>
          </div>
          <DataTable
            data={members}
            keyExtractor={(m) => m.id}
            columns={[
              {
                key: 'name',
                header: 'Employee',
                render: (m) => (
                  <div>
                    <div className="font-medium text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-500">{m.email} · {m.department}</div>
                  </div>
                ),
              },
              {
                key: 'role',
                header: 'Assigned Role',
                render: (m) => (
                  <select
                    value={m.role}
                    onChange={(e) => onUpdateMemberRole(m.id, e.target.value as MemberRole)}
                    className="h-8 rounded border border-slate-300 px-2 text-xs bg-white"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Procurement Manager">Procurement Manager</option>
                    <option value="Warehouse Lead">Warehouse Lead</option>
                    <option value="Finance Controller">Finance Controller</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                ),
              },
              {
                key: 'active',
                header: 'Last Active',
                render: (m) => <span className="text-xs text-slate-500">{m.lastActive}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (m) => <StatusBadge status={m.status} />,
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-4">Module</th>
                    <th className="py-2 px-3">Owner</th>
                    <th className="py-2 px-3">Procurement Mgr</th>
                    <th className="py-2 px-3">Warehouse Lead</th>
                    <th className="py-2 px-3">Finance Controller</th>
                    <th className="py-2 pl-3">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((row) => (
                    <tr key={row.module}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{row.module}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">{row.Owner}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{row['Procurement Manager']}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{row['Warehouse Lead']}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{row['Finance Controller']}</td>
                      <td className="py-2.5 pl-3 font-mono text-slate-500">{row.Viewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'industry' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Configurable Industry Fields</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize structured PO & GRN metadata fields per industry without code changes.
            </p>
          </div>
          <Select
            label="Select Industry Schema"
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value as IndustryType)}
            options={(Object.keys(localSchemas) as IndustryType[]).map((ind) => ({
              label: ind,
              value: ind,
            }))}
          />
          <div className="space-y-2">
            {localSchemas[customIndustry].map((f) => (
              <div key={f.key} className="flex items-center justify-between border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{f.label}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="font-mono text-slate-500">{f.placeholder}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">key: {f.key}</span>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-12 gap-3 items-end pt-3 border-t border-slate-100">
            <div className="sm:col-span-5">
              <Input
                label="New Custom Field Label"
                placeholder="e.g. BIS Certification Code"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
              />
            </div>
            <div className="sm:col-span-5">
              <Input
                label="Placeholder / Example"
                placeholder="e.g. IS 1786:2008"
                value={newFieldPlaceholder}
                onChange={(e) => setNewFieldPlaceholder(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                className="w-full"
                disabled={!newFieldLabel.trim()}
                onClick={() => {
                  const field: IndustryFieldSchema = {
                    key: newFieldLabel.toLowerCase().replace(/\s+/g, '_'),
                    label: newFieldLabel.trim(),
                    placeholder: newFieldPlaceholder.trim() || 'Enter value',
                  };
                  setLocalSchemas({
                    ...localSchemas,
                    [customIndustry]: [...localSchemas[customIndustry], field],
                  });
                  onSaveIndustryField(customIndustry, field);
                  setNewFieldLabel('');
                  setNewFieldPlaceholder('');
                }}
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Security & Session Controls</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Two-Factor Authentication (SMS / TOTP)</span>
                <span className="font-medium text-emerald-700">Enabled</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Audit Log Immutability</span>
                <span className="font-mono text-slate-900">Append-Only SHA-256</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Active Workspace Sessions</span>
                <span className="font-mono text-slate-900">2 devices</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Subscription & Billing</h2>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-950">{activeCompany.plan}</div>
                <div className="text-xs text-slate-500">Annual cycle · Next invoice 12 Apr 2027</div>
              </div>
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>
      )}

      {/* Invite Employee Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Company Member" maxWidth="md">
        <div className="space-y-4">
          <Input label="Employee Full Name" required value={invName} onChange={(e) => setInvName(e.target.value)} />
          <Input label="Corporate Email" type="email" required value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={invRole}
              onChange={(e) => setInvRole(e.target.value as MemberRole)}
              options={[
                { label: 'Procurement Manager', value: 'Procurement Manager' },
                { label: 'Warehouse Lead', value: 'Warehouse Lead' },
                { label: 'Finance Controller', value: 'Finance Controller' },
                { label: 'Viewer', value: 'Viewer' },
              ]}
            />
            <Input label="Department / Gate" value={invDept} onChange={(e) => setInvDept(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!invName.trim() || !invEmail.includes('@')}
              onClick={() => {
                onInviteMember(invName.trim(), invEmail.trim(), invRole, invDept.trim());
                setInviteOpen(false);
                setInvName('');
                setInvEmail('');
              }}
            >
              Send Role Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ---------------- PLATFORM SUPPORT MODULE ---------------- */
export const SupportModule: React.FC<{
  tickets: SupportTicket[];
  onCreateTicket: (subject: string, category: SupportTicket['category'], body: string) => void;
}> = ({ tickets, onCreateTicket }) => {
  const [tab, setTab] = useState('tickets');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Transaction Workflow');
  const [body, setBody] = useState('');

  const faqs = [
    {
      q: 'Why can’t a confirmed Purchase Order be edited directly?',
      a: 'To protect both buyers and suppliers from silent quantity or rate changes, confirmed orders are locked. Any update requires a formal versioned Amendment Request accepted by the counterparty.',
    },
    {
      q: 'How does TradeProof handle partial deliveries?',
      a: 'Warehouse teams scan the dispatch QR pass and enter actual received counts per SKU. TradeProof logs a Partial Delivery GRN and automatically alerts the 3-way invoice matching engine if billed quantities exceed received quantities.',
    },
    {
      q: 'Does TradeProof process bank payments or issue loans?',
      a: 'No. TradeProof is strictly a B2B transaction accountability and payment confirmation ledger tracking UTR, RTGS, NEFT, and UPI B2B references.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
          Platform Help Center & Support
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit enterprise support tickets, inspect active resolutions, or browse workflow documentation.
        </p>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'tickets', label: 'Support Tickets', count: tickets.length },
          { id: 'contact', label: 'Create New Ticket' },
          { id: 'faq', label: 'Knowledge Base & FAQ' },
        ]}
      />

      {tab === 'tickets' && (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-slate-500">{t.ticketNumber} · {t.category}</span>
                  <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{t.subject}</h3>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {t.messages.map((m, i) => (
                  <div key={i} className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">{m.sender}</span>
                      <span className="font-mono">{m.time}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{m.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'contact' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <Input
            label="Ticket Subject"
            required
            placeholder="e.g. Assistance mapping HSN codes for Textile export POs"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
            options={[
              { label: 'Transaction Workflow', value: 'Transaction Workflow' },
              { label: 'GST & Compliance', value: 'GST & Compliance' },
              { label: 'Account & RBAC', value: 'Account & RBAC' },
              { label: 'API & MongoDB Integration', value: 'API & MongoDB Integration' },
            ]}
          />
          <Textarea
            label="Issue Description"
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            disabled={!subject.trim() || !body.trim()}
            onClick={() => {
              onCreateTicket(subject.trim(), category, body.trim());
              setSubject('');
              setBody('');
              setTab('tickets');
            }}
          >
            <Send className="w-4 h-4" />
            Submit Support Ticket
          </Button>
        </div>
      )}

      {tab === 'faq' && (
        <div className="space-y-3 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{f.q}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
