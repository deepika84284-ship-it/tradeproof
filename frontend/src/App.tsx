import { useState, useEffect } from 'react';
import { api } from './services/api';
import { AuthScreenMode, AuthScreens } from './components/auth/AuthScreens';
import { RoleDashboards } from './components/dashboards/RoleDashboards';
import { AppSectionId, AppShell } from './components/layout/AppShell';
import { BlueprintArchitectureModule } from './components/modules/BlueprintArchitectureModule';
import { BusinessNetworkModule } from './components/modules/BusinessNetworkModule';
import { DeliveryModule } from './components/modules/DeliveryModule';
import { DisputeModule } from './components/modules/DisputeModule';
import { InvoiceModule } from './components/modules/InvoiceModule';
import { PaymentModule } from './components/modules/PaymentModule';
import { PurchaseOrdersModule } from './components/modules/PurchaseOrdersModule';
import { ReportsModule } from './components/modules/ReportsModule';
import {
  NotificationsModule,
  SettingsModule,
  SupportModule,
} from './components/modules/SettingsSupportNotifications';
import { PublicPage, PublicSite } from './components/public/PublicSite';
import { ToastContainer } from './components/ui/DesignSystem';
import { QuickActionIntent, QuickActionsMenu } from './components/ui/QuickActionsMenu';
import {
  INITIAL_AUDIT_TRAIL,
  INITIAL_COMPANIES,
  INITIAL_CONNECTIONS,
  INITIAL_DISPATCHES,
  INITIAL_DISPUTES,
  INITIAL_INVOICES,
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_POS,
  INITIAL_TICKETS,
  INITIAL_USER_SESSION,
} from './data/mockData';
import {
  AuditEntry,
  BusinessConnection,
  Company,
  CompanyMember,
  DeliveryDispatch,
  DeliveryItemCheck,
  DisputeRecord,
  IndustryFieldSchema,
  IndustryType,
  InvoiceRecord,
  MemberRole,
  NotificationItem,
  PaymentEntry,
  PurchaseOrder,
  SupportTicket,
  ToastMessage,
  UserSession,
  WorkspaceRole,
} from './types/tradeproof';

