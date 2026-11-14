import React, { useState } from 'react';
import { Building2, Check, MailPlus, ShieldCheck, X } from 'lucide-react';
import { BusinessConnection, Company } from '../../types/tradeproof';
import { formatCompactINR, formatDate } from '../../utils/formatters';
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Modal,
  SearchInput,
  Select,
  StatusBadge,
  Tabs,
} from '../ui/DesignSystem';

interface BusinessNetworkModuleProps {
  activeCompany: Company;
  companies: Company[];
  connections: BusinessConnection[];
  globalSearch: string;
  onSendInvitation: (partner: Company, relationship: 'Supplier' | 'Buyer', creditDays: number) => void;
  onRespondInvitation: (connectionId: string, accept: boolean) => void;
}

export const BusinessNetworkModule: React.FC<BusinessNetworkModuleProps> = ({
  activeCompany,
  companies,
  connections,
  globalSearch,
  onSendInvitation,
  onRespondInvitation,
}) => {
  const [tab, setTab] = useState('connections');
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Company | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Company | null>(null);
  const [inviteRelation, setInviteRelation] = useState<'Supplier' | 'Buyer'>('Supplier');
  const [creditDays, setCreditDays] = useState('30');

  const combinedQuery = (search || globalSearch).trim().toLowerCase();

  const connectedList = connections.filter((c) => c.status === 'Connected');
  const pendingList = connections.filter(
    (c) => c.status === 'Pending Received' || c.status === 'Pending Sent',
  );
  const directoryList = companies.filter((c) => {
    if (c.id === activeCompany.id) return false;
    if (!combinedQuery) return true;
    return (
      c.name.toLowerCase().includes(combinedQuery) ||
      c.gstin.toLowerCase().includes(combinedQuery) ||
      c.city.toLowerCase().includes(combinedQuery) ||
      c.industry.toLowerCase().includes(combinedQuery)
    );
  });

  const filteredConnections = connectedList.filter(
    (c) =>
      !combinedQuery ||
      c.partnerName.toLowerCase().includes(combinedQuery) ||
      c.partnerGstin.toLowerCase().includes(combinedQuery) ||
      c.partnerCity.toLowerCase().includes(combinedQuery),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Business Network & Entity Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover GSTIN-verified Indian companies, manage credit terms, and govern partner invitations.
          </p>
        </div>
        <Button size="sm" onClick={() => setTab('directory')}>
          <MailPlus className="w-4 h-4" />
          Invite Business Partner
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: 'connections', label: 'Connected Partners', count: connectedList.length },
            { id: 'invitations', label: 'Invitations', count: pendingList.length },
            { id: 'directory', label: 'Search Businesses', count: directoryList.length },
          ]}
        />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search company, GSTIN, city..."
          className="w-full sm:w-72"
        />
      </div>

      {tab === 'connections' && (
        <DataTable
          data={filteredConnections}
          keyExtractor={(c) => c.id}
          onRowClick={(c) => {
            const comp = companies.find((x) => x.id === c.partnerCompanyId);
            if (comp) setSelectedProfile(comp);
          }}
          columns={[
            {
              key: 'partner',
              header: 'Partner Company',
              render: (c) => (
                <div>
                  <div className="font-semibold text-slate-900">{c.partnerName}</div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {c.partnerGstin} · {c.partnerCity}
                  </div>
                </div>
              ),
            },
            {
              key: 'industry',
              header: 'Industry',
              render: (c) => <span className="text-xs text-slate-700">{c.partnerIndustry}</span>,
            },
            {
              key: 'rel',
              header: 'Relationship',
              render: (c) => <span className="text-xs font-medium text-slate-800">{c.relationship}</span>,
            },
            {
              key: 'terms',
              header: 'Credit Terms',
              align: 'right',
              render: (c) => <span className="font-mono text-xs">Net {c.creditTermsDays} Days</span>,
            },
            {
              key: 'vol',
              header: 'Verified Volume',
              align: 'right',
              render: (c) => (
                <span className="font-mono font-medium text-slate-900">
                  {formatCompactINR(c.totalVolumeInr)}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (c) => <StatusBadge status={c.status} />,
            },
          ]}
        />
      )}

      {tab === 'invitations' && (
        <DataTable
          data={pendingList}
          keyExtractor={(c) => c.id}
          emptyTitle="No pending network invitations"
          emptyDescription="Search the business directory to send a connection invitation to a buyer or supplier."
          columns={[
            {
              key: 'partner',
              header: 'Company',
              render: (c) => (
                <div>
                  <div className="font-semibold text-slate-900">{c.partnerName}</div>
                  <div className="font-mono text-[11px] text-slate-500">{c.partnerGstin}</div>
                </div>
              ),
            },
            {
              key: 'rel',
              header: 'Proposed Role',
              render: (c) => <span className="text-xs">{c.relationship}</span>,
            },
            {
              key: 'terms',
              header: 'Proposed Credit',
              render: (c) => <span className="font-mono text-xs">Net {c.creditTermsDays} Days</span>,
            },
            {
              key: 'status',
              header: 'Direction',
              render: (c) => <StatusBadge status={c.status} />,
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (c) =>
                c.status === 'Pending Received' ? (
                  <div className="inline-flex items-center gap-2">
                    <Button size="sm" onClick={() => onRespondInvitation(c.id, true)}>
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRespondInvitation(c.id, false)}>
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Awaiting partner</span>
                ),
            },
          ]}
        />
      )}

      {tab === 'directory' && (
        <DataTable
          data={directoryList}
          keyExtractor={(c) => c.id}
          onRowClick={(c) => setSelectedProfile(c)}
          columns={[
            {
              key: 'company',
              header: 'Company & Registration',
              render: (c) => (
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">
                    GSTIN {c.gstin} · {c.city}, {c.state}
                  </div>
                </div>
              ),
            },
            {
              key: 'industry',
              header: 'Industry',
              render: (c) => <span className="text-xs text-slate-700">{c.industry}</span>,
            },
            {
              key: 'metrics',
              header: 'On-Time Delivery',
              align: 'right',
              render: (c) => <span className="font-mono text-xs">{c.onTimeRate}%</span>,
            },
            {
              key: 'verification',
              header: 'KYB Status',
              render: (c) => <StatusBadge status={c.verificationStatus} />,
            },
            {
              key: 'invite',
              header: 'Action',
              align: 'right',
              render: (c) => {
                const existing = connections.find((conn) => conn.partnerCompanyId === c.id);
                if (existing) {
                  return <StatusBadge status={existing.status} />;
                }
                return (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInviteTarget(c);
                    }}
                  >
                    Send Invitation
                  </Button>
                );
              },
            },
          ]}
        />
      )}

      {/* Company Profile & Verification Drawer */}
      <Drawer
        open={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
        title={selectedProfile?.name || ''}
        subtitle="Verified Entity Profile & Compliance Record"
      >
        {selectedProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-slate-700" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{selectedProfile.industry}</div>
                  <div className="text-xs text-slate-500">
                    {selectedProfile.city}, {selectedProfile.state} · Member since{' '}
                    {formatDate(selectedProfile.joinedDate)}
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedProfile.verificationStatus} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-3.5">
                <div className="text-slate-500">GSTIN</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">{selectedProfile.gstin}</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3.5">
                <div className="text-slate-500">PAN / CIN / Udyam</div>
                <div className="font-mono font-semibold text-slate-900 mt-1">
                  {selectedProfile.pan} · {selectedProfile.cinOrUdyam}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">Registered Address</div>
              <p className="text-slate-600">{selectedProfile.address}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {selectedProfile.onTimeRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">On-Time Delivery</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {selectedProfile.disputeRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Dispute Ratio</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {selectedProfile.avgSettlementDays}d
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Avg Settlement</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Capabilities: {selectedProfile.roleCapabilities.join(' & ')}</span>
            </div>
          </div>
        )}
      </Drawer>

      {/* Send Invitation Modal */}
      <Modal
        open={Boolean(inviteTarget)}
        onClose={() => setInviteTarget(null)}
        title="Send Business Connection Invitation"
        subtitle={inviteTarget ? `${inviteTarget.name} (${inviteTarget.gstin})` : ''}
        maxWidth="md"
      >
        {inviteTarget && (
          <div className="space-y-4">
            <Select
              label="Connection Relationship"
              value={inviteRelation}
              onChange={(e) => setInviteRelation(e.target.value as 'Supplier' | 'Buyer')}
              options={[
                { label: 'Onboard as Supplier (We buy from them)', value: 'Supplier' },
                { label: 'Onboard as Buyer (We supply to them)', value: 'Buyer' },
              ]}
            />
            <Input
              label="Agreed Credit Terms (Days)"
              type="number"
              min={0}
              max={180}
              value={creditDays}
              onChange={(e) => setCreditDays(e.target.value)}
              hint="Standard MSME Samadhaan compliance limit is 45 days."
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setInviteTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSendInvitation(inviteTarget, inviteRelation, Number(creditDays) || 30);
                  setInviteTarget(null);
                  setTab('invitations');
                }}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
