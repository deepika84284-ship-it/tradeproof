export type IndustryType =
  | 'Manufacturing'
  | 'Wholesale & Distribution'
  | 'Retail'
  | 'Textile & Garments'
  | 'Construction'
  | 'IT & Professional Services'
  | 'SME & MSME';

export type WorkspaceRole = 'buyer' | 'supplier' | 'admin';

export type MemberRole =
  | 'Owner'
  | 'Procurement Manager'
  | 'Warehouse Lead'
  | 'Finance Controller'
  | 'Viewer';

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Action Required';

export interface IndustryFieldSchema {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  cinOrUdyam: string;
  industry: IndustryType;
  city: string;
  state: string;
  address: string;
  verificationStatus: VerificationStatus;
  roleCapabilities: ('Buyer' | 'Supplier')[];
  memberCount: number;
  onTimeRate: number;
  disputeRate: number;
  avgSettlementDays: number;
  plan: 'Starter MSME' | 'Growth Business' | 'Enterprise Hub';
  joinedDate: string;
}

export interface CompanyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  department: string;
  status: 'Active' | 'Invited';
  lastActive: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  memberships: {
    companyId: string;
    role: MemberRole;
    defaultPerspective: WorkspaceRole;
  }[];
  activeCompanyId: string;
  activePerspective: WorkspaceRole;
}

export interface BusinessConnection {
  id: string;
  companyId: string;
  partnerCompanyId: string;
  partnerName: string;
  partnerGstin: string;
  partnerIndustry: IndustryType;
  partnerCity: string;
  relationship: 'Supplier' | 'Buyer' | 'Mutual';
  status: 'Connected' | 'Pending Sent' | 'Pending Received' | 'Suspended';
  creditTermsDays: number;
  connectedSince: string;
  totalVolumeInr: number;
  activeOrdersCount: number;
}

export interface POLineItem {
  id: string;
  sku: string;
  name: string;
  hsnOrSac: string;
  unit: string;
  orderedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  unitPrice: number;
  gstRate: number;
}

export interface POAmendment {
  id: string;
  version: number;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  summary: string;
  status: 'Approved' | 'Pending Supplier Acceptance';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorCompany: string;
  actorRole: string;
  action: string;
  entityType: 'PO' | 'Delivery' | 'Invoice' | 'Dispute' | 'Payment' | 'Network' | 'Company';
  entityId: string;
  details: string;
}

export type POStatus =
  | 'Draft'
  | 'Pending Supplier Confirmation'
  | 'Confirmed'
  | 'Amendment Requested'
  | 'Partially Dispatched'
  | 'Dispatched'
  | 'Partially Delivered'
  | 'Delivered'
  | 'Closed';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  version: number;
  buyerCompanyId: string;
  buyerName: string;
  supplierCompanyId: string;
  supplierName: string;
  industry: IndustryType;
  industryFields: Record<string, string>;
  createdAt: string;
  expectedDeliveryDate: string;
  deliveryAddress: string;
  paymentTerms: string;
  status: POStatus;
  items: POLineItem[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  amendments: POAmendment[];
  notes: string;
}

export type DeliveryStatus =
  | 'Scheduled'
  | 'In Transit'
  | 'QR Scanned at Gate'
  | 'Verified & Accepted'
  | 'Partial Delivery Accepted'
  | 'Discrepancy Reported';

export interface DeliveryItemCheck {
  lineItemId: string;
  name: string;
  unit: string;
  dispatchedQty: number;
  verifiedReceivedQty: number;
  condition: 'Intact' | 'Shortage' | 'Damaged' | 'Incorrect';
}

export interface DeliveryDispatch {
  id: string;
  dispatchNumber: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  buyerName: string;
  dispatchDate: string;
  etaDate: string;
  transporterName: string;
  vehicleNumber: string;
  lrNumber: string;
  eWayBillNumber: string;
  qrPayload: string;
  status: DeliveryStatus;
  isPartialDispatch: boolean;
  proofFiles: string[];
  verifiedBy?: string;
  verifiedAt?: string;
  items: DeliveryItemCheck[];
}

export type InvoiceMatchStatus =
  | 'Matched (3-Way Verified)'
  | 'Quantity Mismatch'
  | 'Amount Mismatch'
  | 'Pending Delivery Proof';

export type InvoiceStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved for Payment'
  | 'Disputed'
  | 'Rejected'
  | 'Partially Paid'
  | 'Paid';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  dispatchId: string;
  dispatchNumber: string;
  supplierName: string;
  buyerName: string;
  invoiceDate: string;
  dueDate: string;
  poAmount: number;
  deliveredValue: number;
  invoicedSubtotal: number;
  gstAmount: number;
  invoicedTotal: number;
  matchStatus: InvoiceMatchStatus;
  mismatchDetails?: string;
  status: InvoiceStatus;
  paidAmount: number;
  fileRef: string;
}

export type DisputeCategory =
  | 'Shortage'
  | 'Damaged Goods'
  | 'Incorrect Item'
  | 'Invoice Rate Mismatch'
  | 'Delayed Delivery';

export type DisputeStatus =
  | 'Open'
  | 'Evidence Under Review'
  | 'Supplier Responded'
  | 'Resolution Proposed'
  | 'Resolved';

export interface DisputeComment {
  id: string;
  authorName: string;
  authorCompany: string;
  timestamp: string;
  message: string;
}

export interface DisputeRecord {
  id: string;
  disputeNumber: string;
  poNumber: string;
  dispatchNumber?: string;
  invoiceNumber?: string;
  buyerName: string;
  supplierName: string;
  category: DisputeCategory;
  claimedImpactInr: number;
  status: DisputeStatus;
  createdAt: string;
  description: string;
  evidenceFiles: { name: string; uploadedBy: string; uploadedAt: string; hash: string }[];
  comments: DisputeComment[];
  resolutionSummary?: string;
}

export type PaymentStatus = 'Scheduled' | 'Pending' | 'Overdue' | 'Partially Paid' | 'Confirmed';

export interface PaymentEntry {
  id: string;
  referenceId: string;
  invoiceNumber: string;
  poNumber: string;
  payerCompany: string;
  payeeCompany: string;
  dueDate: string;
  invoiceTotal: number;
  amountPaid: number;
  balanceRemaining: number;
  mode: 'NEFT' | 'RTGS' | 'IMPS' | 'UPI B2B' | 'Cheque';
  utrNumber?: string;
  paidAt?: string;
  status: PaymentStatus;
  confirmedByPayee: boolean;
  history: { date: string; amount: number; mode: string; utr: string; recordedBy: string }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Order' | 'Delivery' | 'Invoice' | 'Dispute' | 'Payment' | 'Network';
  timestamp: string;
  read: boolean;
  entityRef: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'Transaction Workflow' | 'GST & Compliance' | 'Account & RBAC' | 'API & MongoDB Integration';
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  lastUpdated: string;
  messages: { sender: string; time: string; body: string }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
