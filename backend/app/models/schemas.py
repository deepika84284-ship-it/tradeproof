from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

IndustryType = Literal[
    'Manufacturing',
    'Wholesale & Distribution',
    'Retail',
    'Textile & Garments',
    'Construction',
    'IT & Professional Services',
    'SME & MSME'
]

WorkspaceRole = Literal['buyer', 'supplier', 'admin']

MemberRole = Literal[
    'Owner',
    'Procurement Manager',
    'Warehouse Lead',
    'Finance Controller',
    'Viewer'
]

VerificationStatus = Literal['Verified', 'Pending Review', 'Action Required']

class CompanyMember(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: MemberRole
    department: str
    status: Literal['Active', 'Invited']
    lastActive: str

class Company(BaseModel):
    id: str
    name: str
    gstin: str
    pan: str
    cinOrUdyam: str
    industry: IndustryType
    city: str
    state: str
    address: str
    verificationStatus: VerificationStatus
    roleCapabilities: List[Literal['Buyer', 'Supplier']]
    memberCount: int
    onTimeRate: float
    disputeRate: float
    avgSettlementDays: int
    plan: Literal['Starter MSME', 'Growth Business', 'Enterprise Hub']
    joinedDate: str

class Membership(BaseModel):
    companyId: str
    role: MemberRole
    defaultPerspective: WorkspaceRole

class UserSession(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    avatarUrl: str
    memberships: List[Membership]
    activeCompanyId: str
    activePerspective: WorkspaceRole

class BusinessConnection(BaseModel):
    id: str
    companyId: str
    partnerCompanyId: str
    partnerName: str
    partnerGstin: str
    partnerIndustry: IndustryType
    partnerCity: str
    relationship: Literal['Supplier', 'Buyer', 'Mutual']
    status: Literal['Connected', 'Pending Sent', 'Pending Received', 'Suspended']
    creditTermsDays: int
    connectedSince: str
    totalVolumeInr: float
    activeOrdersCount: int

class POLineItem(BaseModel):
    id: str
    sku: str
    name: str
    hsnOrSac: str
    unit: str
    orderedQty: float
    dispatchedQty: float = 0
    receivedQty: float = 0
    unitPrice: float
    gstRate: float

class POAmendment(BaseModel):
    id: str
    version: int
    requestedBy: str
    requestedAt: str
    reason: str
    summary: str
    status: Literal['Approved', 'Pending Supplier Acceptance']

POStatus = Literal[
    'Draft',
    'Pending Supplier Confirmation',
    'Confirmed',
    'Amendment Requested',
    'Partially Dispatched',
    'Dispatched',
    'Partially Delivered',
    'Delivered',
    'Closed'
]

class PurchaseOrder(BaseModel):
    id: str
    poNumber: str
    version: int = 1
    buyerCompanyId: str
    buyerName: str
    supplierCompanyId: str
    supplierName: str
    industry: IndustryType
    industryFields: Dict[str, str] = {}
    createdAt: str
    expectedDeliveryDate: str
    deliveryAddress: str
    paymentTerms: str
    status: POStatus
    items: List[POLineItem]
    subtotal: float
    gstTotal: float
    grandTotal: float
    amendments: List[POAmendment] = []
    notes: str = ""

DeliveryStatus = Literal[
    'Scheduled',
    'In Transit',
    'QR Scanned at Gate',
    'Verified & Accepted',
    'Partial Delivery Accepted',
    'Discrepancy Reported'
]

class DeliveryItemCheck(BaseModel):
    lineItemId: str
    name: str
    unit: str
    dispatchedQty: float
    verifiedReceivedQty: float
    condition: Literal['Intact', 'Shortage', 'Damaged', 'Incorrect']

class DeliveryDispatch(BaseModel):
    id: str
    dispatchNumber: str
    poId: str
    poNumber: str
    supplierName: str
    buyerName: str
    dispatchDate: str
    etaDate: str
    transporterName: str
    vehicleNumber: str
    lrNumber: str
    eWayBillNumber: str
    qrPayload: str
    status: DeliveryStatus
    isPartialDispatch: bool
    proofFiles: List[str] = []
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[str] = None
    items: List[DeliveryItemCheck]

InvoiceMatchStatus = Literal[
    'Matched (3-Way Verified)',
    'Quantity Mismatch',
    'Amount Mismatch',
    'Pending Delivery Proof'
]

InvoiceStatus = Literal[
    'Submitted',
    'Under Review',
    'Approved for Payment',
    'Disputed',
    'Rejected',
    'Partially Paid',
    'Paid'
]

class InvoiceRecord(BaseModel):
    id: str
    invoiceNumber: str
    poId: str
    poNumber: str
    dispatchId: str
    dispatchNumber: str
    supplierName: str
    buyerName: str
    invoiceDate: str
    dueDate: str
    poAmount: float
    deliveredValue: float
    invoicedSubtotal: float
    gstAmount: float
    invoicedTotal: float
    matchStatus: InvoiceMatchStatus
    mismatchDetails: Optional[str] = None
    status: InvoiceStatus
    paidAmount: float = 0
    fileRef: str

class DisputeComment(BaseModel):
    id: str
    authorName: str
    authorCompany: str
    timestamp: str
    message: str

class EvidenceFile(BaseModel):
    name: str
    uploadedBy: str
    uploadedAt: str
    hash: str

DisputeCategory = Literal[
    'Shortage',
    'Damaged Goods',
    'Incorrect Item',
    'Invoice Rate Mismatch',
    'Delayed Delivery'
]

DisputeStatus = Literal[
    'Open',
    'Evidence Under Review',
    'Supplier Responded',
    'Resolution Proposed',
    'Resolved'
]

class DisputeRecord(BaseModel):
    id: str
    disputeNumber: str
    poNumber: str
    dispatchNumber: Optional[str] = None
    invoiceNumber: Optional[str] = None
    buyerName: str
    supplierName: str
    category: DisputeCategory
    claimedImpactInr: float
    status: DisputeStatus
    createdAt: str
    description: str
    evidenceFiles: List[EvidenceFile] = []
    comments: List[DisputeComment] = []
    resolutionSummary: Optional[str] = None

PaymentStatus = Literal['Scheduled', 'Pending', 'Overdue', 'Partially Paid', 'Confirmed']

class PaymentHistoryItem(BaseModel):
    date: str
    amount: float
    mode: str
    utr: str
    recordedBy: str

class PaymentEntry(BaseModel):
    id: str
    referenceId: str
    invoiceNumber: str
    poNumber: str
    payerCompany: str
    payeeCompany: str
    dueDate: str
    invoiceTotal: float
    amountPaid: float
    balanceRemaining: float
    mode: Literal['NEFT', 'RTGS', 'IMPS', 'UPI B2B', 'Cheque']
    utrNumber: Optional[str] = None
    paidAt: Optional[str] = None
    status: PaymentStatus
    confirmedByPayee: bool
    history: List[PaymentHistoryItem] = []

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    category: Literal['Order', 'Delivery', 'Invoice', 'Dispute', 'Payment', 'Network']
    timestamp: str
    read: bool
    entityRef: str

class SupportTicketMessage(BaseModel):
    sender: str
    time: str
    body: str

class SupportTicket(BaseModel):
    id: str
    ticketNumber: str
    subject: str
    category: Literal['Transaction Workflow', 'GST & Compliance', 'Account & RBAC', 'API & MongoDB Integration']
    priority: Literal['Normal', 'High', 'Urgent']
    status: Literal['Open', 'In Progress', 'Resolved']
    createdAt: str
    lastUpdated: str
    messages: List[SupportTicketMessage]

class AuditEntry(BaseModel):
    id: str
    timestamp: str
    actorName: str
    actorCompany: str
    actorRole: str
    action: str
    entityType: Literal['PO', 'Delivery', 'Invoice', 'Dispute', 'Payment', 'Network', 'Company']
    entityId: str
    details: str

# Auth Request & Response Models
class LoginRequest(BaseModel):
    email: str
    password: str
    perspective: Optional[WorkspaceRole] = 'buyer'

class SignupRequest(BaseModel):
    fullName: str
    email: str
    phone: str = "+91 98204 71920"
    password: str

class CreateCompanyRequest(BaseModel):
    name: str
    gstin: str
    industry: IndustryType
    city: str

class AuthResponse(BaseModel):
    token: str
    user: UserSession
