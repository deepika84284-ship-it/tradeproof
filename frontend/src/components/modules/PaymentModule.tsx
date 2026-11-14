import React, { useState } from 'react';
import { CheckCircle2, History, IndianRupee, Info } from 'lucide-react';
import { PaymentEntry, WorkspaceRole } from '../../types/tradeproof';
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

interface PaymentModuleProps {
  perspective: WorkspaceRole;
  payments: PaymentEntry[];
  onRecordPayment: (
    paymentId: string,
    amount: number,
    mode: PaymentEntry['mode'],
    utr: string,
  ) => void;
  onConfirmReceipt: (paymentId: string) => void;
}

export const PaymentModule: React.FC<PaymentModuleProps> = ({
  perspective,
  payments,
  onRecordPayment,
  onConfirmReceipt,
}) => {
  const [tab, setTab] = useState('all');
  const [selectedPay, setSelectedPay] = useState<PaymentEntry | null>(null);
  const [recordTarget, setRecordTarget] = useState<PaymentEntry | null>(null);

  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentEntry['mode']>('RTGS');
  const [utr, setUtr] = useState('HDFCR520261114992011');

  const filtered = payments.filter((p) => {
    if (tab === 'overdue') return p.status === 'Overdue';
    if (tab === 'partial') return p.status === 'Partially Paid';
    if (tab === 'settled') return p.status === 'Confirmed';
    return true;
  });

  const totalOutstanding = payments.reduce((sum, p) => sum + p.balanceRemaining, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOverdue = payments
    .filter((p) => p.status === 'Overdue')
    .reduce((sum, p) => sum + p.balanceRemaining, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            {perspective === 'supplier'
              ? 'Accounts Receivable & Settlement Ledger'
              : 'Accounts Payable & Payment Tracking'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Payment schedule, partial settlements, and dual-party UTR/NEFT/RTGS ledger confirmations.
          </p>
        </div>
      </div>

      {/* Regulatory Compliance Boundary Notice */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-900">Ledger Tracking Only:</strong> TradeProof records and verifies bank payment references (UTR, RTGS, NEFT, UPI B2B) between trading partners. It does not custody funds, process banking transfers, or issue credit/loans.
        </span>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">
            {perspective === 'supplier' ? 'Total Receivables Pending' : 'Total Payables Outstanding'}
          </div>
          <div className="font-display text-2xl font-bold text-slate-950 mt-1.5 tabular-nums">
            {formatINR(totalOutstanding)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Recorded & Confirmed Payments</div>
          <div className="font-display text-2xl font-bold text-emerald-700 mt-1.5 tabular-nums">
            {formatINR(totalPaid)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Overdue Exposure</div>
          <div className="font-display text-2xl font-bold text-red-700 mt-1.5 tabular-nums">
            {formatINR(totalOverdue)}
          </div>
        </div>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: 'All Schedules', count: payments.length },
          {
            id: 'overdue',
            label: 'Overdue',
            count: payments.filter((p) => p.status === 'Overdue').length,
          },
          {
            id: 'partial',
            label: 'Partial Payments',
            count: payments.filter((p) => p.status === 'Partially Paid').length,
          },
          {
            id: 'settled',
            label: 'Confirmed Settled',
            count: payments.filter((p) => p.status === 'Confirmed').length,
          },
        ]}
      />

      <DataTable
        data={filtered}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => setSelectedPay(p)}
        columns={[
          {
            key: 'ref',
            header: 'Ledger Ref & Invoice',
            render: (p) => (
              <div>
                <div className="font-mono font-semibold text-slate-900">{p.referenceId}</div>
                <div className="font-mono text-[11px] text-slate-500">
                  {p.invoiceNumber} · {p.poNumber}
                </div>
              </div>
            ),
          },
          {
            key: 'party',
            header: perspective === 'supplier' ? 'Payer (Buyer)' : 'Payee (Supplier)',
            render: (p) => (
              <span className="font-medium text-slate-800">
                {perspective === 'supplier' ? p.payerCompany : p.payeeCompany}
              </span>
            ),
          },
          {
            key: 'due',
            header: 'Due Date',
            render: (p) => <span className="text-xs text-slate-600">{formatDate(p.dueDate)}</span>,
          },
          {
            key: 'paid',
            header: 'Paid / Total',
            align: 'right',
            render: (p) => (
              <div className="font-mono text-xs">
                <div className="font-semibold text-slate-900">{formatINR(p.amountPaid)}</div>
                <div className="text-slate-500">of {formatINR(p.invoiceTotal)}</div>
              </div>
            ),
          },
          {
            key: 'balance',
            header: 'Balance Due',
            align: 'right',
            render: (p) => (
              <span className="font-mono font-semibold text-slate-900">{formatINR(p.balanceRemaining)}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (p) => <StatusBadge status={p.status} />,
          },
          {
            key: 'action',
            header: 'Action',
            align: 'right',
            render: (p) =>
              p.balanceRemaining > 0 && perspective === 'buyer' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecordTarget(p);
                    setPayAmount(String(p.balanceRemaining));
                  }}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Record UTR
                </Button>
              ) : p.amountPaid > 0 && !p.confirmedByPayee && perspective === 'supplier' ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmReceipt(p.id);
                  }}
                >
                  Confirm Receipt
                </Button>
              ) : (
                <span className="text-xs text-slate-400">View History</span>
              ),
          },
        ]}
      />

      {/* Payment History Drawer */}
      <Drawer
        open={Boolean(selectedPay)}
        onClose={() => setSelectedPay(null)}
        title={selectedPay ? `Payment Ledger · ${selectedPay.referenceId}` : ''}
        subtitle={selectedPay ? `${selectedPay.invoiceNumber} · ${selectedPay.poNumber}` : ''}
      >
        {selectedPay && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <StatusBadge status={selectedPay.status} />
              {selectedPay.balanceRemaining > 0 && perspective === 'buyer' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setRecordTarget(selectedPay);
                    setPayAmount(String(selectedPay.balanceRemaining));
                  }}
                >
                  Record Full or Partial Payment
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs tabular-nums">
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-slate-500">Invoice Total</div>
                <div className="font-mono font-bold text-slate-900 mt-1">
                  {formatINR(selectedPay.invoiceTotal)}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-slate-500">Paid So Far</div>
                <div className="font-mono font-bold text-emerald-700 mt-1">
                  {formatINR(selectedPay.amountPaid)}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-slate-500">Remaining</div>
                <div className="font-mono font-bold text-slate-900 mt-1">
                  {formatINR(selectedPay.balanceRemaining)}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <History className="w-4 h-4 text-blue-700" />
                <span>Payment Confirmation History</span>
              </div>
              {selectedPay.history.length === 0 ? (
                <p className="text-xs text-slate-500">No payment transfers recorded against this invoice yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPay.history.map((h, i) => (
                    <div key={i} className="border border-slate-100 bg-slate-50 rounded-lg p-3 text-xs flex justify-between">
                      <div>
                        <div className="font-mono font-semibold text-slate-900">
                          {h.mode} · UTR {h.utr}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Recorded by {h.recordedBy} on {formatDate(h.date)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-700 tabular-nums">
                        {formatINR(h.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Record UTR Payment Confirmation Modal */}
      <Modal
        open={Boolean(recordTarget)}
        onClose={() => setRecordTarget(null)}
        title="Record Payment Confirmation"
        subtitle={recordTarget ? `${recordTarget.invoiceNumber} · Balance ${formatINR(recordTarget.balanceRemaining)}` : ''}
        maxWidth="md"
      >
        {recordTarget && (
          <div className="space-y-4">
            <Input
              label="Amount Transferred (₹)"
              type="number"
              max={recordTarget.balanceRemaining}
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              hint="Enter less than remaining balance to log a partial payment."
            />
            <Select
              label="Settlement Mode"
              value={payMode}
              onChange={(e) => setPayMode(e.target.value as PaymentEntry['mode'])}
              options={[
                { label: 'RTGS', value: 'RTGS' },
                { label: 'NEFT', value: 'NEFT' },
                { label: 'IMPS', value: 'IMPS' },
                { label: 'UPI B2B', value: 'UPI B2B' },
                { label: 'Cheque / DD', value: 'Cheque' },
              ]}
            />
            <Input
              label="Bank UTR / Transaction Reference"
              required
              className="font-mono uppercase"
              value={utr}
              onChange={(e) => setUtr(e.target.value.toUpperCase())}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setRecordTarget(null)}>
                Cancel
              </Button>
              <Button
                disabled={!utr.trim() || Number(payAmount) <= 0}
                onClick={() => {
                  onRecordPayment(recordTarget.id, Number(payAmount), payMode, utr.trim());
                  setRecordTarget(null);
                  setSelectedPay(null);
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Payment Record
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
