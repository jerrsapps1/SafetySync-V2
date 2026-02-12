import {
  db,
  generateId,
  type MockOrganization,
  type MockEmployee,
  type MockDocument,
  type MockTrainingRecord,
  type MockCertificate,
  type MockWalletCard,
  type MockSupportTicket,
} from './db';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

function randomNum(digits: number): string {
  return Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0');
}

export async function getOrganizations(): Promise<MockOrganization[]> {
  await delay();
  return db.organizations.map(o => ({ ...o }));
}

export async function setActiveOrganization(orgId: string): Promise<MockOrganization> {
  await delay();
  const org = db.organizations.find(o => o.id === orgId);
  if (!org) throw new Error(`Organization not found: ${orgId}`);
  return { ...org };
}

export async function listEmployees(orgId: string): Promise<MockEmployee[]> {
  await delay();
  return db.employees.filter(e => e.orgId === orgId).map(e => ({ ...e }));
}

export async function getEmployee(id: string): Promise<MockEmployee | undefined> {
  await delay();
  const emp = db.employees.find(e => e.id === id);
  return emp ? { ...emp } : undefined;
}

export async function createEmployee(orgId: string, payload: Omit<MockEmployee, 'id' | 'orgId'>): Promise<MockEmployee> {
  await delay();
  const newEmployee: MockEmployee = {
    id: generateId(),
    orgId,
    ...payload,
  };
  db.employees.push(newEmployee);
  return { ...newEmployee };
}

export async function updateEmployee(id: string, payload: Partial<MockEmployee>): Promise<MockEmployee> {
  await delay();
  const idx = db.employees.findIndex(e => e.id === id);
  if (idx === -1) throw new Error(`Employee not found: ${id}`);
  db.employees[idx] = { ...db.employees[idx], ...payload };
  return { ...db.employees[idx] };
}

export async function listDocuments(orgId: string): Promise<MockDocument[]> {
  await delay();
  return db.documents.filter(d => d.orgId === orgId).map(d => ({ ...d }));
}

export async function uploadDocument(orgId: string, fileMeta: { fileName: string }): Promise<MockDocument> {
  await delay(400);
  const newDoc: MockDocument = {
    id: generateId(),
    orgId,
    fileName: fileMeta.fileName,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'Processing',
  };
  db.documents.push(newDoc);
  return { ...newDoc };
}

export async function getDocument(id: string): Promise<MockDocument | undefined> {
  await delay();
  const doc = db.documents.find(d => d.id === id);
  return doc ? { ...doc } : undefined;
}

export async function reviewDocument(id: string, edits: Partial<MockDocument>): Promise<MockDocument> {
  await delay();
  const idx = db.documents.findIndex(d => d.id === id);
  if (idx === -1) throw new Error(`Document not found: ${id}`);
  db.documents[idx] = { ...db.documents[idx], ...edits, status: 'Needs Review' };
  return { ...db.documents[idx] };
}

export async function approveDocument(id: string): Promise<{
  document: MockDocument;
  trainingRecords: MockTrainingRecord[];
  certificates: MockCertificate[];
  walletCards: MockWalletCard[];
}> {
  await delay(400);
  const idx = db.documents.findIndex(d => d.id === id);
  if (idx === -1) throw new Error(`Document not found: ${id}`);

  const doc = db.documents[idx];
  db.documents[idx] = { ...doc, status: 'Approved' };
  const approvedDoc = { ...db.documents[idx] };

  const createdRecords: MockTrainingRecord[] = [];
  const createdCerts: MockCertificate[] = [];
  const createdCards: MockWalletCard[] = [];

  const traineeIds = doc.traineeIds || [];
  const completionDate = doc.completionDate || new Date().toISOString().split('T')[0];
  const year = parseInt(completionDate.split('-')[0]);
  const expirationDate = `${year + 1}${completionDate.slice(4)}`;

  for (const employeeId of traineeIds) {
    const record: MockTrainingRecord = {
      id: generateId(),
      orgId: doc.orgId,
      employeeId,
      courseName: doc.courseName || 'Unknown Course',
      completionDate,
      expirationDate,
      oshaStandard: doc.oshaStandard || '',
      instructorName: doc.instructorName || '',
      documentId: doc.id,
    };
    db.trainingRecords.push(record);
    createdRecords.push({ ...record });

    const cert: MockCertificate = {
      id: generateId(),
      orgId: doc.orgId,
      employeeId,
      courseName: doc.courseName || 'Unknown Course',
      issueDate: completionDate,
      expirationDate,
      certificateNumber: `CERT-${randomNum(5)}`,
      documentId: doc.id,
    };
    db.certificates.push(cert);
    createdCerts.push({ ...cert });

    const card: MockWalletCard = {
      id: generateId(),
      orgId: doc.orgId,
      employeeId,
      courseName: doc.courseName || 'Unknown Course',
      trainingDate: completionDate,
      expirationDate,
      cardNumber: `WC-${randomNum(5)}`,
      documentId: doc.id,
    };
    db.walletCards.push(card);
    createdCards.push({ ...card });
  }

  return {
    document: approvedDoc,
    trainingRecords: createdRecords,
    certificates: createdCerts,
    walletCards: createdCards,
  };
}

