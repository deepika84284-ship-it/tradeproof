import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Factory,
  FileCheck2,
  Lock,
  Menu,
  QrCode,
  Scale,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { INDUSTRY_FIELD_CONFIGS } from '../../data/mockData';
import { IndustryType } from '../../types/tradeproof';
import { BrandLogo } from '../ui/BrandLogo';
import { Button, Input, Textarea } from '../ui/DesignSystem';

import heroImage from '../../assets/images/hero_tradeproof_logistics_1794640508992.jpg';
import manufacturingImage from '../../assets/images/industry_manufacturing_1794640509697.jpg';
import textilesImage from '../../assets/images/industry_textiles_1794640509566.jpg';

export type PublicPage =
  | 'landing'
  | 'overview'
  | 'features'
  | 'industries'
  | 'pricing'
  | 'about'
  | 'contact';

interface PublicSiteProps {
  activePage: PublicPage;
  onNavigatePage: (page: PublicPage) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onQuickLaunchApp: (perspective: 'buyer' | 'supplier' | 'admin') => void;
  onOpenBlueprint: () => void;
}

const LIFECYCLE_STEPS = [
  { step: '01', title: 'Business Registration', desc: 'GSTIN, PAN, and Udyam/CIN entity verification.' },
  { step: '02', title: 'Company Connection', desc: 'Mutual buyer-supplier invitations with agreed credit terms.' },
  { step: '03', title: 'Purchase Order', desc: 'Industry-configured line items, HSN/SAC codes, and GST split.' },
  { step: '04', title: 'Supplier Confirmation', desc: 'Formal acceptance locking terms against silent edits.' },
  { step: '05', title: 'Dispatch & QR Pass', desc: 'E-Way Bill binding with cryptographic dispatch QR generation.' },
  { step: '06', title: 'Delivery Verification', desc: 'Gate QR scan, quantity check, POD upload, and partial GRN.' },
  { step: '07', title: '3-Way Invoice Match', desc: 'Automated comparison across PO, verified delivery, and tax invoice.' },
  { step: '08', title: 'Dispute Resolution', desc: 'Time-stamped shortage/damage claims with immutable evidence.' },
  { step: '09', title: 'Payment Tracking', desc: 'UTR/NEFT/RTGS ledger confirmations and partial payment history.' },
  { step: '10', title: 'Transaction Closure', desc: 'Complete audit trail archived for GST and statutory reconciliation.' },
];

const INDUSTRY_LIST: {
  name: IndustryType;
  summary: string;
  workflowFocus: string;
  image?: string;
}[] = [
  {
    name: 'Manufacturing',
    summary: 'Raw material procurement, CNC job-work, and OEM component assemblies with MTC & revision control.',
    workflowFocus: 'CAD revision lock, heat batch traceability, and partial gate receipts.',
    image: manufacturingImage,
  },
  {
    name: 'Textile & Garments',
    summary: 'Yarn, grey fabric, dyeing, and apparel export supply chains across Surat, Tiruppur, and Ludhiana.',
    workflowFocus: 'GSM & dye-lot verification, roll-wise shortage tracking, and shrinkage tolerances.',
    image: textilesImage,
  },
  {
    name: 'Wholesale & Distribution',
    summary: 'High-volume FMCG, pharma, and industrial stockists managing multi-warehouse replenishment.',
    workflowFocus: 'Receiving bay scheduling, shelf-life validation, and master carton counts.',
  },
  {
    name: 'Construction',
    summary: 'Steel, cement, ready-mix, and MEP contractors coordinating multi-site infrastructure deliveries.',
    workflowFocus: 'BOQ site codes, weighbridge slip uploads, and grade test certificates.',
  },
  {
    name: 'Retail',
    summary: 'Regional retail chains and D2C brands coordinating seasonal vendor drops and barcode compliance.',
    workflowFocus: 'Store cluster routing, EAN-13 pre-tagging checks, and debit-note reconciliation.',
  },
  {
    name: 'IT & Professional Services',
    summary: 'System integrators, cloud infrastructure, and enterprise B2B service milestones.',
    workflowFocus: 'MSA/SOW linking, UAT milestone sign-offs, and SAC-coded service invoicing.',
  },
  {
    name: 'SME & MSME',
    summary: 'Flexible transaction accountability for India’s MSMEs managing 45-day statutory payment cycles.',
    workflowFocus: 'Udyam priority flagging, automated payment due alerts, and shared GST ledger.',
  },
];