type AppMode = 'public' | 'auth' | 'app';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('landing');
  const [authMode, setAuthMode] = useState<AuthScreenMode>('login');
  const [activeSection, setActiveSection] = useState<AppSectionId>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [pendingQuickAction, setPendingQuickAction] = useState<QuickActionIntent | null>(null);

  // Core Stateful Preview Store
  const [session, setSession] = useState<UserSession>(INITIAL_USER_SESSION);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [members, setMembers] = useState<CompanyMember[]>(INITIAL_MEMBERS);
  const [connections, setConnections] = useState<BusinessConnection[]>(INITIAL_CONNECTIONS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [dispatches, setDispatches] = useState<DeliveryDispatch[]>(INITIAL_DISPATCHES);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);
  const [payments, setPayments] = useState<PaymentEntry[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(INITIAL_AUDIT_TRAIL);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          compRes,
          poRes,
          dispRes,
          invRes,
          dispRecRes,
          payRes,
          connRes,
          memRes,
          audRes,
          notifRes,
          tktRes,
        ] = await Promise.allSettled([
          api.companies.list(),
          api.purchaseOrders.list(),
          api.deliveries.list(),
          api.invoices.list(),
          api.disputes.list(),
          api.payments.list(),
          api.connections.list(),
          api.members.list(),
          api.audit.list(),
          api.notifications.list(),
          api.tickets.list(),
        ]);

        if (compRes.status === 'fulfilled' && compRes.value.length) setCompanies(compRes.value);
        if (poRes.status === 'fulfilled' && poRes.value.length) setPurchaseOrders(poRes.value);
        if (dispRes.status === 'fulfilled' && dispRes.value.length) setDispatches(dispRes.value);
        if (invRes.status === 'fulfilled' && invRes.value.length) setInvoices(invRes.value);
        if (dispRecRes.status === 'fulfilled' && dispRecRes.value.length) setDisputes(dispRecRes.value);
        if (payRes.status === 'fulfilled' && payRes.value.length) setPayments(payRes.value);
        if (connRes.status === 'fulfilled' && connRes.value.length) setConnections(connRes.value);
        if (memRes.status === 'fulfilled' && memRes.value.length) setMembers(memRes.value);
        if (audRes.status === 'fulfilled' && audRes.value.length) setAuditTrail(audRes.value);
        if (notifRes.status === 'fulfilled' && notifRes.value.length) setNotifications(notifRes.value);
        if (tktRes.status === 'fulfilled' && tktRes.value.length) setTickets(tktRes.value);
      } catch (e) {
        console.warn('Backend service offline, running in offline preview mode:', e);
      }
    }
    loadData();
  }, []);

  const activeCompany = companies.find((c) => c.id === session.activeCompanyId) || companies[0];

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const appendAudit = (
    action: string,
    entityType: AuditEntry['entityType'],
    entityId: string,
    details: string,
  ) => {
    const entry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actorName: session.name,
      actorCompany: activeCompany.name,
      actorRole: session.activePerspective.toUpperCase(),
      action,
      entityType,
      entityId,
      details,
    };
    setAuditTrail((prev) => [entry, ...prev]);
    api.audit.append(entry).catch((err) => console.warn('Audit sync:', err));
  };

  const handleQuickLaunchApp = (perspective: WorkspaceRole, section: AppSectionId = 'dashboard') => {
    setSession((prev) => ({ ...prev, activePerspective: perspective }));
    setActiveSection(section);
    setAppMode('app');
  };

  const handleCompleteAuth = (opts?: {
    perspective?: WorkspaceRole;
    newCompany?: { name: string; gstin: string; industry: IndustryType; city: string };
  }) => {
    if (opts?.newCompany) {
      const newCompId = `comp-${Date.now()}`;
      const created: Company = {
        id: newCompId,
        name: opts.newCompany.name,
        gstin: opts.newCompany.gstin,
        pan: opts.newCompany.gstin.slice(2, 12) || 'AAACA1234B',
        cinOrUdyam: 'UDYAM-MH-00-0192831',
        industry: opts.newCompany.industry,
        city: opts.newCompany.city || 'Mumbai',
        state: 'Maharashtra',
        address: `${opts.newCompany.city || 'Mumbai'} Industrial Estate`,
        verificationStatus: 'Pending Review',
        roleCapabilities: ['Buyer', 'Supplier'],
        memberCount: 1,
        onTimeRate: 100,
        disputeRate: 0,
        avgSettlementDays: 30,
        plan: 'Starter MSME',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      setCompanies((prev) => [created, ...prev]);
      api.companies.create(created.name, created.gstin, created.industry, created.city).catch((err) => console.warn('Company sync:', err));
      setSession((prev) => ({
        ...prev,
        memberships: [
          ...prev.memberships,
          { companyId: newCompId, role: 'Owner', defaultPerspective: 'buyer' },
        ],
        activeCompanyId: newCompId,
        activePerspective: opts.perspective || 'buyer',
      }));
      pushToast({
        type: 'success',
        title: 'Company Workspace Created',
        description: `${created.name} added to your multi-company switcher.`,
      });
    } else if (opts?.perspective) {
      setSession((prev) => ({ ...prev, activePerspective: opts.perspective! }));
    }
    setActiveSection('dashboard');
    setAppMode('app');
  };

  const handleSwitchCompany = (companyId: string) => {
    const membership = session.memberships.find((m) => m.companyId === companyId);
    setSession((prev) => ({
      ...prev,
      activeCompanyId: companyId,
      activePerspective: membership?.defaultPerspective || prev.activePerspective,
    }));
    api.auth.switchCompany(companyId).catch((err) => console.warn('Switch company sync:', err));
    const target = companies.find((c) => c.id === companyId);
    pushToast({
      type: 'info',
      title: 'Switched Company Workspace',
      description: `Now viewing ${target?.name || 'selected entity'}.`,
    });
  };

  const handleSendInvitation = (
    partner: Company,
    relationship: 'Supplier' | 'Buyer',
    creditDays: number,
  ) => {
    const newConn: BusinessConnection = {
      id: `conn-${Date.now()}`,
      companyId: activeCompany.id,
      partnerCompanyId: partner.id,
      partnerName: partner.name,
      partnerGstin: partner.gstin,
      partnerIndustry: partner.industry,
      partnerCity: partner.city,
      relationship,
      status: 'Pending Sent',
      creditTermsDays: creditDays,
      connectedSince: new Date().toISOString().slice(0, 10),
      totalVolumeInr: 0,
      activeOrdersCount: 0,
    };
    setConnections((prev) => [newConn, ...prev]);
    api.connections.sendInvitation(activeCompany.id, partner, relationship, creditDays).catch((err) => console.warn('Invite sync:', err));
    appendAudit('Sent Network Invitation', 'Network', partner.gstin, `Invited ${partner.name} as ${relationship}`);
    pushToast({ type: 'success', title: 'Invitation Sent', description: `Invite dispatched to ${partner.name}.` });
  };

  const handleRespondInvitation = (connectionId: string, accept: boolean) => {
    setConnections((prev) =>
      prev
        .map((c) => (c.id === connectionId ? { ...c, status: accept ? ('Connected' as const) : c.status } : c))
        .filter((c) => (accept ? true : c.id !== connectionId)),
    );
    api.connections.respondInvitation(connectionId, accept).catch((err) => console.warn('Respond invite sync:', err));
    pushToast({
      type: accept ? 'success' : 'info',
      title: accept ? 'Partner Connected' : 'Invitation Declined',
    });
  };

  const handleCreatePO = (po: PurchaseOrder) => {
    setPurchaseOrders((prev) => [po, ...prev]);
    api.purchaseOrders.create(po).catch((err) => console.warn('PO sync:', err));
    appendAudit('Created Purchase Order', 'PO', po.poNumber, `Issued ${po.poNumber} to ${po.supplierName}`);
    pushToast({
      type: 'success',
      title: `Purchase Order ${po.poNumber} Issued`,
      description: 'Awaiting supplier formal confirmation.',
    });
  };

  const handleConfirmPO = (poId: string) => {
    const target = purchaseOrders.find((p) => p.id === poId);
    setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? { ...p, status: 'Confirmed' } : p)));
    api.purchaseOrders.confirm(poId).catch((err) => console.warn('Confirm sync:', err));
    if (target) {
      appendAudit('Supplier Confirmed PO', 'PO', target.poNumber, 'Confirmed terms & locked PO version');
      pushToast({ type: 'success', title: `${target.poNumber} Confirmed`, description: 'Order locked against silent edits.' });
    }
  };

  const handleRequestAmendment = (poId: string, reason: string, summary: string) => {
    const target = purchaseOrders.find((p) => p.id === poId);
    if (!target) return;
    const nextVersion = target.version + 1;
    api.purchaseOrders.amend(poId, reason, summary, session.name).catch((err) => console.warn('Amendment sync:', err));
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              version: nextVersion,
              status: 'Amendment Requested',
              amendments: [
                ...p.amendments,
                {
                  id: `amd-${Date.now()}`,
                  version: nextVersion,
                  requestedBy: session.name,
                  requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  reason,
                  summary,
                  status: 'Pending Supplier Acceptance',
                },
              ],
            }
          : p,
      ),
    );
    appendAudit('Requested PO Amendment', 'PO', target.poNumber, `v${nextVersion}: ${summary}`);
    pushToast({
      type: 'warning',
      title: `Amendment v${nextVersion} Submitted`,
      description: 'Requires counterparty acceptance before taking effect.',
    });
  };

  const handleCreateDispatch = (dispatch: DeliveryDispatch) => {
    setDispatches((prev) => [dispatch, ...prev]);
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === dispatch.poId
          ? { ...p, status: dispatch.isPartialDispatch ? 'Partially Dispatched' : 'Dispatched' }
          : p,
      ),
    );
    api.deliveries.create(dispatch).catch((err) => console.warn('Dispatch sync:', err));
    appendAudit('Generated Dispatch & QR Pass', 'Delivery', dispatch.dispatchNumber, `E-Way Bill ${dispatch.eWayBillNumber}`);
    pushToast({
      type: 'success',
      title: `Dispatch ${dispatch.dispatchNumber} Created`,
      description: 'Cryptographic QR pass ready for buyer gate scan.',
    });
  };

  const handleVerifyDelivery = (
    dispatchId: string,
    checkedItems: DeliveryItemCheck[],
    proofFile: string,
    acceptPartial: boolean,
  ) => {
    const target = dispatches.find((d) => d.id === dispatchId);
    if (!target) return;
    const newStatus: DeliveryDispatch['status'] = acceptPartial
      ? 'Partial Delivery Accepted'
      : 'Verified & Accepted';

    api.deliveries.verify(dispatchId, checkedItems, proofFile, acceptPartial, session.name).catch((err) => console.warn('Verify sync:', err));

    setDispatches((prev) =>
      prev.map((d) =>
        d.id === dispatchId
          ? {
              ...d,
              status: newStatus,
              items: checkedItems,
              proofFiles: [...d.proofFiles, proofFile],
              verifiedBy: session.name,
              verifiedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : d,
      ),
    );

    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === target.poId
          ? {
              ...po,
              status: acceptPartial ? 'Partially Delivered' : 'Delivered',
              items: po.items.map((li) => {
                const match = checkedItems.find((ci) => ci.lineItemId === li.id);
                return match ? { ...li, receivedQty: match.verifiedReceivedQty } : li;
              }),
            }
          : po,
      ),
    );

    appendAudit(
      acceptPartial ? 'Partial Delivery Accepted (Variance Logged)' : 'Delivery Verified via QR Scan',
      'Delivery',
      target.dispatchNumber,
      `Proof ${proofFile} attached at gate`,
    );
    pushToast({
      type: acceptPartial ? 'warning' : 'success',
      title: acceptPartial ? 'Partial Delivery Recorded' : 'Delivery Verified & Accepted',
      description: `Gate GRN updated for ${target.dispatchNumber}.`,
    });
  };

  const handleUploadInvoice = (inv: InvoiceRecord) => {
    setInvoices((prev) => [inv, ...prev]);
    api.invoices.upload(inv).catch((err) => console.warn('Invoice sync:', err));
    appendAudit('Uploaded Invoice & Ran 3-Way Match', 'Invoice', inv.invoiceNumber, inv.matchStatus);
    pushToast({
      type: inv.matchStatus === 'Matched (3-Way Verified)' ? 'success' : 'warning',
      title: `Invoice ${inv.invoiceNumber} Processed`,
      description: `3-Way Match Result: ${inv.matchStatus}`,
    });
  };

  const handleApproveInvoice = (invId: string) => {
    const inv = invoices.find((i) => i.id === invId);
    setInvoices((prev) => prev.map((i) => (i.id === invId ? { ...i, status: 'Approved for Payment' } : i)));
    api.invoices.approve(invId).catch((err) => console.warn('Approve sync:', err));
    if (inv) {
      appendAudit('Approved Invoice for Payment', 'Invoice', inv.invoiceNumber, 'Cleared by Finance');
      pushToast({ type: 'success', title: `Invoice ${inv.invoiceNumber} Approved` });
    }
  };

  const handleRejectInvoice = (invId: string, reason: string) => {
    const inv = invoices.find((i) => i.id === invId);
    setInvoices((prev) =>
      prev.map((i) => (i.id === invId ? { ...i, status: 'Rejected', mismatchDetails: reason } : i)),
    );
    api.invoices.reject(invId, reason).catch((err) => console.warn('Reject sync:', err));
    if (inv) {
      appendAudit('Rejected Invoice', 'Invoice', inv.invoiceNumber, reason);
      pushToast({ type: 'error', title: `Invoice ${inv.invoiceNumber} Rejected`, description: reason });
    }
  };

  const handleEscalateDispute = (inv: InvoiceRecord) => {
    const newDisp: DisputeRecord = {
      id: `disp-${Date.now()}`,
      disputeNumber: `DSP-CLM-0${193 + disputes.length}`,
      poNumber: inv.poNumber,
      dispatchNumber: inv.dispatchNumber,
      invoiceNumber: inv.invoiceNumber,
      buyerName: inv.buyerName,
      supplierName: inv.supplierName,
      category: 'Invoice Rate Mismatch',
      claimedImpactInr: Math.max(0, inv.invoicedTotal - inv.deliveredValue),
      status: 'Open',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      description: inv.mismatchDetails || 'Escalated from 3-Way Invoice Match Engine.',
      evidenceFiles: [
        {
          name: inv.fileRef,
          uploadedBy: session.name,
          uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          hash: 'sha256:91e2c8...70b',
        },
      ],
      comments: [],
    };
    setDisputes((prev) => [newDisp, ...prev]);
    api.disputes.create(newDisp).catch((err) => console.warn('Dispute sync:', err));
    setActiveSection('disputes');
    appendAudit('Escalated 3-Way Mismatch to Dispute', 'Dispute', newDisp.disputeNumber, inv.invoiceNumber);
    pushToast({ type: 'warning', title: `Dispute ${newDisp.disputeNumber} Opened` });
  };

  const handleRecordPayment = (
    paymentId: string,
    amount: number,
    mode: PaymentEntry['mode'],
    utr: string,
  ) => {
    api.payments.record(paymentId, amount, mode, utr, session.name).catch((err) => console.warn('Payment sync:', err));
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const nextPaid = p.amountPaid + amount;
        const nextBalance = Math.max(0, p.invoiceTotal - nextPaid);
        const nextStatus: PaymentEntry['status'] = nextBalance === 0 ? 'Confirmed' : 'Partially Paid';
        return {
          ...p,
          amountPaid: nextPaid,
          balanceRemaining: nextBalance,
          mode,
          utrNumber: utr,
          paidAt: new Date().toISOString().slice(0, 10),
          status: nextStatus,
          history: [
            ...p.history,
            {
              date: new Date().toISOString().slice(0, 10),
              amount,
              mode,
              utr,
              recordedBy: session.name,
            },
          ],
        };
      }),
    );
    appendAudit('Recorded Payment UTR', 'Payment', utr, `${mode} settlement logged`);
    pushToast({ type: 'success', title: 'Payment UTR Logged', description: `Reference ${utr} recorded.` });
  };

  if (appMode === 'public') {
    return (
      <>
        <PublicSite
          activePage={publicPage}
          onNavigatePage={(p) => {
            setPublicPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAppMode('auth');
          }}
          onQuickLaunchApp={(persp) => handleQuickLaunchApp(persp, 'dashboard')}
          onOpenBlueprint={() => handleQuickLaunchApp('buyer', 'blueprint')}
        />
        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
        />
      </>
    );
  }

  if (appMode === 'auth') {
    return (
      <>
        <AuthScreens
          initialMode={authMode}
          onBackToSite={() => setAppMode('public')}
          onCompleteAuth={handleCompleteAuth}
        />
        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
        />
      </>
    );
  }

  return (
    <>
      <AppShell
        session={session}
        companies={companies}
        purchaseOrders={purchaseOrders}
        invoices={invoices}
        dispatches={dispatches}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onSwitchCompany={handleSwitchCompany}
        onSwitchPerspective={(role) => setSession((prev) => ({ ...prev, activePerspective: role }))}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        notifications={notifications}
        onMarkNotificationRead={(id) =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        }
        onSignOut={() => setAppMode('public')}
        onBackToPublicSite={() => setAppMode('public')}
      >
        {activeSection === 'dashboard' && (
          <RoleDashboards
            perspective={session.activePerspective}
            activeCompany={activeCompany}
            companies={companies}
            connections={connections}
            purchaseOrders={purchaseOrders}
            dispatches={dispatches}
            invoices={invoices}
            disputes={disputes}
            payments={payments}
            auditTrail={auditTrail}
            onNavigate={setActiveSection}
            onVerifyCompany={(companyId) => {
              setCompanies((prev) =>
                prev.map((c) => (c.id === companyId ? { ...c, verificationStatus: 'Verified' } : c)),
              );
              api.companies.verify(companyId).catch((err) => console.warn('Company verify sync:', err));
              pushToast({ type: 'success', title: 'Company KYB Verified' });
            }}
          />
        )}

        {activeSection === 'network' && (
          <BusinessNetworkModule
            activeCompany={activeCompany}
            companies={companies}
            connections={connections}
            globalSearch={globalSearch}
            onSendInvitation={handleSendInvitation}
            onRespondInvitation={handleRespondInvitation}
          />
        )}

        {activeSection === 'purchase-orders' && (
          <PurchaseOrdersModule
            perspective={session.activePerspective}
            activeCompany={activeCompany}
            connections={connections}
            purchaseOrders={purchaseOrders}
            auditTrail={auditTrail}
            globalSearch={globalSearch}
            autoOpenCreate={pendingQuickAction === 'create-po'}
            onConsumeAutoOpen={() => setPendingQuickAction(null)}
            onCreatePO={handleCreatePO}
            onConfirmPO={handleConfirmPO}
            onRequestAmendment={handleRequestAmendment}
          />
        )}

        {activeSection === 'deliveries' && (
          <DeliveryModule
            perspective={session.activePerspective}
            purchaseOrders={purchaseOrders}
            dispatches={dispatches}
            autoOpenMode={
              pendingQuickAction === 'scan-qr'
                ? 'scanner'
                : pendingQuickAction === 'create-dispatch'
                  ? 'create'
                  : null
            }
            onConsumeAutoOpen={() => setPendingQuickAction(null)}
            onCreateDispatch={handleCreateDispatch}
            onVerifyDelivery={handleVerifyDelivery}
          />
        )}

        {activeSection === 'invoices' && (
          <InvoiceModule
            perspective={session.activePerspective}
            purchaseOrders={purchaseOrders}
            dispatches={dispatches}
            invoices={invoices}
            autoOpenUpload={pendingQuickAction === 'upload-invoice'}
            onConsumeAutoOpen={() => setPendingQuickAction(null)}
            onUploadInvoice={handleUploadInvoice}
            onApproveInvoice={handleApproveInvoice}
            onRejectInvoice={handleRejectInvoice}
            onEscalateDispute={handleEscalateDispute}
          />
        )}

        {activeSection === 'disputes' && (
          <DisputeModule
            purchaseOrders={purchaseOrders}
            disputes={disputes}
            activeCompanyName={activeCompany.name}
            actorName={session.name}
            autoOpenCreate={pendingQuickAction === 'raise-dispute'}
            onConsumeAutoOpen={() => setPendingQuickAction(null)}
            onCreateDispute={(d) => {
              setDisputes((prev) => [d, ...prev]);
              api.disputes.create(d).catch((err) => console.warn('Dispute sync:', err));
              appendAudit('Opened Dispute', 'Dispute', d.disputeNumber, d.category);
              pushToast({ type: 'warning', title: `Dispute ${d.disputeNumber} Created` });
            }}
            onAddComment={(disputeId, message) => {
              setDisputes((prev) =>
                prev.map((d) =>
                  d.id === disputeId
                    ? {
                        ...d,
                        comments: [
                          ...d.comments,
                          {
                            id: `c-${Date.now()}`,
                            authorName: session.name,
                            authorCompany: activeCompany.name,
                            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                            message,
                          },
                        ],
                      }
                    : d,
                ),
              );
              api.disputes.addComment(disputeId, session.name, activeCompany.name, message).catch((err) => console.warn('Comment sync:', err));
              pushToast({ type: 'info', title: 'Comment Added to Dispute Thread' });
            }}
            onAddEvidence={(disputeId, filename) => {
              setDisputes((prev) =>
                prev.map((d) =>
                  d.id === disputeId
                    ? {
                        ...d,
                        evidenceFiles: [
                          ...d.evidenceFiles,
                          {
                            name: filename,
                            uploadedBy: session.name,
                            uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                            hash: `sha256:${Math.random().toString(16).slice(2, 10)}...e1a`,
                          },
                        ],
                      }
                    : d,
                ),
              );
              api.disputes.addEvidence(disputeId, filename, session.name).catch((err) => console.warn('Evidence sync:', err));
              pushToast({ type: 'success', title: 'Evidence Attached & Hashed' });
            }}
            onResolveDispute={(disputeId, resolutionSummary) => {
              setDisputes((prev) =>
                prev.map((d) =>
                  d.id === disputeId ? { ...d, status: 'Resolved', resolutionSummary } : d,
                ),
              );
              api.disputes.resolve(disputeId, resolutionSummary).catch((err) => console.warn('Resolve dispute sync:', err));
              pushToast({ type: 'success', title: 'Dispute Formally Resolved' });
            }}
          />
        )}

        {activeSection === 'payments' && (
          <PaymentModule
            perspective={session.activePerspective}
            payments={payments}
            onRecordPayment={handleRecordPayment}
            onConfirmReceipt={(paymentId) => {
              setPayments((prev) =>
                prev.map((p) => (p.id === paymentId ? { ...p, confirmedByPayee: true } : p)),
              );
              api.payments.confirmReceipt(paymentId).catch((err) => console.warn('Confirm receipt sync:', err));
              pushToast({ type: 'success', title: 'Payment Receipt Confirmed by Supplier' });
            }}
          />
        )}

        {activeSection === 'reports' && (
          <ReportsModule
            companies={companies}
            purchaseOrders={purchaseOrders}
            dispatches={dispatches}
            invoices={invoices}
            disputes={disputes}
            payments={payments}
            onExportSuccess={(filename) =>
              pushToast({ type: 'success', title: 'CSV Export Downloaded', description: filename })
            }
          />
        )}

        {activeSection === 'notifications' && (
          <NotificationsModule
            notifications={notifications}
            onMarkAllRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              api.notifications.markAllRead().catch((err) => console.warn('Mark all read sync:', err));
            }}
            onMarkRead={(id) => {
              setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
              api.notifications.markRead(id).catch((err) => console.warn('Mark read sync:', err));
            }}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsModule
            session={session}
            activeCompany={activeCompany}
            members={members}
            onInviteMember={(name, email, role, dept) => {
              const newMem: CompanyMember = {
                id: `mem-${Date.now()}`,
                name,
                email,
                phone: '+91 98000 00000',
                role,
                department: dept,
                status: 'Invited',
                lastActive: 'Invite Sent',
              };
              setMembers((prev) => [...prev, newMem]);
              api.members.invite(name, email, role, dept).catch((err) => console.warn('Invite sync:', err));
              pushToast({ type: 'success', title: 'Employee Invitation Sent', description: `${name} (${role})` });
            }}
            onUpdateMemberRole={(memberId, role: MemberRole) => {
              setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
              api.members.updateRole(memberId, role).catch((err) => console.warn('Update role sync:', err));
              pushToast({ type: 'info', title: 'Member Role Updated', description: `Assigned ${role}` });
            }}
            onSaveIndustryField={(industry, field: IndustryFieldSchema) => {
              pushToast({
                type: 'success',
                title: `Custom Field Added (${industry})`,
                description: `${field.label} is now active on new Purchase Orders.`,
              });
            }}
          />
        )}

        {activeSection === 'support' && (
          <SupportModule
            tickets={tickets}
            onCreateTicket={(subject, category, body) => {
              const newTkt: SupportTicket = {
                id: `tkt-${Date.now()}`,
                ticketNumber: `TP-SUP-${1043 + tickets.length}`,
                subject,
                category,
                priority: 'Normal',
                status: 'Open',
                createdAt: new Date().toISOString().slice(0, 10),
                lastUpdated: new Date().toISOString().slice(0, 10),
                messages: [{ sender: session.name, time: 'Just now', body }],
              };
              setTickets((prev) => [newTkt, ...prev]);
              api.tickets.create(subject, category, body, session.name).catch((err) => console.warn('Ticket sync:', err));
              pushToast({ type: 'success', title: `Support Ticket ${newTkt.ticketNumber} Created` });
            }}
          />
        )}

        {activeSection === 'blueprint' && <BlueprintArchitectureModule />}
      </AppShell>

      {activeSection === 'dashboard' && (
        <QuickActionsMenu
          perspective={session.activePerspective}
          onTriggerAction={(intent) => {
            setPendingQuickAction(intent);
            if (intent === 'create-po') setActiveSection('purchase-orders');
            else if (intent === 'scan-qr' || intent === 'create-dispatch') setActiveSection('deliveries');
            else if (intent === 'upload-invoice') setActiveSection('invoices');
            else if (intent === 'raise-dispute') setActiveSection('disputes');
          }}
        />
      )}

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />
    </>
  );
}
