import React, { useState } from 'react';
import { Camera, CheckCircle2, FileUp, QrCode, ScanLine, Truck } from 'lucide-react';
import {
  DeliveryDispatch,
  DeliveryItemCheck,
  PurchaseOrder,
  WorkspaceRole,
} from '../../types/tradeproof';
import { formatDate } from '../../utils/formatters';
import {
  Button,
  DataTable,
  Drawer,
  Input,
  Modal,
  QrCodeSvg,
  Select,
  StatusBadge,
} from '../ui/DesignSystem';

interface DeliveryModuleProps {
  perspective: WorkspaceRole;
  purchaseOrders: PurchaseOrder[];
  dispatches: DeliveryDispatch[];
  autoOpenMode?: 'scanner' | 'create' | null;
  onConsumeAutoOpen?: () => void;
  onCreateDispatch: (dispatch: DeliveryDispatch) => void;
  onVerifyDelivery: (
    dispatchId: string,
    checkedItems: DeliveryItemCheck[],
    proofFile: string,
    acceptPartial: boolean,
  ) => void;
}

export const DeliveryModule: React.FC<DeliveryModuleProps> = ({
  perspective,
  purchaseOrders,
  dispatches,
  autoOpenMode,
  onConsumeAutoOpen,
  onCreateDispatch,
  onVerifyDelivery,
}) => {
  const [selectedDispatch, setSelectedDispatch] = useState<DeliveryDispatch | null>(null);
  const [createOpen, setCreateOpen] = useState(autoOpenMode === 'create');
  const [scannerOpen, setScannerOpen] = useState(autoOpenMode === 'scanner');

  // Create Dispatch State
  const dispatchablePOs = purchaseOrders.filter(
    (p) => p.status === 'Confirmed' || p.status === 'Partially Delivered',
  );
  const [poId, setPoId] = useState(dispatchablePOs[0]?.id || purchaseOrders[0]?.id || '');
  const [transporter, setTransporter] = useState('VRL Logistics Express');
  const [vehicleNo, setVehicleNo] = useState('MH-14-GU-8821');
  const [lrNumber, setLrNumber] = useState('VRL-LR-449012');
  const [eWayBill, setEWayBill] = useState('EWB-271904481209');
  const [isPartial, setIsPartial] = useState(false);

  // QR Scanner & Gate Verification State
  const [scannedPayload, setScannedPayload] = useState(
    dispatches.find((d) => d.status === 'In Transit')?.qrPayload || dispatches[0]?.qrPayload || '',
  );
  const matchedDispatch =
    dispatches.find((d) => d.qrPayload === scannedPayload.trim()) ||
    dispatches.find((d) => d.dispatchNumber === scannedPayload.trim()) ||
    null;

  const [verifyItems, setVerifyItems] = useState<DeliveryItemCheck[]>(() => {
    const initialTarget = dispatches.find((d) => d.status === 'In Transit') || dispatches[0];
    return initialTarget
      ? initialTarget.items.map((it) => ({
          ...it,
          verifiedReceivedQty: it.verifiedReceivedQty || it.dispatchedQty,
        }))
      : [];
  });
  const [proofFilename, setProofFilename] = useState('Gate_GRN_POD_Signed.pdf');

  const openScannerFor = (dsp?: DeliveryDispatch) => {
    const target = dsp || dispatches.find((d) => d.status === 'In Transit') || dispatches[0];
    if (target) {
      setScannedPayload(target.qrPayload);
      setVerifyItems(
        target.items.map((it) => ({
          ...it,
          verifiedReceivedQty: it.verifiedReceivedQty || it.dispatchedQty,
        })),
      );
    }
    setScannerOpen(true);
  };

  React.useEffect(() => {
    if (autoOpenMode === 'scanner') {
      openScannerFor();
      onConsumeAutoOpen?.();
    } else if (autoOpenMode === 'create') {
      setCreateOpen(true);
      onConsumeAutoOpen?.();
    }
  }, [autoOpenMode]);

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    const dspNum = `DSP-2026-${4430 + dispatches.length}`;
    const newDispatch: DeliveryDispatch = {
      id: `dsp-${Date.now()}`,
      dispatchNumber: dspNum,
      poId: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      buyerName: po.buyerName,
      dispatchDate: new Date().toISOString().slice(0, 10),
      etaDate: po.expectedDeliveryDate,
      transporterName: transporter,
      vehicleNumber: vehicleNo,
      lrNumber,
      eWayBillNumber: eWayBill,
      qrPayload: `TP-QR|${dspNum}|${po.poNumber}|27AAACB4829K1Z5|CHK:${Math.floor(1000 + Math.random() * 8999)}`,
      status: 'In Transit',
      isPartialDispatch: isPartial,
      proofFiles: [`EWayBill_${eWayBill}.pdf`],
      items: po.items.map((li) => ({
        lineItemId: li.id,
        name: li.name,
        unit: li.unit,
        dispatchedQty: isPartial ? Math.max(1, Math.floor(li.orderedQty * 0.6)) : li.orderedQty,
        verifiedReceivedQty: 0,
        condition: 'Intact',
      })),
    };
    onCreateDispatch(newDispatch);
    setCreateOpen(false);
    setSelectedDispatch(newDispatch);
  };

  const hasShortageOrDamage = verifyItems.some(
    (it) => it.verifiedReceivedQty < it.dispatchedQty || it.condition !== 'Intact',
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Delivery Management & QR Gate Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate dispatch QR passes with E-Way Bills, scan arrivals at warehouse gates, and verify partial or full counts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openScannerFor()}>
            <ScanLine className="w-4 h-4" />
            QR Gate Scanner
          </Button>
          {perspective === 'supplier' && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Truck className="w-4 h-4" />
              Create Dispatch & QR
            </Button>
          )}
          {perspective === 'buyer' && (
            <Button size="sm" onClick={() => openScannerFor()}>
              <QrCode className="w-4 h-4" />
              Verify Incoming Shipment
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={dispatches}
        keyExtractor={(d) => d.id}
        onRowClick={(d) => setSelectedDispatch(d)}
        columns={[
          {
            key: 'dsp',
            header: 'Dispatch & PO',
            render: (d) => (
              <div>
                <div className="font-mono font-semibold text-slate-900">{d.dispatchNumber}</div>
                <div className="font-mono text-[11px] text-slate-500">{d.poNumber}</div>
              </div>
            ),
          },
          {
            key: 'transporter',
            header: 'Carrier & Vehicle',
            render: (d) => (
              <div className="text-xs">
                <div className="font-medium text-slate-800">{d.transporterName}</div>
                <div className="font-mono text-[11px] text-slate-500">
                  {d.vehicleNumber} · {d.eWayBillNumber}
                </div>
              </div>
            ),
          },
          {
            key: 'eta',
            header: 'Dispatch / ETA',
            render: (d) => (
              <div className="text-xs text-slate-600">
                <div>Sent {formatDate(d.dispatchDate)}</div>
                <div>ETA {formatDate(d.etaDate)}</div>
              </div>
            ),
          },
          {
            key: 'type',
            header: 'Mode',
            render: (d) => (
              <span className="text-xs text-slate-700">
                {d.isPartialDispatch ? 'Partial Lot' : 'Full Lot'}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Verification Status',
            render: (d) => <StatusBadge status={d.status} />,
          },
          {
            key: 'action',
            header: 'Gate Action',
            align: 'right',
            render: (d) => (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openScannerFor(d);
                }}
              >
                <QrCode className="w-3.5 h-3.5" />
                Verify QR
              </Button>
            ),
          },
        ]}
      />

      {/* Dispatch Details & QR Pass Drawer */}
      <Drawer
        open={Boolean(selectedDispatch)}
        onClose={() => setSelectedDispatch(null)}
        title={selectedDispatch ? `Dispatch ${selectedDispatch.dispatchNumber}` : ''}
        subtitle={selectedDispatch ? `Bound to ${selectedDispatch.poNumber}` : ''}
      >
        {selectedDispatch && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200 rounded-xl p-5 bg-slate-50">
              <div className="space-y-2 text-xs">
                <StatusBadge status={selectedDispatch.status} />
                <div className="font-semibold text-slate-900 text-sm pt-1">
                  {selectedDispatch.transporterName}
                </div>
                <div className="font-mono text-slate-600">Vehicle: {selectedDispatch.vehicleNumber}</div>
                <div className="font-mono text-slate-600">LR No: {selectedDispatch.lrNumber}</div>
                <div className="font-mono text-slate-600">E-Way Bill: {selectedDispatch.eWayBillNumber}</div>
                {selectedDispatch.verifiedBy && (
                  <div className="text-emerald-700 font-medium pt-1">
                    Verified by {selectedDispatch.verifiedBy} at {selectedDispatch.verifiedAt}
                  </div>
                )}
              </div>
              <QrCodeSvg payload={selectedDispatch.qrPayload} size={140} />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Manifest Item</th>
                    <th className="px-3 py-2.5 text-right">Dispatched</th>
                    <th className="px-3 py-2.5 text-right">Verified Received</th>
                    <th className="px-3 py-2.5 text-right">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {selectedDispatch.items.map((item) => (
                    <tr key={item.lineItemId}>
                      <td className="px-3 py-2.5 font-medium text-slate-900">{item.name}</td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        {item.dispatchedQty} {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        {item.verifiedReceivedQty}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <StatusBadge status={item.condition} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-900">Uploaded Delivery Proofs & POD</div>
              <div className="flex flex-wrap gap-2">
                {selectedDispatch.proofFiles.map((file) => (
                  <span
                    key={file}
                    className="font-mono text-xs bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => openScannerFor(selectedDispatch)}>
                <ScanLine className="w-4 h-4" />
                Open Gate Quantity Verification
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Dispatch Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Dispatch & Generate QR Pass"
        subtitle="Bind transporter details and E-Way Bill to a confirmed Purchase Order"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDispatch} className="space-y-4">
          <Select
            label="Confirmed Purchase Order"
            value={poId}
            onChange={(e) => setPoId(e.target.value)}
            options={purchaseOrders.map((po) => ({
              label: `${po.poNumber} — ${po.buyerName} (${po.status})`,
              value: po.id,
            }))}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Transporter Name"
              required
              value={transporter}
              onChange={(e) => setTransporter(e.target.value)}
            />
            <Input
              label="Vehicle Registration Number"
              required
              className="font-mono uppercase"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Lorry Receipt (LR) Number"
              required
              className="font-mono"
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
            />
            <Input
              label="GST E-Way Bill Number"
              required
              className="font-mono"
              value={eWayBill}
              onChange={(e) => setEWayBill(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPartial}
              onChange={(e) => setIsPartial(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>Dispatch as Partial Lot (60% initial shipment; balance follows later)</span>
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Generate Dispatch & QR Code</Button>
          </div>
        </form>
      </Modal>

      {/* QR Scanner & Quantity Verification Modal */}
      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Warehouse QR Scanner & Quantity Verification"
        subtitle="Scan dispatch QR pass at receiving gate to record physical counts and POD evidence"
        maxWidth="xl"
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8">
              <Input
                label="QR Payload or Dispatch ID"
                className="font-mono text-xs"
                value={scannedPayload}
                onChange={(e) => {
                  setScannedPayload(e.target.value);
                  const found =
                    dispatches.find((d) => d.qrPayload === e.target.value.trim()) ||
                    dispatches.find((d) => d.dispatchNumber === e.target.value.trim());
                  if (found) {
                    setVerifyItems(
                      found.items.map((it) => ({
                        ...it,
                        verifiedReceivedQty: it.verifiedReceivedQty || it.dispatchedQty,
                      })),
                    );
                  }
                }}
              />
            </div>
            <div className="sm:col-span-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const target = dispatches.find((d) => d.status === 'In Transit') || dispatches[0];
                  if (target) {
                    setScannedPayload(target.qrPayload);
                    setVerifyItems(
                      target.items.map((it) => ({
                        ...it,
                        verifiedReceivedQty: it.dispatchedQty,
                        condition: 'Intact',
                      })),
                    );
                  }
                }}
              >
                <Camera className="w-4 h-4" />
                Simulate Gate QR Scan
              </Button>
            </div>
          </div>

          {matchedDispatch ? (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    {matchedDispatch.dispatchNumber} · {matchedDispatch.poNumber}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    From {matchedDispatch.supplierName} · Vehicle {matchedDispatch.vehicleNumber}
                  </div>
                </div>
                <StatusBadge status={matchedDispatch.status} />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Line Item</th>
                      <th className="px-3 py-2 text-right">Dispatched</th>
                      <th className="px-3 py-2 text-right">Physical Count</th>
                      <th className="px-3 py-2 text-left">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verifyItems.map((it, idx) => (
                      <tr key={it.lineItemId}>
                        <td className="px-3 py-2.5 font-medium text-slate-900">{it.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {it.dispatchedQty} {it.unit}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            max={it.dispatchedQty}
                            value={it.verifiedReceivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const next = [...verifyItems];
                              next[idx].verifiedReceivedQty = val;
                              if (val < next[idx].dispatchedQty && next[idx].condition === 'Intact') {
                                next[idx].condition = 'Shortage';
                              } else if (val === next[idx].dispatchedQty) {
                                next[idx].condition = 'Intact';
                              }
                              setVerifyItems(next);
                            }}
                            className="w-20 h-8 rounded border border-slate-300 px-2 text-right font-mono"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <select
                            value={it.condition}
                            onChange={(e) => {
                              const next = [...verifyItems];
                              next[idx].condition = e.target.value as DeliveryItemCheck['condition'];
                              setVerifyItems(next);
                            }}
                            className="h-8 rounded border border-slate-300 px-2 text-xs bg-white"
                          >
                            <option value="Intact">Intact</option>
                            <option value="Shortage">Shortage</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Incorrect">Incorrect Item</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <FileUp className="w-4 h-4 text-slate-500 shrink-0" />
                <Input
                  label="Signed POD / Gate Photo Reference"
                  className="flex-1 font-mono text-xs"
                  value={proofFilename}
                  onChange={(e) => setProofFilename(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-600">
                  {hasShortageOrDamage
                    ? 'Mismatch detected: accepting will record partial GRN & flag 3-way invoice check.'
                    : 'Quantities match manifest 100%.'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setScannerOpen(false)}>
                    Cancel
                  </Button>
                  {hasShortageOrDamage ? (
                    <Button
                      onClick={() => {
                        onVerifyDelivery(matchedDispatch.id, verifyItems, proofFilename, true);
                        setScannerOpen(false);
                      }}
                    >
                      Accept Partial & Log Discrepancy
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        onVerifyDelivery(matchedDispatch.id, verifyItems, proofFilename, false);
                        setScannerOpen(false);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Accept Delivery
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-600 border border-red-200 bg-red-50 rounded-lg p-4">
              No dispatch matched the entered QR payload. Use &ldquo;Simulate Gate QR Scan&rdquo; to load an active shipment.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
