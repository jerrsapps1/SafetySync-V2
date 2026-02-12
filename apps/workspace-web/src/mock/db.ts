export interface MockOrganization {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface MockEmployee {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface MockDocument {
  id: string;
  orgId: string;
  fileName: string;
  uploadDate: string;
  status: 'Processing' | 'Needs Review' | 'Approved' | 'Rejected';
  courseName?: string;
  completionDate?: string;
  instructorName?: string;
  oshaStandard?: string;
  traineeIds?: string[];
  rejectReason?: string;
}

export interface MockTrainingRecord {
  id: string;
  orgId: string;
  employeeId: string;
  courseName: string;
  completionDate: string;
  expirationDate: string;
  oshaStandard: string;
  instructorName: string;
  documentId?: string;
}

export interface MockCertificate {
  id: string;
  orgId: string;
  employeeId: string;
  courseName: string;
  issueDate: string;
  expirationDate: string;
  certificateNumber: string;
  documentId?: string;
}

export interface MockWalletCard {
  id: string;
  orgId: string;
  employeeId: string;
  courseName: string;
  trainingDate: string;
  expirationDate: string;
  cardNumber: string;
  documentId?: string;
}

export interface MockSupportTicket {
  id: string;
  orgId: string;
  category: 'Login / account issues' | 'Training records' | 'Certificate generation' | 'AI ingestion problems' | 'Billing questions' | 'Data corrections' | 'Feature requests';
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdDate: string;
  notes: { text: string; date: string; }[];
}

export function generateId(): string {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

const organizations: MockOrganization[] = [
  {
    id: 'org-1',
    name: 'Demo Construction Co.',
    address: '1234 Builder Ave, Houston, TX 77001',
    phone: '(713) 555-0100',
  },
  {
    id: 'org-2',
    name: 'Demo Industrial Co.',
    address: '5678 Factory Blvd, Dallas, TX 75201',
    phone: '(214) 555-0200',
  },
];

const employees: MockEmployee[] = [
  { id: 'emp-1', orgId: 'org-1', firstName: 'Carlos', lastName: 'Martinez', email: 'cmartinez@democonstruction.com', role: 'Foreman', status: 'active' },
  { id: 'emp-2', orgId: 'org-1', firstName: 'James', lastName: 'Wilson', email: 'jwilson@democonstruction.com', role: 'Electrician', status: 'active' },
  { id: 'emp-3', orgId: 'org-1', firstName: 'Maria', lastName: 'Garcia', email: 'mgarcia@democonstruction.com', role: 'Safety Coordinator', status: 'active' },
  { id: 'emp-4', orgId: 'org-1', firstName: 'Robert', lastName: 'Johnson', email: 'rjohnson@democonstruction.com', role: 'Heavy Equipment Operator', status: 'active' },
  { id: 'emp-5', orgId: 'org-1', firstName: 'David', lastName: 'Lee', email: 'dlee@democonstruction.com', role: 'Laborer', status: 'active' },
  { id: 'emp-6', orgId: 'org-1', firstName: 'Michael', lastName: 'Brown', email: 'mbrown@democonstruction.com', role: 'Crane Operator', status: 'active' },
  { id: 'emp-7', orgId: 'org-1', firstName: 'Sarah', lastName: 'Davis', email: 'sdavis@democonstruction.com', role: 'Project Manager', status: 'inactive' },
  { id: 'emp-8', orgId: 'org-2', firstName: 'Kevin', lastName: 'Thompson', email: 'kthompson@demoindustrial.com', role: 'Welder', status: 'active' },
  { id: 'emp-9', orgId: 'org-2', firstName: 'Linda', lastName: 'Anderson', email: 'landerson@demoindustrial.com', role: 'Safety Coordinator', status: 'active' },
  { id: 'emp-10', orgId: 'org-2', firstName: 'Brian', lastName: 'Taylor', email: 'btaylor@demoindustrial.com', role: 'Maintenance Technician', status: 'active' },
  { id: 'emp-11', orgId: 'org-2', firstName: 'Jessica', lastName: 'White', email: 'jwhite@demoindustrial.com', role: 'Forklift Operator', status: 'active' },
  { id: 'emp-12', orgId: 'org-2', firstName: 'Daniel', lastName: 'Harris', email: 'dharris@demoindustrial.com', role: 'Pipefitter', status: 'inactive' },
];

const documents: MockDocument[] = [
  {
    id: 'doc-1',
    orgId: 'org-1',
    fileName: 'fall_protection_cert_jan2026.pdf',
    uploadDate: '2026-01-20',
    status: 'Approved',
    courseName: 'Fall Protection (1926.501)',
    completionDate: '2026-01-15',
    instructorName: 'Tom Richards',
    oshaStandard: '1926.501',
    traineeIds: ['emp-1', 'emp-2', 'emp-5'],
  },
  {
    id: 'doc-2',
    orgId: 'org-1',
    fileName: 'hazcom_training_records.pdf',
    uploadDate: '2026-01-25',
    status: 'Approved',
    courseName: 'Hazard Communication (1910.1200)',
    completionDate: '2026-01-22',
    instructorName: 'Maria Garcia',
    oshaStandard: '1910.1200',
    traineeIds: ['emp-1', 'emp-4'],
  },
  {
    id: 'doc-3',
    orgId: 'org-1',
    fileName: 'scaffolding_feb2026.pdf',
    uploadDate: '2026-02-05',
    status: 'Needs Review',
    courseName: 'Scaffolding Safety (1926.451)',
    completionDate: '2026-02-01',
    instructorName: 'Greg Palmer',
    oshaStandard: '1926.451',
    traineeIds: ['emp-3', 'emp-5', 'emp-6'],
  },
  {
    id: 'doc-4',
    orgId: 'org-1',
    fileName: 'electrical_safety_scan.pdf',
    uploadDate: '2026-02-08',
    status: 'Processing',
  },
  {
    id: 'doc-5',
    orgId: 'org-2',
    fileName: 'confined_space_entry_cert.pdf',
    uploadDate: '2026-01-18',
    status: 'Approved',
    courseName: 'Confined Space Entry (1910.146)',
    completionDate: '2026-01-10',
    instructorName: 'Nancy Bell',
    oshaStandard: '1910.146',
    traineeIds: ['emp-8', 'emp-10'],
  },
  {
    id: 'doc-6',
    orgId: 'org-2',
    fileName: 'lockout_tagout_jan2026.pdf',
    uploadDate: '2026-02-01',
    status: 'Needs Review',
    courseName: 'Lockout/Tagout (1910.147)',
    completionDate: '2026-01-28',
    instructorName: 'Steve Morton',
    oshaStandard: '1910.147',
    traineeIds: ['emp-9', 'emp-11'],
  },
  {
    id: 'doc-7',
    orgId: 'org-2',
    fileName: 'respiratory_protection_incomplete.pdf',
    uploadDate: '2026-02-03',
    status: 'Rejected',
    courseName: 'Respiratory Protection (1910.134)',
    rejectReason: 'Missing instructor signature and completion dates for 2 trainees.',
  },
  {
    id: 'doc-8',
    orgId: 'org-1',
    fileName: 'forklift_operation_batch.pdf',
    uploadDate: '2026-02-10',
    status: 'Processing',
  },
];

const trainingRecords: MockTrainingRecord[] = [
  {
    id: 'tr-1',
    orgId: 'org-1',
    employeeId: 'emp-1',
    courseName: 'Fall Protection (1926.501)',
    completionDate: '2026-01-15',
    expirationDate: '2027-01-15',
    oshaStandard: '1926.501',
    instructorName: 'Tom Richards',
    documentId: 'doc-1',
  },
  {
    id: 'tr-2',
    orgId: 'org-1',
    employeeId: 'emp-2',
    courseName: 'Fall Protection (1926.501)',
    completionDate: '2026-01-15',
    expirationDate: '2027-01-15',
    oshaStandard: '1926.501',
    instructorName: 'Tom Richards',
    documentId: 'doc-1',
  },
  {
    id: 'tr-3',
    orgId: 'org-1',
    employeeId: 'emp-1',
    courseName: 'Hazard Communication (1910.1200)',
    completionDate: '2026-01-22',
    expirationDate: '2027-01-22',
    oshaStandard: '1910.1200',
    instructorName: 'Maria Garcia',
    documentId: 'doc-2',
  },
  {
    id: 'tr-4',
    orgId: 'org-1',
    employeeId: 'emp-4',
    courseName: 'Scaffolding Safety (1926.451)',
    completionDate: '2025-03-10',
    expirationDate: '2025-09-10',
    oshaStandard: '1926.451',
    instructorName: 'Greg Palmer',
  },
  {
    id: 'tr-5',
    orgId: 'org-1',
    employeeId: 'emp-5',
    courseName: 'Electrical Safety (1910.303)',
    completionDate: '2025-08-20',
    expirationDate: '2026-02-20',
    oshaStandard: '1910.303',
    instructorName: 'James Wilson',
  },
  {
    id: 'tr-6',
    orgId: 'org-1',
    employeeId: 'emp-6',
    courseName: 'Respiratory Protection (1910.134)',
    completionDate: '2025-12-01',
    expirationDate: '2026-03-01',
    oshaStandard: '1910.134',
    instructorName: 'Nancy Bell',
  },
];

const certificates: MockCertificate[] = [
  {
    id: 'cert-1',
    orgId: 'org-1',
    employeeId: 'emp-1',
    courseName: 'Fall Protection (1926.501)',
    issueDate: '2026-01-15',
    expirationDate: '2027-01-15',
    certificateNumber: 'CERT-48271',
    documentId: 'doc-1',
  },
  {
    id: 'cert-2',
    orgId: 'org-1',
    employeeId: 'emp-2',
    courseName: 'Fall Protection (1926.501)',
    issueDate: '2026-01-15',
    expirationDate: '2027-01-15',
    certificateNumber: 'CERT-48272',
    documentId: 'doc-1',
  },
  {
    id: 'cert-3',
    orgId: 'org-1',
    employeeId: 'emp-1',
    courseName: 'Hazard Communication (1910.1200)',
    issueDate: '2026-01-22',
    expirationDate: '2027-01-22',
    certificateNumber: 'CERT-48305',
    documentId: 'doc-2',
  },
  {
    id: 'cert-4',
    orgId: 'org-2',
    employeeId: 'emp-8',
    courseName: 'Confined Space Entry (1910.146)',
    issueDate: '2026-01-10',
    expirationDate: '2027-01-10',
    certificateNumber: 'CERT-48190',
    documentId: 'doc-5',
  },
];

const walletCards: MockWalletCard[] = [
  {
    id: 'wc-1',
    orgId: 'org-1',
    employeeId: 'emp-1',
    courseName: 'Fall Protection (1926.501)',
    trainingDate: '2026-01-15',
    expirationDate: '2027-01-15',
    cardNumber: 'WC-90341',
    documentId: 'doc-1',
  },
  {
    id: 'wc-2',
    orgId: 'org-1',
    employeeId: 'emp-2',
    courseName: 'Fall Protection (1926.501)',
    trainingDate: '2026-01-15',
    expirationDate: '2027-01-15',
    cardNumber: 'WC-90342',
    documentId: 'doc-1',
  },
  {
    id: 'wc-3',
    orgId: 'org-2',
    employeeId: 'emp-8',
    courseName: 'Confined Space Entry (1910.146)',
    trainingDate: '2026-01-10',
    expirationDate: '2027-01-10',
    cardNumber: 'WC-90210',
    documentId: 'doc-5',
  },
];

const supportTickets: MockSupportTicket[] = [
  {
    id: 'ticket-1',
    orgId: 'org-1',
    category: 'AI ingestion problems',
    subject: 'PDF scan not recognized by AI parser',
    status: 'Open',
    createdDate: '2026-02-08',
    notes: [
      { text: 'Uploaded electrical_safety_scan.pdf but the system shows Processing for over 24 hours.', date: '2026-02-08' },
    ],
  },
  {
    id: 'ticket-2',
    orgId: 'org-1',
    category: 'Training records',
    subject: 'Incorrect expiration date on scaffolding record',
    status: 'In Progress',
    createdDate: '2026-02-03',
    notes: [
      { text: 'The scaffolding safety record for Robert Johnson shows a 6-month expiration instead of 1 year.', date: '2026-02-03' },
      { text: 'Investigating the original document to verify the correct expiration period.', date: '2026-02-05' },
    ],
  },
  {
    id: 'ticket-3',
    orgId: 'org-2',
    category: 'Certificate generation',
    subject: 'Certificate PDF not downloading',
    status: 'Resolved',
    createdDate: '2026-01-20',
    notes: [
      { text: 'Unable to download the Confined Space Entry certificate for Kevin Thompson.', date: '2026-01-20' },
      { text: 'Cleared browser cache and regenerated the certificate. Download works now.', date: '2026-01-21' },
    ],
  },
  {
    id: 'ticket-4',
    orgId: 'org-2',
    category: 'Login / account issues',
    subject: 'Cannot reset password for new employee account',
    status: 'Open',
    createdDate: '2026-02-06',
    notes: [
      { text: 'Daniel Harris was recently re-hired and his old account is locked. Need password reset.', date: '2026-02-06' },
    ],
  },
  {
    id: 'ticket-5',
    orgId: 'org-1',
    category: 'Feature requests',
    subject: 'Bulk upload for multiple training documents',
    status: 'Open',
    createdDate: '2026-01-30',
    notes: [
      { text: 'Would like the ability to upload a ZIP file containing multiple training certificates at once.', date: '2026-01-30' },
    ],
  },
];

export const db = {
  organizations,
  employees,
  documents,
  trainingRecords,
  certificates,
  walletCards,
  supportTickets,
};