export const PublicSite: React.FC<PublicSiteProps> = ({
  activePage,
  onNavigatePage,
  onOpenAuth,
  onQuickLaunchApp,
  onOpenBlueprint,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('Manufacturing');
  const [previewTab, setPreviewTab] = useState<'po' | 'qr' | 'match'>('po');
  const [contactForm, setContactForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [contactError, setContactError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.includes('@') || !contactForm.message.trim()) {
      setContactError('Please enter your name, a valid business email, and your inquiry details.');
      return;
    }
    setContactError('');
    setContactSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => onNavigatePage('landing')}
            className="cursor-pointer focus-visible:outline-none"
          >
            <BrandLogo />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {(
              [
                ['overview', 'Platform'],
                ['features', 'Capabilities'],
                ['industries', 'Industries'],
                ['pricing', 'Pricing'],
                ['contact', 'Contact'],
              ] as [PublicPage, string][]
            ).map(([pageId, label]) => (
              <button
                key={pageId}
                type="button"
                onClick={() => onNavigatePage(pageId)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                  activePage === pageId
                    ? 'text-slate-950 border-blue-700'
                    : 'border-transparent hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => onOpenAuth('login')}
            >
              Sign In
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2">
            {(
              [
                ['landing', 'Home'],
                ['overview', 'Platform'],
                ['features', 'Capabilities'],
                ['industries', 'Industries'],
                ['pricing', 'Pricing'],
                ['about', 'Company'],
                ['contact', 'Contact'],
              ] as [PublicPage, string][]
            ).map(([pageId, label]) => (
              <button
                key={pageId}
                type="button"
                onClick={() => {
                  onNavigatePage(pageId);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-700 cursor-pointer"
              >
                {label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Button className="w-full" onClick={() => onOpenAuth('login')}>
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        {(activePage === 'landing' || activePage === 'overview') && (
          <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-12 gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-4">
                  <span>Enterprise B2B Settlement Platform</span>
                  <span aria-hidden="true">·</span>
                  <span>GST & E-Way Bill Ready</span>
                </div>
                <h1
                  className="font-display font-bold tracking-tight text-slate-950 leading-[1.1] text-balance"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)' }}
                >
                  Every B2B transaction. Connected. Verified. Accountable.
                </h1>
                <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                  Unify procurement, warehouse receiving, and accounts payable in one shared ledger. TradeProof links Purchase Orders, QR-verified dispatches, 3-way invoice matching, dispute evidence, and UTR payment confirmations for Indian enterprises.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={() => onOpenAuth('signup')}>
                    Get Started for Your Company
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => onQuickLaunchApp('buyer')}>
                    Explore Live Workspace
                  </Button>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-950 text-lg tabular-nums">10 Stages</div>
                    <div className="text-slate-500 mt-0.5">Immutable audit trail</div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-950 text-lg tabular-nums">3-Way Match</div>
                    <div className="text-slate-500 mt-0.5">PO vs Gate GRN vs Invoice</div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-950 text-lg tabular-nums">Zero Leakage</div>
                    <div className="text-slate-500 mt-0.5">QR-verified receiving</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex">
                <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 relative min-h-[340px] shadow-md">
                  <img
                    src={heroImage}
                    alt="Indian industrial supply chain and verified dispatch operations"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent flex flex-col justify-end p-7">
                    <div className="border border-white/15 bg-slate-950/75 backdrop-blur-md rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">DSP-2026-4410 · MIDC Chakan Gate 2</span>
                        <span className="font-mono text-emerald-400 font-medium">QR Verified</span>
                      </div>
                      <div className="text-sm font-medium text-white">
                        185 / 200 Boxes Verified · Auto-flagged 15-box shortage (₹42,480 held from AP release)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Commercial Product Window Preview */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg shadow-slate-200/50">
                {/* Realistic SaaS Application Window Chrome */}
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <BrandLogo dark size="sm" />
                    <span className="hidden sm:inline text-xs text-slate-400 font-mono">
                      Bharat Precision Components Pvt Ltd · GSTIN 27AAACB4829K1Z5
                    </span>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                    {(
                      [
                        ['po', 'Purchase Order'],
                        ['qr', 'QR Gate Verification'],
                        ['match', '3-Way Invoice Match'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreviewTab(id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          previewTab === id
                            ? 'bg-blue-700 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/40">
                  {previewTab === 'po' && (
                    <div className="grid md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-8 space-y-3 bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-sm font-semibold text-slate-950">
                              PO-2026-0841 · Version 1 (Locked)
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Supplier: Shakti Industrial Fasteners & Alloys · Net 30 Days
                            </div>
                          </div>
                          <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                            Partially Delivered
                          </span>
                        </div>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                              <tr>
                                <th className="px-3 py-2.5 text-left">Line Item & HSN</th>
                                <th className="px-3 py-2.5 text-right">Ordered</th>
                                <th className="px-3 py-2.5 text-right">Gate Verified</th>
                                <th className="px-3 py-2.5 text-right">Taxable Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 tabular-nums">
                              <tr>
                                <td className="px-3 py-3 font-medium text-slate-900">
                                  M16x60 Hex Flange Bolt (SS316L)
                                  <div className="font-mono text-[11px] text-slate-400">HSN 73181500 · GST 18%</div>
                                </td>
                                <td className="px-3 py-3 text-right">200 Boxes</td>
                                <td className="px-3 py-3 text-right text-red-700 font-semibold">185 Boxes</td>
                                <td className="px-3 py-3 text-right font-mono">₹4,80,000.00</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-3 font-medium text-slate-900">
                                  M16 Nylock Self-Locking Nut (Gr 8.8)
                                  <div className="font-mono text-[11px] text-slate-400">HSN 73181600 · GST 18%</div>
                                </td>
                                <td className="px-3 py-3 text-right">150 Boxes</td>
                                <td className="px-3 py-3 text-right text-emerald-700 font-semibold">150 Boxes</td>
                                <td className="px-3 py-3 text-right font-mono">₹2,77,500.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="md:col-span-4 border border-slate-200 rounded-xl p-5 bg-white space-y-3 text-xs">
                        <div className="font-semibold text-slate-900">Manufacturing Schema Attributes</div>
                        <div className="space-y-2 pt-1">
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">CAD Revision</span>
                            <span className="font-mono font-medium text-slate-900">REV-4.2-CNC</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Alloy Heat Batch</span>
                            <span className="font-mono font-medium text-slate-900">SS316L-B204</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-slate-500">QC Standard</span>
                            <span className="font-mono font-medium text-slate-900">ISO 2768-mK</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-2" onClick={() => onQuickLaunchApp('buyer')}>
                          Open Full Order Workspace
                        </Button>
                      </div>
                    </div>
                  )}

                  {previewTab === 'qr' && (
                    <div className="grid md:grid-cols-3 gap-6 items-center bg-white border border-slate-200 rounded-xl p-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <QrCode className="w-4 h-4 text-blue-700" />
                          <span>Dispatch Pass DSP-2026-4410</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Generated upon supplier dispatch with E-Way Bill EWB-331894021754. Warehouse teams scan at the receiving gate to lock physical counts prior to invoice approval.
                        </p>
                      </div>
                      <div className="text-xs space-y-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Vehicle / LR</span>
                          <span className="font-mono text-slate-900">HR-38-AB-7742</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gate Verified By</span>
                          <span className="text-slate-900">Sandeep Nair</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gate Discrepancy</span>
                          <span className="font-medium text-red-700">-15 Boxes Flagged</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => onQuickLaunchApp('supplier')}>
                          Open Supplier Dispatch Console
                        </Button>
                      </div>
                    </div>
                  )}

                  {previewTab === 'match' && (
                    <div className="grid md:grid-cols-4 gap-4 items-center text-xs bg-white border border-slate-200 rounded-xl p-5">
                      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="text-slate-500">1. Purchase Order</div>
                        <div className="font-mono font-bold text-base text-slate-950 mt-1 tabular-nums">
                          ₹8,93,850.00
                        </div>
                      </div>
                      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="text-slate-500">2. Verified Gate GRN</div>
                        <div className="font-mono font-bold text-base text-amber-700 mt-1 tabular-nums">
                          ₹8,51,370.00
                        </div>
                      </div>
                      <div className="p-4 border border-red-200 bg-red-50/50 rounded-lg">
                        <div className="text-red-800 font-medium">3. Supplier Invoice</div>
                        <div className="font-mono font-bold text-base text-red-900 mt-1 tabular-nums">
                          ₹8,93,850.00
                        </div>
                        <div className="text-red-700 mt-1">Held Variance: ₹42,480.00</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => onQuickLaunchApp('buyer')}>
                          Inspect Dispute Evidence
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROBLEM & SOLUTION + CASE STUDY PROOF */}
        {(activePage === 'landing' || activePage === 'overview') && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200">
            <div className="max-w-2xl mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
                Why Indian B2B settlements stall—and how TradeProof enforces clarity
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-slate-200 rounded-2xl p-7 bg-slate-50/70">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Fragmented Coordination Today
                </h3>
                <ul className="space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Purchase orders sent as static PDFs while quantity revisions happen on WhatsApp.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Warehouse gates sign paper challans without alerting finance of short deliveries.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Disputes stall settlements for 45–90 days without timestamped proof.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Manual UTR payment follow-ups across spreadsheets with no shared ledger state.</span>
                  </li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-2xl p-7 bg-white shadow-xs">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  The TradeProof Ledger Workflow
                </h3>
                <ul className="space-y-3.5 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Confirmed POs lock against silent edits; changes require versioned amendments.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Every dispatch binds E-Way Bill and QR pass for instant gate partial/full GRN.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated 3-way matching surfaces quantity and rate variances before payout.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dual-party UTR confirmation closes every transaction with an exportable audit trail.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Adjacent Claim-to-Proof Enterprise Case Study */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-950 text-white p-8 grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-2">
                <div className="text-xs font-mono text-blue-400">Deployment Benchmark · Discrete Manufacturing</div>
                <h3 className="font-display text-xl font-bold">
                  How Chakan OEM plants cut invoice dispute resolution from 24 days to 48 hours
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  &ldquo;Before TradeProof, our accounts team chased warehouse gatekeepers on phone calls to verify whether a supplier short-shipped bolts. Now every pallet carries a QR manifest and our 3-way match catches shortages the minute the truck clears Gate 2.&rdquo;
                </p>
                <div className="text-xs text-slate-400 pt-1">
                  Raghavendra Kulkarni · Director of Operations, Bharat Precision Components Pvt Ltd (Pune)
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-2 gap-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/70">
                  <div className="font-mono text-2xl font-bold text-white tabular-nums">-68%</div>
                  <div className="text-xs text-slate-400 mt-1">AP reconciliation time over 6 months</div>
                </div>
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/70">
                  <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">99.4%</div>
                  <div className="text-xs text-slate-400 mt-1">GRN-to-invoice audit accuracy</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FEATURES */}
        {(activePage === 'landing' || activePage === 'features') && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                  01. Core Platform Capabilities
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                  Purpose-built modules engineered for Indian GST workflows, multi-company roles, and evidence-backed settlements.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onQuickLaunchApp('admin')}>
                Explore Admin Console
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Building2,
                  title: 'Verified Business Network',
                  desc: 'Connect via GSTIN/Udyam discovery, manage credit terms, and switch seamlessly across multiple group companies.',
                },
                {
                  icon: FileCheck2,
                  title: 'Versioned Purchase Orders',
                  desc: 'Industry-specific schemas with HSN/SAC tax calculation, formal supplier confirmation, and immutable amendment history.',
                },
                {
                  icon: QrCode,
                  title: 'QR Dispatch & Partial GRN',
                  desc: 'Bind E-Way Bills to QR passes, scan arrivals at the warehouse gate, and accept partial or short deliveries cleanly.',
                },
                {
                  icon: Scale,
                  title: '3-Way Invoice Matching',
                  desc: 'Compare PO rates, verified gate quantities, and uploaded tax invoices to surface discrepancies instantly.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Evidence-First Disputes',
                  desc: 'Raise shortage, damage, or rate claims with hashed photo/document evidence, threaded comments, and formal resolutions.',
                },
                {
                  icon: Truck,
                  title: 'AP/AR Payment Ledger',
                  desc: 'Track due schedules, overdue alerts, partial settlements, and UTR/NEFT/RTGS confirmations with dual-party visibility.',
                },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="border border-slate-200 rounded-2xl p-6 bg-white hover:border-slate-300 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-4 h-4 text-blue-700" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{feat.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INDUSTRIES */}
        {(activePage === 'landing' || activePage === 'industries') && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200">
            <div className="mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                02. One Unified Engine. Seven Indian Industry Workflows.
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Select an industry below to inspect its configurable order and verification fields.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {INDUSTRY_LIST.map((ind) => (
                <button
                  key={ind.name}
                  type="button"
                  onClick={() => setSelectedIndustry(ind.name)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedIndustry === ind.name
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {ind.name}
                </button>
              ))}
            </div>

            {(() => {
              const current = INDUSTRY_LIST.find((i) => i.name === selectedIndustry) || INDUSTRY_LIST[0];
              const fields = INDUSTRY_FIELD_CONFIGS[current.name];
              return (
                <div className="grid lg:grid-cols-12 gap-8 items-stretch border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{current.name}</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{current.summary}</p>
                      <p className="text-xs font-medium text-slate-800 mt-3">
                        Workflow Focus: <span className="font-normal text-slate-600">{current.workflowFocus}</span>
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-xl bg-white p-4">
                      <div className="text-xs font-semibold text-slate-900 mb-3">
                        Configurable PO & GRN Fields for {current.name}
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {fields.map((f) => (
                          <div key={f.key} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                            <div className="text-xs font-medium text-slate-800">{f.label}</div>
                            <div className="text-[11px] font-mono text-slate-500 mt-1">{f.placeholder}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    {current.image ? (
                      <div className="h-full min-h-[220px] rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={current.image}
                          alt={current.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-full min-h-[220px] rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
                        <Factory className="w-6 h-6 text-blue-700" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            Dynamic Schema Engine
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Company owners customize required metadata keys under Settings without engineering overhead.
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => onQuickLaunchApp('buyer')}>
                          Configure in Workspace
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* HOW IT WORKS */}
        {(activePage === 'landing' || activePage === 'overview') && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mb-8">
              03. The Complete 10-Stage Transaction Lifecycle
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {LIFECYCLE_STEPS.map((s) => (
                <div key={s.step} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="font-mono text-xs font-semibold text-blue-700">{s.step}</div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECURITY & TRUST */}
        {(activePage === 'landing' || activePage === 'about') && (
          <section className="bg-slate-950 text-white py-20">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="text-xs font-mono text-slate-400 mb-2">
                  Enterprise Governance & Compliance
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                  Built for statutory auditability, not informal chat logs
                </h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-2xl">
                  Every confirmation, gate scan, amendment, dispute upload, and UTR payment record writes an append-only audit entry tied to verified company members and role-based permissions.
                </p>
              </div>
              <div className="md:col-span-5 grid grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <Lock className="w-4 h-4 text-blue-400 mb-2" />
                  <div className="font-semibold text-white">Tenant Isolation</div>
                  <div className="text-slate-400 mt-1">Buyers & suppliers access only authorized transactions.</div>
                </div>
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-2" />
                  <div className="font-semibold text-white">Ledger-Only Payments</div>
                  <div className="text-slate-400 mt-1">Tracks NEFT/RTGS/UTR confirmations without holding funds.</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRICING */}
        {(activePage === 'landing' || activePage === 'pricing') && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200">
            <div className="mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Transparent Pricing for Growing Indian Enterprises
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Predictable monthly or annual billing in INR. Zero per-transaction commissions.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter MSME',
                  audience: 'For early-stage & small suppliers',
                  price: '₹2,499',
                  cadence: 'per month · billed annually',
                  limits: [
                    'Up to 100 active transactions / month',
                    '5 team members with role permissions',
                    'QR dispatch passes & POD uploads',
                    '1 company entity (GSTIN)',
                  ],
                  cta: 'Start MSME Trial',
                  featured: false,
                },
                {
                  name: 'Growth Business',
                  audience: 'For scaling manufacturers & distributors',
                  price: '₹7,999',
                  cadence: 'per month · billed annually',
                  limits: [
                    'Unlimited purchase orders & dispatches',
                    '25 team members + custom RBAC matrix',
                    'Automated 3-way invoice matching & disputes',
                    'Up to 3 connected group companies',
                  ],
                  cta: 'Start Growth Trial',
                  featured: true,
                },
                {
                  name: 'Enterprise Hub',
                  audience: 'For multi-plant procurement groups',
                  price: '₹24,999',
                  cadence: 'per month · custom SLA',
                  limits: [
                    'Unlimited group companies & warehouses',
                    'Dedicated FastAPI / ERP webhook sync',
                    'Custom industry field schemas & audit export',
                    'Priority GST & reconciliation onboarding',
                  ],
                  cta: 'Request Enterprise Demo',
                  featured: false,
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl border p-6 flex flex-col justify-between ${
                    tier.featured ? 'border-blue-700 bg-blue-50/20 shadow-sm' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-slate-500">{tier.audience}</div>
                    <h3 className="text-lg font-bold text-slate-950 mt-1">{tier.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="font-display text-3xl font-bold text-slate-950 tabular-nums">
                        {tier.price}
                      </span>
                      <span className="text-xs text-slate-500">+ GST</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{tier.cadence}</div>
                    <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                      {tier.limits.map((lim) => (
                        <li key={lim} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="mt-8 w-full"
                    variant={tier.featured ? 'primary' : 'outline'}
                    onClick={() => onOpenAuth('signup')}
                  >
                    {tier.cta}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABOUT US */}
        {activePage === 'about' && (
          <section className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="font-display text-3xl font-bold text-slate-950">About TradeProof</h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              TradeProof was designed to eliminate India’s B2B working-capital friction: when purchase orders, delivery proofs, and tax invoices live in disconnected silos, genuine businesses suffer delayed settlements and preventable disputes.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900">Design Philosophy</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Clarity over decoration. Every workflow enforces mutual verification between buyer, warehouse, supplier, and finance without forcing SMEs into rigid ERP complexity.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900">Technical Foundation</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Engineered for React + TypeScript on the client paired with FastAPI REST services, WebSockets, and MongoDB Atlas document-level audit persistence.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {(activePage === 'landing' || activePage === 'contact') && (
          <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-5">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                  Talk to our Enterprise Onboarding Team
                </h2>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Deploying TradeProof across multiple manufacturing plants or distributor hubs? Share your monthly volume and workflow requirements.
                </p>
                <div className="mt-6 space-y-2 text-xs text-slate-600">
                  <div>Mumbai · Pune · Bengaluru · Chennai · Surat</div>
                  <div className="font-mono text-slate-800">enterprise@tradeproof.in</div>
                </div>
              </div>
              <div className="md:col-span-7 border border-slate-200 rounded-2xl p-6 bg-white shadow-xs">
                {contactSent ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-semibold text-slate-900">Inquiry Received</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you, {contactForm.name}. Our enterprise solutions desk has logged your request for {contactForm.company || 'your organization'}.
                    </p>
                    <div className="pt-2">
                      <Button onClick={() => onQuickLaunchApp('buyer')}>Open Interactive Workspace</Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        required
                        placeholder="Raghavendra Kulkarni"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                      <Input
                        label="Company Name"
                        placeholder="Bharat Precision Components Pvt Ltd"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Business Email"
                        type="email"
                        required
                        placeholder="name@company.in"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+91 98200 00000"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                    <Textarea
                      label="Transaction Volume & Industry Notes"
                      rows={3}
                      required
                      placeholder="Monthly PO volume, warehouses, or ERP integration needs..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                    {contactError && <p className="text-xs text-red-600">{contactError}</p>}
                    <div className="flex justify-end">
                      <Button type="submit">Schedule Discovery Call</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Commercial Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <BrandLogo size="sm" />
            <p className="text-xs text-slate-500 mt-2">
              © 2026 TradeProof Technologies Pvt. Ltd. · B2B Transaction & Settlement Intelligence
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <button type="button" onClick={() => onNavigatePage('overview')} className="hover:text-slate-950 cursor-pointer">
              Platform
            </button>
            <button type="button" onClick={() => onNavigatePage('industries')} className="hover:text-slate-950 cursor-pointer">
              Industries
            </button>
            <button type="button" onClick={() => onNavigatePage('pricing')} className="hover:text-slate-950 cursor-pointer">
              Pricing
            </button>
            <button type="button" onClick={() => onNavigatePage('about')} className="hover:text-slate-950 cursor-pointer">
              Company
            </button>
            <button type="button" onClick={onOpenBlueprint} className="text-slate-600 hover:text-blue-700 cursor-pointer">
              Developers & API Docs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
