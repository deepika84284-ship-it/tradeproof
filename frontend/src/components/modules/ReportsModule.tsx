import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  Company,
  DeliveryDispatch,
  DisputeRecord,
  InvoiceRecord,
  PaymentEntry,
  PurchaseOrder,
} from '../../types/tradeproof';
import { exportToCsv, formatCompactINR, formatINR } from '../../utils/formatters';
import { Button, DataTable, StatusBadge, Tabs } from '../ui/DesignSystem';

interface ReportsModuleProps {
  companies: Company[];
  purchaseOrders: PurchaseOrder[];
  dispatches: DeliveryDispatch[];
  invoices: InvoiceRecord[];
  disputes: DisputeRecord[];
  payments: PaymentEntry[];
  onExportSuccess: (filename: string) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  companies,
  purchaseOrders,
  dispatches,
  invoices,
  disputes,
  payments,
  onExportSuccess,
}) => {
  const [tab, setTab] = useState('transactions');

  const handleExport = () => {
    if (tab === 'transactions') {
      exportToCsv(
        'tradeproof_transactions_report.csv',
        purchaseOrders.map((po) => ({
          PONumber: po.poNumber,
          Buyer: po.buyerName,
          Supplier: po.supplierName,
          Industry: po.industry,
          GrandTotalINR: po.grandTotal,
          Status: po.status,
          ExpectedDelivery: po.expectedDeliveryDate,
        })),
      );
      onExportSuccess('tradeproof_transactions_report.csv');
    } else if (tab === 'performance') {
      exportToCsv(
        'tradeproof_partner_performance.csv',
        companies.map((c) => ({
          Company: c.name,
          GSTIN: c.gstin,
          Industry: c.industry,
          OnTimeRatePct: c.onTimeRate,
          DisputeRatePct: c.disputeRate,
          AvgSettlementDays: c.avgSettlementDays,
        })),
      );
      onExportSuccess('tradeproof_partner_performance.csv');
    } else {
      exportToCsv(
        'tradeproof_financial_reconciliation.csv',
        invoices.map((i) => ({
          InvoiceNumber: i.invoiceNumber,
          PONumber: i.poNumber,
          InvoicedTotalINR: i.invoicedTotal,
          DeliveredValueINR: i.deliveredValue,
          MatchStatus: i.matchStatus,
          ApprovalStatus: i.status,
        })),
      );
      onExportSuccess('tradeproof_financial_reconciliation.csv');
    }
  };

  const totalOrderVolume = purchaseOrders.reduce((s, p) => s + p.grandTotal, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.invoicedTotal, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalDisputedValue = disputes.reduce((s, d) => s + d.claimedImpactInr, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950 tracking-tight">
            Reports & Settlement Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Transaction lifecycle velocity, supplier/buyer reliability, 3-way match rates, and CSV exports.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export CSV Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross PO Value', value: formatCompactINR(totalOrderVolume) },
          { label: 'Total Invoiced Value', value: formatCompactINR(totalInvoiced) },
          { label: 'Settled & Confirmed', value: formatCompactINR(totalCollected) },
          { label: 'Disputed Exposure', value: formatCompactINR(totalDisputedValue) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">{stat.label}</div>
            <div className="font-display text-2xl font-bold text-slate-950 mt-1.5 tabular-nums">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'transactions', label: 'Transaction & Delivery Analytics' },
          { id: 'performance', label: 'Supplier & Buyer Performance' },
          { id: 'financial', label: 'Invoice, Dispute & Payment Analytics' },
        ]}
      />

      {tab === 'transactions' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Purchase Order Stage Breakdown</h2>
              {[
                { label: 'Confirmed / Active', count: purchaseOrders.filter((p) => p.status === 'Confirmed').length },
                { label: 'Dispatched / In Transit', count: purchaseOrders.filter((p) => p.status === 'Dispatched').length },
                { label: 'Partially Delivered', count: purchaseOrders.filter((p) => p.status === 'Partially Delivered').length },
                { label: 'Pending Confirmation', count: purchaseOrders.filter((p) => p.status === 'Pending Supplier Confirmation').length },
              ].map((row) => {
                const pct = Math.round((row.count / Math.max(1, purchaseOrders.length)) * 100);
                return (
                  <div key={row.label} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-700">{row.label}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {row.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Delivery Verification Accuracy</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-lg p-3.5">
                  <div className="text-slate-500">Total Dispatches Tracked</div>
                  <div className="font-mono text-xl font-bold text-slate-900 mt-1 tabular-nums">
                    {dispatches.length}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3.5">
                  <div className="text-slate-500">QR Gate Discrepancies</div>
                  <div className="font-mono text-xl font-bold text-red-700 mt-1 tabular-nums">
                    {dispatches.filter((d) => d.status === 'Discrepancy Reported').length}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                QR gate verification catches physical quantity variances prior to accounts payable approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <DataTable
          data={companies}
          keyExtractor={(c) => c.id}
          columns={[
            {
              key: 'name',
              header: 'Trading Partner',
              render: (c) => (
                <div>
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">{c.industry} · {c.city}</div>
                </div>
              ),
            },
            {
              key: 'ontime',
              header: 'On-Time Delivery',
              align: 'right',
              render: (c) => <span className="font-mono font-semibold text-emerald-700">{c.onTimeRate}%</span>,
            },
            {
              key: 'dispute',
              header: 'Dispute Rate',
              align: 'right',
              render: (c) => <span className="font-mono text-slate-800">{c.disputeRate}%</span>,
            },
            {
              key: 'days',
              header: 'Avg Settlement',
              align: 'right',
              render: (c) => <span className="font-mono text-slate-800">{c.avgSettlementDays} days</span>,
            },
            {
              key: 'status',
              header: 'KYB Status',
              render: (c) => <StatusBadge status={c.verificationStatus} />,
            },
          ]}
        />
      )}

      {tab === 'financial' && (
        <DataTable
          data={invoices}
          keyExtractor={(i) => i.id}
          columns={[
            {
              key: 'inv',
              header: 'Invoice Number',
              render: (i) => <span className="font-mono font-semibold text-slate-900">{i.invoiceNumber}</span>,
            },
            {
              key: 'po',
              header: 'PO Value',
              align: 'right',
              render: (i) => <span className="font-mono">{formatINR(i.poAmount)}</span>,
            },
            {
              key: 'grn',
              header: 'Verified Delivery Value',
              align: 'right',
              render: (i) => <span className="font-mono">{formatINR(i.deliveredValue)}</span>,
            },
            {
              key: 'billed',
              header: 'Invoiced Value',
              align: 'right',
              render: (i) => <span className="font-mono font-semibold">{formatINR(i.invoicedTotal)}</span>,
            },
            {
              key: 'match',
              header: '3-Way Match',
              render: (i) => <StatusBadge status={i.matchStatus} />,
            },
          ]}
        />
      )}
    </div>
  );
};
