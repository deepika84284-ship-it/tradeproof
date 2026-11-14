import React, { useState } from 'react';
import { CheckCircle2, FileEdit, History, Lock, Plus, Printer, Trash2 } from 'lucide-react';
import { INDUSTRY_FIELD_CONFIGS } from '../../data/mockData';
import {
  AuditEntry,
  BusinessConnection,
  Company,
  IndustryType,
  POLineItem,
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
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
} from '../ui/DesignSystem';

interface PurchaseOrdersModuleProps {
  perspective: WorkspaceRole;
  activeCompany: Company;
  connections: BusinessConnection[];
  purchaseOrders: PurchaseOrder[];
  auditTrail: AuditEntry[];
  globalSearch: string;
  autoOpenCreate?: boolean;
  onConsumeAutoOpen?: () => void;
  onCreatePO: (po: PurchaseOrder) => void;
  onConfirmPO: (poId: string) => void;
  onRequestAmendment: (poId: string, reason: string, summary: string) => void;
}

export const PurchaseOrdersModule: React.FC<PurchaseOrdersModuleProps> = ({
  perspective,
  activeCompany,
  connections,
  purchaseOrders,
  auditTrail,
  globalSearch,
  autoOpenCreate,
  onConsumeAutoOpen,
  onCreatePO,
  onConfirmPO,
  onRequestAmendment,
}) => {
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [printPreviewPO, setPrintPreviewPO] = useState<PurchaseOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(Boolean(autoOpenCreate));
  const [amendModalPO, setAmendModalPO] = useState<PurchaseOrder | null>(null);
  const [amendReason, setAmendReason] = useState('');
  const [amendSummary, setAmendSummary] = useState('');

  React.useEffect(() => {
    if (autoOpenCreate) {
      setCreateOpen(true);
      onConsumeAutoOpen?.();
    }
  }, [autoOpenCreate, onConsumeAutoOpen]);

  // Create PO Form State
  const connectedSuppliers = connections.filter((c) => c.status === 'Connected');
  const [supplierId, setSupplierId] = useState(connectedSuppliers[0]?.partnerCompanyId || '');
  const [poIndustry, setPoIndustry] = useState<IndustryType>(activeCompany.industry);
  const [industryFields, setIndustryFields] = useState<Record<string, string>>({});
  const [expectedDate, setExpectedDate] = useState('2026-11-26');
  const [deliveryAddress, setDeliveryAddress] = useState(activeCompany.address);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days from Verified GRN');
  const [notes, setNotes] = useState('');
  const [draftItems, setDraftItems] = useState<POLineItem[]>([
    {
      id: 'new-li-1',
      sku: 'CMP-402',
      name: 'Precision Machined Flange Housing',
      hsnOrSac: '84834000',
      unit: 'Units',
      orderedQty: 100,
      dispatchedQty: 0,
      receivedQty: 0,
      unitPrice: 1450,
      gstRate: 18,
    },
  ]);

  const query = (search || globalSearch).trim().toLowerCase();
  const filtered = purchaseOrders.filter((po) => {
    const matchesTab =
      statusTab === 'all' ||
      (statusTab === 'pending' && po.status === 'Pending Supplier Confirmation') ||
      (statusTab === 'confirmed' && (po.status === 'Confirmed' || po.status === 'Dispatched')) ||
      (statusTab === 'partial' &&
        (po.status === 'Partially Delivered' || po.status === 'Partially Dispatched'));
    const matchesSearch =
      !query ||
      po.poNumber.toLowerCase().includes(query) ||
      po.supplierName.toLowerCase().includes(query) ||
      po.industry.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const calcSubtotal = draftItems.reduce((acc, i) => acc + i.orderedQty * i.unitPrice, 0);
  const calcGst = draftItems.reduce(
    (acc, i) => acc + (i.orderedQty * i.unitPrice * i.gstRate) / 100,
    0,
  );
  const calcGrandTotal = calcSubtotal + calcGst;

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = connectedSuppliers.find((c) => c.partnerCompanyId === supplierId);
    const nextNum = 865 + purchaseOrders.length;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-0${nextNum}`,
      version: 1,
      buyerCompanyId: activeCompany.id,
      buyerName: activeCompany.name,
      supplierCompanyId: supplier?.partnerCompanyId || 'comp-shakti-fasteners',
      supplierName: supplier?.partnerName || 'Shakti Industrial Fasteners & Alloys',
      industry: poIndustry,
      industryFields,
      createdAt: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: expectedDate,
      deliveryAddress,
      paymentTerms,
      status: 'Pending Supplier Confirmation',
      items: draftItems,
      subtotal: calcSubtotal,
      gstTotal: calcGst,
      grandTotal: calcGrandTotal,
      amendments: [],
      notes,
    };
    onCreatePO(newPO);
    setCreateOpen(false);
    setSelectedPO(newPO);
  };

  const activeSchemaFields = INDUSTRY_FIELD_CONFIGS[poIndustry];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Purchase Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Industry-configurable POs with GST breakdown, supplier lock-in, and versioned amendments.
          </p>
        </div>
        {perspective === 'buyer' && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          activeId={statusTab}
          onChange={(id) => {
            setStatusTab(id);
            setPage(1);
          }}
          tabs={[
            { id: 'all', label: 'All Orders', count: purchaseOrders.length },
            {
              id: 'pending',
              label: 'Awaiting Confirmation',
              count: purchaseOrders.filter((p) => p.status === 'Pending Supplier Confirmation').length,
            },
            {
              id: 'confirmed',
              label: 'Confirmed & Dispatched',
              count: purchaseOrders.filter((p) => p.status === 'Confirmed' || p.status === 'Dispatched').length,
            },
            {
              id: 'partial',
              label: 'Partial Delivery',
              count: purchaseOrders.filter((p) => p.status.includes('Partial')).length,
            },
          ]}
        />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search PO number, supplier..."
          className="w-full sm:w-72"
        />
      </div>

      <DataTable
        data={paginated}
        keyExtractor={(po) => po.id}
        onRowClick={(po) => setSelectedPO(po)}
        columns={[
          {
            key: 'poNumber',
            header: 'PO Number',
            render: (po) => (
              <div>
                <div className="font-mono font-semibold text-slate-900">
                  {po.poNumber} <span className="text-slate-400 font-normal">v{po.version}</span>
                </div>
                <div className="text-[11px] text-slate-500">{po.industry}</div>
              </div>
            ),
          },
          {
            key: 'counterparty',
            header: perspective === 'supplier' ? 'Buyer' : 'Supplier',
            render: (po) => (
              <span className="font-medium text-slate-800">
                {perspective === 'supplier' ? po.buyerName : po.supplierName}
              </span>
            ),
          },
          {
            key: 'items',
            header: 'Items',
            align: 'right',
            render: (po) => <span className="font-mono text-xs">{po.items.length} lines</span>,
          },
          {
            key: 'eta',
            header: 'Expected Delivery',
            render: (po) => <span className="text-xs text-slate-600">{formatDate(po.expectedDeliveryDate)}</span>,
          },
          {
            key: 'total',
            header: 'Grand Total',
            align: 'right',
            render: (po) => (
              <span className="font-mono font-semibold text-slate-900">{formatINR(po.grandTotal)}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (po) => <StatusBadge status={po.status} />,
          },
        ]}
      />

      <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} onPageChange={setPage} />

      {/* PO Details & Audit Drawer */}
      <Drawer
        open={Boolean(selectedPO)}
        onClose={() => setSelectedPO(null)}
        title={selectedPO ? `${selectedPO.poNumber} (Version ${selectedPO.version})` : ''}
        subtitle={selectedPO ? `${selectedPO.buyerName} → ${selectedPO.supplierName}` : ''}
      >
        {selectedPO && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <StatusBadge status={selectedPO.status} />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPrintPreviewPO(selectedPO)}
                >
                  <Printer className="w-4 h-4" />
                  GST Document View
                </Button>
                {selectedPO.status === 'Pending Supplier Confirmation' && perspective === 'supplier' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onConfirmPO(selectedPO.id);
                      setSelectedPO({ ...selectedPO, status: 'Confirmed' });
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Purchase Order
                  </Button>
                )}
                {selectedPO.status !== 'Pending Supplier Confirmation' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAmendModalPO(selectedPO)}
                  >
                    <FileEdit className="w-4 h-4" />
                    Request Formal Amendment
                  </Button>
                )}
              </div>
            </div>

            {/* Live Order Lifecycle Stepper */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
              <div className="text-[11px] font-medium text-slate-500 mb-3">
                Transaction Lifecycle Progress
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px]">
                {[
                  { label: '1. PO Issued', done: true },
                  {
                    label: '2. Supplier Locked',
                    done: selectedPO.status !== 'Pending Supplier Confirmation' && selectedPO.status !== 'Draft',
                  },
                  {
                    label: '3. Dispatched / QR',
                    done:
                      selectedPO.status === 'Dispatched' ||
                      selectedPO.status === 'Partially Delivered' ||
                      selectedPO.status === 'Delivered' ||
                      selectedPO.status === 'Closed',
                  },
                  {
                    label: '4. GRN Verified',
                    done:
                      selectedPO.status === 'Partially Delivered' ||
                      selectedPO.status === 'Delivered' ||
                      selectedPO.status === 'Closed',
                  },
                ].map((step) => (
                  <div
                    key={step.label}
                    className={`rounded-lg border px-2.5 py-2 font-medium ${
                      step.done
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
            </div>

            {selectedPO.status !== 'Pending Supplier Confirmation' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Confirmed orders cannot be silently edited. Changes require a formal versioned amendment accepted by both parties.
                </span>
              </div>
            )}

            {/* Industry Custom Fields */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-900">
                {selectedPO.industry} Specific Fields
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                {Object.entries(selectedPO.industryFields).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="text-[11px] text-slate-500">{k}</div>
                    <div className="font-mono font-medium text-slate-900 mt-0.5">{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Item & HSN/SAC</th>
                    <th className="px-3 py-2.5 text-right">Ordered</th>
                    <th className="px-3 py-2.5 text-right">Received</th>
                    <th className="px-3 py-2.5 text-right">Rate</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {selectedPO.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          SKU {item.sku} · HSN {item.hsnOrSac} · GST {item.gstRate}%
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        {item.orderedQty} {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">{item.receivedQty}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{formatINR(item.unitPrice)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatINR(item.orderedQty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-1.5 text-xs tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal</span>
                  <span className="font-mono">{formatINR(selectedPO.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IGST / CGST+SGST Total</span>
                  <span className="font-mono">{formatINR(selectedPO.gstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-1.5 border-t border-slate-200">
                  <span>Grand Total (INR)</span>
                  <span className="font-mono">{formatINR(selectedPO.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Amendment History */}
            {selectedPO.amendments.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <History className="w-4 h-4 text-blue-700" />
                  <span>Amendment Version History</span>
                </div>
                {selectedPO.amendments.map((amd) => (
                  <div key={amd.id} className="text-xs border border-slate-100 bg-slate-50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-900">Version {amd.version}</span>
                      <StatusBadge status={amd.status} />
                    </div>
                    <div className="font-medium text-slate-800">{amd.summary}</div>
                    <div className="text-slate-500">
                      Reason: {amd.reason} · By {amd.requestedBy} ({amd.requestedAt})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Entity Audit Log */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-900">Order Audit Trail</div>
              {auditTrail
                .filter((a) => a.entityId === selectedPO.poNumber)
                .map((a) => (
                  <div key={a.id} className="text-xs text-slate-600 border-b border-slate-100 pb-2 last:border-none last:pb-0">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{a.actorName} ({a.actorRole})</span>
                      <span className="font-mono">{a.timestamp}</span>
                    </div>
                    <div className="font-medium text-slate-900 mt-0.5">{a.action}</div>
                    <div>{a.details}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Purchase Order Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Purchase Order"
        subtitle="Configurable industry fields with automated GST calculation"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmitPO} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Select Connected Supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              options={connectedSuppliers.map((c) => ({
                label: `${c.partnerName} (${c.partnerGstin})`,
                value: c.partnerCompanyId,
              }))}
            />
            <Select
              label="Transaction Industry Schema"
              value={poIndustry}
              onChange={(e) => {
                setPoIndustry(e.target.value as IndustryType);
                setIndustryFields({});
              }}
              options={(Object.keys(INDUSTRY_FIELD_CONFIGS) as IndustryType[]).map((ind) => ({
                label: ind,
                value: ind,
              }))}
            />
          </div>

          {/* Dynamic Industry Fields */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <div className="text-xs font-semibold text-slate-900">
              {poIndustry} Industry-Specific Fields
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {activeSchemaFields.map((f) => (
                <Input
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={industryFields[f.key] || ''}
                  onChange={(e) =>
                    setIndustryFields({ ...industryFields, [f.key]: e.target.value })
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Expected Delivery Date"
              type="date"
              required
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
            <Input
              label="Payment Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
            <Input
              label="Delivery Address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-900">Line Items & GST</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraftItems([
                    ...draftItems,
                    {
                      id: `li-${Date.now()}`,
                      sku: 'SKU-NEW',
                      name: 'Additional Material / Service Item',
                      hsnOrSac: '73181500',
                      unit: 'Units',
                      orderedQty: 50,
                      dispatchedQty: 0,
                      receivedQty: 0,
                      unitPrice: 900,
                      gstRate: 18,
                    },
                  ])
                }
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line Item
              </Button>
            </div>
            {draftItems.map((item, idx) => (
              <div
                key={item.id}
                className="grid sm:grid-cols-12 gap-2 items-end border border-slate-200 rounded-lg p-3"
              >
                <div className="sm:col-span-4">
                  <Input
                    label="Item / Service Name"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...draftItems];
                      next[idx].name = e.target.value;
                      setDraftItems(next);
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="HSN/SAC"
                    value={item.hsnOrSac}
                    onChange={(e) => {
                      const next = [...draftItems];
                      next[idx].hsnOrSac = e.target.value;
                      setDraftItems(next);
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Qty"
                    type="number"
                    min={1}
                    value={item.orderedQty}
                    onChange={(e) => {
                      const next = [...draftItems];
                      next[idx].orderedQty = Number(e.target.value) || 0;
                      setDraftItems(next);
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Unit Rate (₹)"
                    type="number"
                    min={1}
                    value={item.unitPrice}
                    onChange={(e) => {
                      const next = [...draftItems];
                      next[idx].unitPrice = Number(e.target.value) || 0;
                      setDraftItems(next);
                    }}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="GST%"
                    type="number"
                    value={item.gstRate}
                    onChange={(e) => {
                      const next = [...draftItems];
                      next[idx].gstRate = Number(e.target.value) || 0;
                      setDraftItems(next);
                    }}
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    disabled={draftItems.length <= 1}
                    onClick={() => setDraftItems(draftItems.filter((_, i) => i !== idx))}
                    className="p-2.5 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Textarea
            label="Terms & Inspection Notes"
            rows={2}
            placeholder="MTC, packaging, or gate slot instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600 tabular-nums">
              Subtotal: <span className="font-mono font-medium">{formatINR(calcSubtotal)}</span> · GST:{' '}
              <span className="font-mono font-medium">{formatINR(calcGst)}</span> · Total:{' '}
              <span className="font-mono font-bold text-slate-950">{formatINR(calcGrandTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Issue Purchase Order</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Formal PO Amendment Modal */}
      <Modal
        open={Boolean(amendModalPO)}
        onClose={() => setAmendModalPO(null)}
        title={`Formal Amendment Request · ${amendModalPO?.poNumber || ''}`}
        subtitle="Creates a versioned change record; original confirmed PO remains preserved in audit history."
        maxWidth="md"
      >
        {amendModalPO && (
          <div className="space-y-4">
            <Input
              label="Change Summary"
              required
              placeholder="e.g. Increase quantity by 25 units / Extend delivery date by 4 days"
              value={amendSummary}
              onChange={(e) => setAmendSummary(e.target.value)}
            />
            <Textarea
              label="Business Justification"
              rows={3}
              required
              placeholder="Reason required for buyer-supplier audit trail..."
              value={amendReason}
              onChange={(e) => setAmendReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setAmendModalPO(null)}>
                Cancel
              </Button>
              <Button
                disabled={!amendSummary.trim() || !amendReason.trim()}
                onClick={() => {
                  onRequestAmendment(amendModalPO.id, amendReason.trim(), amendSummary.trim());
                  setAmendModalPO(null);
                  setAmendReason('');
                  setAmendSummary('');
                }}
              >
                Submit Version {amendModalPO.version + 1} Amendment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Commercial GST Purchase Order Document Preview */}
      <Modal
        open={Boolean(printPreviewPO)}
        onClose={() => setPrintPreviewPO(null)}
        title={`Official Purchase Order · ${printPreviewPO?.poNumber || ''}`}
        subtitle="GST-compliant commercial document layout"
        maxWidth="xl"
      >
        {printPreviewPO && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="font-display text-lg font-bold text-slate-950">{printPreviewPO.buyerName}</div>
                <div className="text-slate-600 mt-0.5">{printPreviewPO.deliveryAddress}</div>
              </div>
              <div className="text-right font-mono">
                <div className="font-bold text-slate-950">{printPreviewPO.poNumber} (v{printPreviewPO.version})</div>
                <div className="text-slate-500">Issued: {formatDate(printPreviewPO.createdAt)}</div>
                <div className="text-slate-500">ETA: {formatDate(printPreviewPO.expectedDeliveryDate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div>
                <div className="text-slate-500">Vendor / Supplier</div>
                <div className="font-semibold text-slate-900 mt-0.5">{printPreviewPO.supplierName}</div>
              </div>
              <div>
                <div className="text-slate-500">Payment & Credit Terms</div>
                <div className="font-semibold text-slate-900 mt-0.5">{printPreviewPO.paymentTerms}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Description & HSN</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Rate (₹)</th>
                    <th className="px-3 py-2 text-right">GST%</th>
                    <th className="px-3 py-2 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {printPreviewPO.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{it.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">HSN {it.hsnOrSac}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{it.orderedQty} {it.unit}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatINR(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-mono">{it.gstRate}%</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">
                        {formatINR(it.orderedQty * it.unitPrice * (1 + it.gstRate / 100))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-slate-500">Notes: {printPreviewPO.notes || 'Standard TradeProof verification terms apply.'}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPrintPreviewPO(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
