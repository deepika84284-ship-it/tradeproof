import React, { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, MailCheck, ShieldCheck, UserPlus } from 'lucide-react';
import { IndustryType } from '../../types/tradeproof';
import { BrandLogo } from '../ui/BrandLogo';
import { Button, Input, Select, StatusBadge } from '../ui/DesignSystem';

export type AuthScreenMode =
  | 'login'
  | 'signup'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password'
  | 'create-company'
  | 'company-status'
  | 'join-company'
  | 'onboarding';

interface AuthScreensProps {
  initialMode: AuthScreenMode;
  onBackToSite: () => void;
  onCompleteAuth: (opts?: {
    perspective?: 'buyer' | 'supplier' | 'admin';
    newCompany?: { name: string; gstin: string; industry: IndustryType; city: string };
  }) => void;
}

const INDUSTRIES: { label: string; value: IndustryType }[] = [
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Wholesale & Distribution', value: 'Wholesale & Distribution' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Textile & Garments', value: 'Textile & Garments' },
  { label: 'Construction', value: 'Construction' },
  { label: 'IT & Professional Services', value: 'IT & Professional Services' },
  { label: 'SME & MSME', value: 'SME & MSME' },
];

export const AuthScreens: React.FC<AuthScreensProps> = ({
  initialMode,
  onBackToSite,
  onCompleteAuth,
}) => {
  const [mode, setMode] = useState<AuthScreenMode>(initialMode);
  const [email, setEmail] = useState('raghav.kulkarni@bharatprecision.in');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Raghavendra Kulkarni');
  const [otp, setOtp] = useState('482910');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('Manufacturing');
  const [city, setCity] = useState('Pune');
  const [inviteCode, setInviteCode] = useState('TP-INV-8842-PUNE');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid corporate email address.');
      return;
    }
    setError('');
    onCompleteAuth({ perspective: 'buyer' });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes('@')) {
      setError('Full name and business email are required.');
      return;
    }
    setError('');
    setMode('verify-email');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || gstin.trim().length < 15) {
      setError('Enter your registered Company Name and a valid 15-character GSTIN.');
      return;
    }
    setError('');
    setMode('company-status');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white">
      {/* Left Enterprise Trust Column */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950 text-white p-10 flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToSite}
            className="cursor-pointer focus-visible:outline-none"
          >
            <BrandLogo dark />
          </button>
          <div className="mt-14 space-y-4">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance">
              Accountable B2B settlements for modern Indian enterprises.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every Purchase Order, Gate QR scan, 3-way invoice match, dispute evidence file, and UTR confirmation—organized in one verifiable workspace.
            </p>
          </div>

          <div className="mt-10 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GSTIN & Udyam verified trading partner network</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-company entity switching & 5-tier RBAC</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Immutable versioned PO amendments & audit logs</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-slate-400">
          <p className="text-slate-300 leading-relaxed">
            &ldquo;TradeProof eliminated 90% of our month-end reconciliation disputes across 40+ Pune and Surat suppliers.&rdquo;
          </p>
          <div className="mt-2 font-medium text-white">Bharat Precision Components Pvt Ltd</div>
        </div>
      </div>

      {/* Right Focused Auth Surface */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white lg:bg-transparent lg:border-none">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-950 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </button>
          <div className="lg:hidden">
            <BrandLogo size="sm" />
          </div>
          <div className="text-xs text-slate-500">Secure Workspace Access</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-950">Sign in</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Access your connected Indian B2B entities and settlement ledger.
                  </p>
                </div>
                <Input
                  label="Work Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                  >
                    Create company account
                  </button>
                </div>
                <Button type="submit" className="w-full">
                  Sign In to Workspace
                </Button>
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    Role Perspective Quick Launch
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onCompleteAuth({ perspective: 'buyer' })}>
                      Buyer
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => onCompleteAuth({ perspective: 'supplier' })}>
                      Supplier
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => onCompleteAuth({ perspective: 'admin' })}>
                      Admin
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-950">Create Account</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Verify your work identity, then register or join a GST-verified company.
                  </p>
                </div>
                <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input
                  label="Business Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input label="Mobile Number (+91)" defaultValue="+91 98204 71920" />
                <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <Button type="submit" className="w-full">
                  Continue to Email Verification
                </Button>
                <div className="text-center text-xs text-slate-500">
                  Already registered?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-blue-700 font-medium hover:underline cursor-pointer">
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {mode === 'verify-email' && (
              <div className="space-y-4">
                <MailCheck className="w-8 h-8 text-blue-700" />
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-950">Verify your email</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter the 6-digit verification code sent to <span className="font-mono text-slate-900">{email}</span>.
                  </p>
                </div>
                <Input
                  label="6-Digit Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="font-mono tracking-widest"
                />
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => setMode('create-company')}>
                    Verify & Create Company
                  </Button>
                  <Button variant="outline" onClick={() => setMode('join-company')}>
                    Join Existing
                  </Button>
                </div>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className="space-y-4">
                <KeyRound className="w-8 h-8 text-slate-800" />
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-950">Reset password</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    We will email a secure reset link to your registered corporate inbox.
                  </p>
                </div>
                <Input label="Registered Work Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button className="w-full" onClick={() => setMode('reset-password')}>
                  Send Reset Link
                </Button>
              </div>
            )}

            {mode === 'reset-password' && (
              <div className="space-y-4">
                <h1 className="font-display text-xl font-bold text-slate-950">Set New Password</h1>
                <Input label="New Password" type="password" defaultValue="NewStrongPass@2026" />
                <Input label="Confirm New Password" type="password" defaultValue="NewStrongPass@2026" />
                <Button className="w-full" onClick={() => setMode('login')}>
                  Update Password & Sign In
                </Button>
              </div>
            )}

            {mode === 'create-company' && (
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-700" />
                  <h1 className="font-display text-xl font-bold text-slate-950">Register Company Entity</h1>
                </div>
                <Input
                  label="Legal Entity Name"
                  required
                  placeholder="e.g. Apex Forgings India Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    label="15-Digit GSTIN"
                    required
                    placeholder="27AAACA1234B1Z5"
                    className="font-mono uppercase"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  />
                  <Select
                    label="Primary Industry"
                    options={INDUSTRIES}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryType)}
                  />
                </div>
                <Input label="Operating City" value={city} onChange={(e) => setCity(e.target.value)} />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <Button type="submit" className="w-full">
                  Submit for Entity Verification
                </Button>
              </form>
            )}

            {mode === 'company-status' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-xl font-bold text-slate-950">Verification Status</h1>
                  <StatusBadge status="Pending Review" />
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entity</span>
                    <span className="font-semibold text-slate-900">
                      {companyName || 'Apex Forgings India Pvt Ltd'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN</span>
                    <span className="font-mono text-slate-900">{gstin || '27AAACA1234B1Z5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Industry Template</span>
                    <span className="text-slate-900">{industry}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setMode('onboarding')}>
                  Continue to Workspace Setup
                </Button>
              </div>
            )}

            {mode === 'join-company' && (
              <div className="space-y-4">
                <UserPlus className="w-7 h-7 text-blue-700" />
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-950">Join Existing Company</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter the invitation token shared by your company Owner.
                  </p>
                </div>
                <Input
                  label="Company Invite Code"
                  className="font-mono"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <Button className="w-full" onClick={() => onCompleteAuth({ perspective: 'buyer' })}>
                  Accept Invite & Open Workspace
                </Button>
              </div>
            )}

            {mode === 'onboarding' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-xl font-bold text-slate-950">Workspace Onboarding</h1>
                  <span className="font-mono text-xs text-slate-500">Step {wizardStep} of 3</span>
                </div>
                {wizardStep === 1 && (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>Confirm primary trade role for your organization:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-blue-700 bg-blue-50/30 rounded-lg p-3">
                        <div className="font-semibold text-slate-900 text-xs">Buyer Operations</div>
                        <div className="text-[11px] text-slate-500 mt-1">Issue POs, scan QR GRNs, approve invoices</div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-3">
                        <div className="font-semibold text-slate-900 text-xs">Supplier Operations</div>
                        <div className="text-[11px] text-slate-500 mt-1">Confirm POs, dispatch QR passes, track AR</div>
                      </div>
                    </div>
                  </div>
                )}
                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <Input label="Warehouse Lead Email" placeholder="gate.receiving@company.in" />
                    <Input label="Finance Controller Email" placeholder="ap.gst@company.in" />
                  </div>
                )}
                {wizardStep === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Industry Schema Configured ({industry})</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Custom PO fields, audit logging, and 3-way invoice matching rules are active.
                    </p>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    disabled={wizardStep === 1}
                    onClick={() => setWizardStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
                  >
                    Previous
                  </Button>
                  {wizardStep < 3 ? (
                    <Button onClick={() => setWizardStep((s) => ((s + 1) as 1 | 2 | 3))}>
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        onCompleteAuth({
                          perspective: 'buyer',
                          newCompany: companyName.trim()
                            ? { name: companyName.trim(), gstin: gstin || '27AAACA1234B1Z5', industry, city }
                            : undefined,
                        })
                      }
                    >
                      Enter TradeProof Workspace
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discreet Bottom Flow Switcher for testing all 9 Auth & Onboarding screens */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Auth Flows:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['login', 'Login'],
                ['signup', 'Sign Up'],
                ['verify-email', 'Verify Email'],
                ['forgot-password', 'Forgot'],
                ['reset-password', 'Reset'],
                ['create-company', 'Create Co.'],
                ['company-status', 'KYB Status'],
                ['join-company', 'Join Co.'],
                ['onboarding', 'Wizard'],
              ] as [AuthScreenMode, string][]
            ).map(([m, lbl]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setError('');
                  setMode(m);
                }}
                className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                  mode === m
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
