import React, { useState } from 'react';
import { CheckCircle2, FileCheck, MessageSquarePlus, Paperclip, Plus, ShieldAlert } from 'lucide-react';
import {
  DisputeCategory,
  DisputeRecord,
  PurchaseOrder,
} from '../../types/tradeproof';
import { formatINR } from '../../utils/formatters';
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Modal,
  Select,
  StatusBadge,
  Textarea,
} from '../ui/DesignSystem';

interface DisputeModuleProps {
  purchaseOrders: PurchaseOrder[];
  disputes: DisputeRecord[];
  activeCompanyName: string;
  actorName: string;
  autoOpenCreate?: boolean;
  onConsumeAutoOpen?: () => void;
  onCreateDispute: (dispute: DisputeRecord) => void;
  onAddComment: (disputeId: string, message: string) => void;
  onAddEvidence: (disputeId: string, filename: string) => void;
  onResolveDispute: (disputeId: string, resolutionSummary: string) => void;
}

export const DisputeModule: React.FC<DisputeModuleProps> = ({
  purchaseOrders,
  disputes,
  activeCompanyName,
  actorName,
  autoOpenCreate,
  onConsumeAutoOpen,
  onCreateDispute,
  onAddComment,
  onAddEvidence,
  onResolveDispute,
}) => {
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(disputes[0] || null);
  const [createOpen, setCreateOpen] = useState(Boolean(autoOpenCreate));
  const [resolveOpen, setResolveOpen] = useState(false);

  React.useEffect(() => {
    if (autoOpenCreate) {
      setCreateOpen(true);
      onConsumeAutoOpen?.();
    }
  }, [autoOpenCreate, onConsumeAutoOpen]);

  const [commentText, setCommentText] = useState('');
  const [evidenceName, setEvidenceName] = useState('Inspection_Photo_Batch04.jpg');
  const [resolutionText, setResolutionText] = useState(
    'Supplier Credit Note issued for ₹42,480.00; invoice adjusted and cleared for settlement.',
  );

  // Create Dispute Form
  const [poNumber, setPoNumber] = useState(purchaseOrders[0]?.poNumber || 'PO-2026-0841');
  const [category, setCategory] = useState<DisputeCategory>('Shortage');
  const [impactInr, setImpactInr] = useState('25000');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.poNumber === poNumber) || purchaseOrders[0];
    const newDisp: DisputeRecord = {
      id: `disp-${Date.now()}`,
      disputeNumber: `DSP-CLM-0${193 + disputes.length}`,
      poNumber,
      buyerName: po?.buyerName || activeCompanyName,
      supplierName: po?.supplierName || 'Partner Supplier',
      category,
      claimedImpactInr: Number(impactInr) || 0,
      status: 'Open',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      description,
      evidenceFiles: [
        {
          name: evidenceName,
          uploadedBy: actorName,
          uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          hash: `sha256:${Math.random().toString(16).slice(2, 10)}...9f2`,
        },
      ],
      comments: [],
    };
    onCreateDispute(newDisp);
    setSelectedDispute(newDisp);
    setCreateOpen(false);
    setDescription('');
  };

  // Keep drawer synced with updated dispute list
  const liveSelected = selectedDispute
    ? disputes.find((d) => d.id === selectedDispute.id) || selectedDispute
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Dispute Management & Immutable Evidence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured shortage, damage, and rate discrepancy resolution with preserved SHA-256 stamped evidence.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Raise New Dispute
        </Button>
      </div>

      <DataTable
        data={disputes}
        keyExtractor={(d) => d.id}
        onRowClick={(d) => setSelectedDispute(d)}
        columns={[
          {
            key: 'num',
            header: 'Dispute ID',
            render: (d) => (
              <div>
                <div className="font-mono font-semibold text-slate-900">{d.disputeNumber}</div>
                <div className="font-mono text-[11px] text-slate-500">{d.poNumber}</div>
              </div>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (d) => <span className="font-medium text-slate-800">{d.category}</span>,
          },
          {
            key: 'parties',
            header: 'Parties',
            render: (d) => (
              <div className="text-xs text-slate-600">
                <div>{d.buyerName}</div>
                <div>vs {d.supplierName}</div>
              </div>
            ),
          },
          {
            key: 'impact',
            header: 'Claimed Impact',
            align: 'right',
            render: (d) => (
              <span className="font-mono font-semibold text-red-700">{formatINR(d.claimedImpactInr)}</span>
            ),
          },
          {
            key: 'evidence',
            header: 'Evidence',
            align: 'right',
            render: (d) => <span className="font-mono text-xs">{d.evidenceFiles.length} files</span>,
          },
          {
            key: 'status',
            header: 'Status',
            render: (d) => <StatusBadge status={d.status} />,
          },
        ]}
      />

      {/* Dispute Timeline, Evidence & Resolution Drawer */}
      <Drawer
        open={Boolean(liveSelected)}
        onClose={() => setSelectedDispute(null)}
        title={liveSelected ? `${liveSelected.disputeNumber} · ${liveSelected.category}` : ''}
        subtitle={liveSelected ? `PO ${liveSelected.poNumber} · Claimed Impact ${formatINR(liveSelected.claimedImpactInr)}` : ''}
      >
        {liveSelected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <StatusBadge status={liveSelected.status} />
              {liveSelected.status !== 'Resolved' && (
                <Button size="sm" onClick={() => setResolveOpen(true)}>
                  <CheckCircle2 className="w-4 h-4" />
                  Record Formal Resolution
                </Button>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900">Dispute Statement</div>
              <p className="text-slate-700 leading-relaxed">{liveSelected.description}</p>
            </div>

            {liveSelected.resolutionSummary && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 text-xs space-y-1">
                <div className="font-semibold text-emerald-900">Recorded Resolution</div>
                <p className="text-emerald-800">{liveSelected.resolutionSummary}</p>
              </div>
            )}

            {/* Preserved Evidence Vault */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <span>Preserved Evidence Vault (Immutable)</span>
                </div>
              </div>
              <div className="space-y-2">
                {liveSelected.evidenceFiles.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-medium text-slate-900 truncate">{ev.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {ev.uploadedBy} · {ev.uploadedAt}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{ev.hash}</span>
                  </div>
                ))}
              </div>
              {liveSelected.status !== 'Resolved' && (
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Evidence filename (e.g. Weighbridge_Slip.pdf)"
                    className="font-mono text-xs"
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (evidenceName.trim()) {
                        onAddEvidence(liveSelected.id, evidenceName.trim());
                        setEvidenceName('');
                      }
                    }}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Attach
                  </Button>
                </div>
              )}
            </div>

            {/* Comments & Communication Thread */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-900">
                Buyer–Supplier Resolution Thread
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {liveSelected.comments.length === 0 ? (
                  <p className="text-xs text-slate-500">No comments exchanged yet.</p>
                ) : (
                  liveSelected.comments.map((c) => (
                    <div key={c.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {c.authorName} · {c.authorCompany}
                        </span>
                        <span className="font-mono">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mt-1">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
              {liveSelected.status !== 'Resolved' && (
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add response, credit note ref, or dispatch plan..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    disabled={!commentText.trim()}
                    onClick={() => {
                      onAddComment(liveSelected.id, commentText.trim());
                      setCommentText('');
                    }}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Dispute Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Raise Transaction Dispute"
        subtitle="Attach initial evidence to lock disputed invoice settlement"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Purchase Order Reference"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            options={purchaseOrders.map((p) => ({
              label: `${p.poNumber} — ${p.supplierName}`,
              value: p.poNumber,
            }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Dispute Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DisputeCategory)}
              options={[
                { label: 'Shortage', value: 'Shortage' },
                { label: 'Damaged Goods', value: 'Damaged Goods' },
                { label: 'Incorrect Item', value: 'Incorrect Item' },
                { label: 'Invoice Rate Mismatch', value: 'Invoice Rate Mismatch' },
                { label: 'Delayed Delivery', value: 'Delayed Delivery' },
              ]}
            />
            <Input
              label="Claimed Financial Impact (₹)"
              type="number"
              required
              value={impactInr}
              onChange={(e) => setImpactInr(e.target.value)}
            />
          </div>
          <Textarea
            label="Detailed Discrepancy Description"
            rows={3}
            required
            placeholder="Describe affected SKUs, gate receipt variance, or packaging damage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Initial Evidence File"
            className="font-mono text-xs"
            value={evidenceName}
            onChange={(e) => setEvidenceName(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              <ShieldAlert className="w-4 h-4" />
              Open Dispute
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Dispute Modal */}
      <Modal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Record Formal Dispute Resolution"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Agreed Settlement / Credit Note Summary"
            rows={3}
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!resolutionText.trim()}
              onClick={() => {
                if (liveSelected) onResolveDispute(liveSelected.id, resolutionText.trim());
                setResolveOpen(false);
              }}
            >
              Confirm & Close Dispute
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
