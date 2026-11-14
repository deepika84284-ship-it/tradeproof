import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileUp, ShieldAlert, XCircle } from 'lucide-react';
import {
  DeliveryDispatch,
  InvoiceRecord,
  PurchaseOrder,
  WorkspaceRole,
} from '../../types/tradeproof';
import { formatDate, formatINR } from '../../utils/formatters';
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Modal,
  Select,
  StatusBadge,
  Tabs,
} from '../ui/DesignSystem';

interface InvoiceModuleProps {
  perspective: WorkspaceRole;
  purchaseOrders: PurchaseOrder[];
  dispatches: DeliveryDispatch[];
  invoices: InvoiceRecord[];
  autoOpenUpload?: boolean;
  onConsumeAutoOpen?: () => void;
  onUploadInvoice: (inv: InvoiceRecord) => void;
  onApproveInvoice: (invId: string) => void;
  onRejectInvoice: (invId: string, reason: string) => void;
  onEscalateDispute: (inv: InvoiceRecord) => void;
}

export const InvoiceModule: React.FC<InvoiceModuleProps> = ({
  perspective,
  purchaseOrders,
  dispatches,
  invoices,
  autoOpenUpload,
  onConsumeAutoOpen,
  onUploadInvoice,
  onApproveInvoice,
  onRejectInvoice,
  onEscalateDispute,
}) => {
  const [tab, setTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(Boolean(autoOpenUpload));
  const [rejectTarget, setRejectTarget] = useState<InvoiceRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  React.useEffect(() => {
    if (autoOpenUpload) {
      setUploadOpen(true);
      onConsumeAutoOpen?.();
    }
  }, [autoOpenUpload, onConsumeAutoOpen]);

  // Upload Invoice State
  const [poId, setPoId] = useState(purchaseOrders[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV/26-27/${4100 + invoices.length}`);
  const [invoicedTotal, setInvoicedTotal] = useState(String(purchaseOrders[0]?.grandTotal || 500000));
  const [dueDate, setDueDate] = useState('2026-12-20');
  const [fileRef, setFileRef] = useState('TaxInvoice_IRN_Signed.pdf');

  const filtered = invoices.filter((inv) => {
    if (tab === 'mismatches') return inv.matchStatus !== 'Matched (3-Way Verified)';
    if (tab === 'approved') return inv.status === 'Approved for Payment' || inv.status === 'Paid';
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    const dsp = dispatches.find((d) => d.poId === po.id);

    const billed = Number(invoicedTotal) || 0;
    const deliveredVal = dsp
      ? dsp.items.reduce((sum, item) => {
          const poItem = po.items.find((pi) => pi.id === item.lineItemId);
          const unitWithGst = (poItem?.unitPrice || 0) * (1 + (poItem?.gstRate || 18) / 100);
          return sum + item.verifiedReceivedQty * unitWithGst;
        }, 0)
      : 0;

    let matchStatus: InvoiceRecord['matchStatus'] = 'Pending Delivery Proof';
    let mismatchDetails: string | undefined;

    if (!dsp || dsp.status === 'In Transit' || dsp.status === 'Scheduled') {
      matchStatus = 'Pending Delivery Proof';
      mismatchDetails = 'Dispatch not yet QR-verified at receiving gate.';
    } else if (Math.abs(billed - po.grandTotal) > 10) {
      matchStatus = 'Amount Mismatch';
      mismatchDetails = `Invoiced total (${formatINR(billed)}) differs from PO grand total (${formatINR(po.grandTotal)}).`;
    } else if (Math.abs(billed - deliveredVal) > 10) {
      matchStatus = 'Quantity Mismatch';
      mismatchDetails = `Invoiced amount (${formatINR(billed)}) exceeds verified gate delivery value (${formatINR(deliveredVal)}).`;
    } else {
      matchStatus = 'Matched (3-Way Verified)';
    }

    const subtotal = Math.round(billed / 1.18);
    const gst = billed - subtotal;

    const newInv: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      poId: po.id,
      poNumber: po.poNumber,
      dispatchId: dsp?.id || 'pending',
      dispatchNumber: dsp?.dispatchNumber || 'Pending Dispatch',
      supplierName: po.supplierName,
      buyerName: po.buyerName,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate,
      poAmount: po.grandTotal,
      deliveredValue: Math.round(deliveredVal),
      invoicedSubtotal: subtotal,
      gstAmount: gst,
      invoicedTotal: billed,
      matchStatus,
      mismatchDetails,
      status: matchStatus === 'Matched (3-Way Verified)' ? 'Under Review' : 'Submitted',
      paidAmount: 0,
      fileRef,
    };

    onUploadInvoice(newInv);
    setUploadOpen(false);
    setSelectedInvoice(newInv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Invoice Management & 3-Way Matching
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated comparison of Purchase Order, QR-verified Delivery Receipt, and GST Tax Invoice.
          </p>
        </div>
        {perspective === 'supplier' && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <FileUp className="w-4 h-4" />
            Upload Tax Invoice
          </Button>
        )}
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: 'All Invoices', count: invoices.length },
          {
            id: 'mismatches',
            label: 'Mismatches & Pending GRN',
            count: invoices.filter((i) => i.matchStatus !== 'Matched (3-Way Verified)').length,
          },
          {
            id: 'approved',
            label: 'Approved / Settled',
            count: invoices.filter((i) => i.status === 'Approved for Payment' || i.status === 'Paid').length,
          },
        ]}
      />

      <DataTable
        data={filtered}
        keyExtractor={(i) => i.id}
        onRowClick={(i) => setSelectedInvoice(i)}
        columns={[
          {
            key: 'inv',
            header: 'Invoice & PO',
            render: (i) => (
              <div>
                <div className="font-mono font-semibold text-slate-900">{i.invoiceNumber}</div>
                <div className="font-mono text-[11px] text-slate-500">
                  {i.poNumber} · {i.dispatchNumber}
                </div>
              </div>
            ),
          },
          {
            key: 'party',
            header: perspective === 'supplier' ? 'Buyer' : 'Supplier',
            render: (i) => (
              <span className="font-medium text-slate-800">
                {perspective === 'supplier' ? i.buyerName : i.supplierName}
              </span>
            ),
          },
          {
            key: 'due',
            header: 'Due Date',
            render: (i) => <span className="text-xs text-slate-600">{formatDate(i.dueDate)}</span>,
          },
          {
            key: 'amount',
            header: 'Invoiced Total',
            align: 'right',
            render: (i) => (
              <span className="font-mono font-semibold text-slate-900">{formatINR(i.invoicedTotal)}</span>
            ),
          },
          {
            key: 'match',
            header: '3-Way Match Engine',
            render: (i) => <StatusBadge status={i.matchStatus} />,
          },
          {
            key: 'status',
            header: 'Approval Status',
            render: (i) => <StatusBadge status={i.status} />,
          },
        ]}
      />

      {/* Invoice Details & 3-Way Comparison Drawer */}
      <Drawer
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : ''}
        subtitle={selectedInvoice ? `${selectedInvoice.supplierName} → ${selectedInvoice.buyerName}` : ''}
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInvoice.matchStatus} />
                <StatusBadge status={selectedInvoice.status} />
              </div>
              {perspective === 'buyer' && selectedInvoice.status !== 'Approved for Payment' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onApproveInvoice(selectedInvoice.id);
                      setSelectedInvoice({ ...selectedInvoice, status: 'Approved for Payment' });
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Invoice
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectTarget(selectedInvoice)}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    Reject
                  </Button>
                </div>
              )}
            </div>

            {/* Visible 3-Way Comparison Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-900">
                Automated 3-Way Comparison Breakdown
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="text-slate-500">1. Purchase Order ({selectedInvoice.poNumber})</div>
                  <div className="font-mono text-base font-bold text-slate-950 mt-1 tabular-nums">
                    {formatINR(selectedInvoice.poAmount)}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="text-slate-500">2. Verified Delivery ({selectedInvoice.dispatchNumber})</div>
                  <div className="font-mono text-base font-bold text-slate-950 mt-1 tabular-nums">
                    {formatINR(selectedInvoice.deliveredValue)}
                  </div>
                </div>
                <div
                  className={`border rounded-xl p-3.5 ${
                    selectedInvoice.matchStatus === 'Matched (3-Way Verified)'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-red-200 bg-red-50/40'
                  }`}
                >
                  <div className="text-slate-600">3. Tax Invoice Billed</div>
                  <div className="font-mono text-base font-bold text-slate-950 mt-1 tabular-nums">
                    {formatINR(selectedInvoice.invoicedTotal)}
                  </div>
                </div>
              </div>

              {selectedInvoice.mismatchDetails && (
                <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Variance Detected</div>
                      <p className="mt-0.5 leading-relaxed">{selectedInvoice.mismatchDetails}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onEscalateDispute(selectedInvoice);
                      setSelectedInvoice(null);
                    }}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Open Dispute
                  </Button>
                </div>
              )}
            </div>

            {/* GST & Payment Due Breakdown */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs tabular-nums">
              <div className="font-semibold text-slate-900 mb-2">Invoice & Payment Due Summary</div>
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value</span>
                <span className="font-mono">{formatINR(selectedInvoice.invoicedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST</span>
                <span className="font-mono">{formatINR(selectedInvoice.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Due Date</span>
                <span className="font-mono">{formatDate(selectedInvoice.dueDate)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-semibold pt-2 border-t border-slate-100">
                <span>Document Attachment</span>
                <span className="font-mono text-blue-700">{selectedInvoice.fileRef}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Upload Invoice Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Supplier Tax Invoice"
        subtitle="System automatically evaluates 3-way match against PO and QR delivery receipt"
        maxWidth="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Select
            label="Link to Purchase Order"
            value={poId}
            onChange={(e) => {
              setPoId(e.target.value);
              const po = purchaseOrders.find((p) => p.id === e.target.value);
              if (po) setInvoicedTotal(String(po.grandTotal));
            }}
            options={purchaseOrders.map((po) => ({
              label: `${po.poNumber} — ${formatINR(po.grandTotal)}`,
              value: po.id,
            }))}
          />
          <Input
            label="GST Invoice Number"
            required
            className="font-mono"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Invoiced Grand Total (₹)"
              type="number"
              required
              value={invoicedTotal}
              onChange={(e) => setInvoicedTotal(e.target.value)}
            />
            <Input
              label="Payment Due Date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Input
            label="e-Invoice / PDF Attachment Name"
            className="font-mono text-xs"
            value={fileRef}
            onChange={(e) => setFileRef(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit & Run 3-Way Match</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Invoice Modal */}
      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject Invoice"
        subtitle={rejectTarget?.invoiceNumber}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason (Logged in Audit Trail)"
            required
            placeholder="e.g. Quantity billed exceeds verified GRN count by 15 units"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (rejectTarget) onRejectInvoice(rejectTarget.id, rejectReason.trim());
                setRejectTarget(null);
                setRejectReason('');
                setSelectedInvoice(null);
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