export async function rejectDocument(id: string, reason: string): Promise<MockDocument> {
  await delay();
  const idx = db.documents.findIndex(d => d.id === id);
  if (idx === -1) throw new Error(`Document not found: ${id}`);
  db.documents[idx] = { ...db.documents[idx], status: 'Rejected', rejectReason: reason };
  return { ...db.documents[idx] };
}

export async function listTrainingRecords(orgId: string): Promise<MockTrainingRecord[]> {
  await delay();
  return db.trainingRecords.filter(r => r.orgId === orgId).map(r => ({ ...r }));
}

export async function createTrainingRecord(payload: Omit<MockTrainingRecord, 'id'>): Promise<MockTrainingRecord> {
  await delay();
  const record: MockTrainingRecord = {
    id: generateId(),
    ...payload,
  };
  db.trainingRecords.push(record);
  return { ...record };
}

export async function listCertificates(orgId: string): Promise<MockCertificate[]> {
  await delay();
  return db.certificates.filter(c => c.orgId === orgId).map(c => ({ ...c }));
}

export async function createCertificate(payload: Omit<MockCertificate, 'id' | 'certificateNumber'>): Promise<MockCertificate> {
  await delay();
  const cert: MockCertificate = {
    id: generateId(),
    certificateNumber: `CERT-${randomNum(5)}`,
    ...payload,
  };
  db.certificates.push(cert);
  return { ...cert };
}

export async function listWalletCards(orgId: string): Promise<MockWalletCard[]> {
  await delay();
  return db.walletCards.filter(w => w.orgId === orgId).map(w => ({ ...w }));
}

export async function createWalletCard(payload: Omit<MockWalletCard, 'id' | 'cardNumber'>): Promise<MockWalletCard> {
  await delay();
  const card: MockWalletCard = {
    id: generateId(),
    cardNumber: `WC-${randomNum(5)}`,
    ...payload,
  };
  db.walletCards.push(card);
  return { ...card };
}

export async function listSupportTickets(): Promise<MockSupportTicket[]> {
  await delay();
  return db.supportTickets.map(t => ({ ...t, notes: t.notes.map(n => ({ ...n })) }));
}

export async function updateTicketStatus(id: string, status: MockSupportTicket['status']): Promise<MockSupportTicket> {
  await delay();
  const idx = db.supportTickets.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Ticket not found: ${id}`);
  db.supportTickets[idx] = { ...db.supportTickets[idx], status };
  return { ...db.supportTickets[idx], notes: db.supportTickets[idx].notes.map(n => ({ ...n })) };
}

export async function addTicketNote(id: string, note: string): Promise<MockSupportTicket> {
  await delay();
  const idx = db.supportTickets.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Ticket not found: ${id}`);
  db.supportTickets[idx].notes.push({
    text: note,
    date: new Date().toISOString().split('T')[0],
  });
  return { ...db.supportTickets[idx], notes: db.supportTickets[idx].notes.map(n => ({ ...n })) };
}
