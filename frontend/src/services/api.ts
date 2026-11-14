import {
  AuditEntry,
  BusinessConnection,
  Company,
  CompanyMember,
  DeliveryDispatch,
  DeliveryItemCheck,
  DisputeRecord,
  IndustryType,
  InvoiceRecord,
  MemberRole,
  NotificationItem,
  PaymentEntry,
  PurchaseOrder,
  SupportTicket,
  UserSession,
  WorkspaceRole,
} from '../types/tradeproof';

const BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('tp_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorDetail = `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) errorDetail = parsed.detail;
    } catch {}
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Health & Status
  health: {
    check: () => request<{ status: string; service: string; database: { connected: boolean; engine: string } }>('/health'),
  },

  // Auth
  auth: {
    login: async (email: string, password: string, perspective?: WorkspaceRole) => {
      const data = await request<{ token: string; user: UserSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, perspective }),
      });
      if (data.token) localStorage.setItem('tp_token', data.token);
      return data;
    },
    signup: async (fullName: string, email: string, phone: string, password: string) => {
      const data = await request<{ token: string; user: UserSession }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      if (data.token) localStorage.setItem('tp_token', data.token);
      return data;
    },
    getSession: () => request<UserSession>('/auth/session'),
    switchCompany: (companyId: string) =>
      request<UserSession>('/auth/switch-company', {
        method: 'POST',
        body: JSON.stringify({ companyId }),
      }),
  },

  // Companies
  companies: {
    list: () => request<Company[]>('/companies'),
    create: (name: string, gstin: string, industry: IndustryType, city: string) =>
      request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify({ name, gstin, industry, city }),
      }),
    verify: (companyId: string) =>
      request<{ message: string; companyId: string }>(`/companies/${companyId}/verify`, {
        method: 'PUT',
      }),
  },

  // Purchase Orders
  purchaseOrders: {
    list: () => request<PurchaseOrder[]>('/purchase-orders'),
    create: (po: PurchaseOrder) =>
      request<PurchaseOrder>('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(po),
      }),
    confirm: (poId: string) =>
      request<{ message: string; poId: string }>(`/purchase-orders/${poId}/confirm`, {
        method: 'PUT',
      }),
    amend: (poId: string, reason: string, summary: string, requestedBy: string) =>
      request<{ message: string; version: number }>(`/purchase-orders/${poId}/amend`, {
        method: 'POST',
        body: JSON.stringify({ reason, summary, requestedBy }),
      }),
  },

  // Deliveries & QR
  deliveries: {
    list: () => request<DeliveryDispatch[]>('/deliveries'),
    create: (dispatch: DeliveryDispatch) =>
      request<DeliveryDispatch>('/deliveries', {
        method: 'POST',
        body: JSON.stringify(dispatch),
      }),
    verify: (
      dispatchId: string,
      checkedItems: DeliveryItemCheck[],
      proofFile: string,
      acceptPartial: boolean,
      verifiedBy: string,
    ) =>
      request<{ message: string; status: string }>(`/deliveries/${dispatchId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ checkedItems, proofFile, acceptPartial, verifiedBy }),
      }),
  },

  // Invoices & 3-Way Match
  invoices: {
    list: () => request<InvoiceRecord[]>('/invoices'),
    upload: (invoice: InvoiceRecord) =>
      request<InvoiceRecord>('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice),
      }),
    approve: (invId: string) =>
      request<{ message: string }>(`/invoices/${invId}/approve`, {
        method: 'PUT',
      }),
    reject: (invId: string, reason: string) =>
      request<{ message: string }>(`/invoices/${invId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),
  },

  // Disputes
  disputes: {
    list: () => request<DisputeRecord[]>('/disputes'),
    create: (dispute: DisputeRecord) =>
      request<DisputeRecord>('/disputes', {
        method: 'POST',
        body: JSON.stringify(dispute),
      }),
    addComment: (disputeId: string, authorName: string, authorCompany: string, message: string) =>
      request<{ id: string }>(`/disputes/${disputeId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ authorName, authorCompany, message }),
      }),
    addEvidence: (disputeId: string, filename: string, uploadedBy: string) =>
      request<{ name: string; hash: string }>(`/disputes/${disputeId}/evidence`, {
        method: 'POST',
        body: JSON.stringify({ filename, uploadedBy }),
      }),
    resolve: (disputeId: string, resolutionSummary: string) =>
      request<{ message: string }>(`/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolutionSummary }),
      }),
  },

  // Payments
  payments: {
    list: () => request<PaymentEntry[]>('/payments'),
    record: (
      paymentId: string,
      amount: number,
      mode: PaymentEntry['mode'],
      utr: string,
      recordedBy: string,
    ) =>
      request<{ message: string; balanceRemaining: number }>(`/payments/${paymentId}/record`, {
        method: 'POST',
        body: JSON.stringify({ amount, mode, utr, recordedBy }),
      }),
    confirmReceipt: (paymentId: string) =>
      request<{ message: string }>(`/payments/${paymentId}/confirm`, {
        method: 'PUT',
      }),
  },

  // Business Connections
  connections: {
    list: () => request<BusinessConnection[]>('/connections'),
    sendInvitation: (
      companyId: string,
      partnerCompany: Company,
      relationship: 'Supplier' | 'Buyer',
      creditDays: number,
    ) =>
      request<BusinessConnection>('/connections', {
        method: 'POST',
        body: JSON.stringify({ companyId, partnerCompany, relationship, creditDays }),
      }),
    respondInvitation: (connId: string, accept: boolean) =>
      request<{ message: string; status: string }>(`/connections/${connId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ accept }),
      }),
  },

  // Team Members
  members: {
    list: () => request<CompanyMember[]>('/members'),
    invite: (name: string, email: string, role: MemberRole, department: string) =>
      request<CompanyMember>('/members', {
        method: 'POST',
        body: JSON.stringify({ name, email, role, department }),
      }),
    updateRole: (memberId: string, role: MemberRole) =>
      request<{ message: string }>(`/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  },

  // Audit Trail
  audit: {
    list: () => request<AuditEntry[]>('/audit'),
    append: (entry: AuditEntry) =>
      request<AuditEntry>('/audit', {
        method: 'POST',
        body: JSON.stringify(entry),
      }),
  },

  // Support Tickets
  tickets: {
    list: () => request<SupportTicket[]>('/tickets'),
    create: (
      subject: string,
      category: SupportTicket['category'],
      body: string,
      sender: string,
    ) =>
      request<SupportTicket>('/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, category, body, sender }),
      }),
  },

  // Notifications
  notifications: {
    list: () => request<NotificationItem[]>('/notifications'),
    markRead: (id: string) =>
      request<{ message: string }>(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
    markAllRead: () =>
      request<{ message: string }>('/notifications/read-all', {
        method: 'PUT',
      }),
  },
};
