import api from './api.js';
import { WORKFLOW_ENDPOINTS, COMPLIANCE_STATUS } from './apiContract.js';

const fallbackFilings = [
  {
    id: 'cmp_001',
    filingType: 'Society Annual Return (Form V)',
    statutoryBody: 'Registrar of Societies (Karnataka)',
    financialPeriod: 'FY 2025-26',
    deadline: '2026-09-30', // Backend supplied
    submissionDate: '2026-09-24',
    status: COMPLIANCE_STATUS.FILED,
    responsiblePerson: 'Dr. Anand Rao (President) & Suresh Menon (Auditor)',
    acknowledgementRef: 'KAR-SOC-RET-2026-98102',
    supportingDocument: 'Form_V_Signed_Audited_Accounts.pdf',
    notes: 'Annual returns and certified audited balance sheets formally accepted by District Registrar.',
  },
  {
    id: 'cmp_002',
    filingType: 'Quarterly GST-TDS Return (GSTR-7)',
    statutoryBody: 'Goods & Services Tax Department',
    financialPeriod: 'Q2 FY 2026-27 (Jul - Sep)',
    deadline: '2026-10-10',
    submissionDate: '2026-10-08',
    status: COMPLIANCE_STATUS.FILED,
    responsiblePerson: 'Priya Sharma (Treasurer)',
    acknowledgementRef: 'GSTN-GSTR7-ACK-881920',
    supportingDocument: 'GSTR7_Q2_Ack_Challan.pdf',
    notes: 'TDS deducted on security and lift AMC vendor payments deposited with central government.',
  },
  {
    id: 'cmp_003',
    filingType: 'Annual Elevator Safety Fitness Certificate',
    statutoryBody: 'Chief Inspectorate of Lifts & Escalators',
    financialPeriod: 'Annual Inspection 2026',
    deadline: '2026-11-15',
    submissionDate: null,
    status: COMPLIANCE_STATUS.PENDING,
    responsiblePerson: 'Praveen Kumar (Maintenance In-Charge)',
    acknowledgementRef: null,
    supportingDocument: null,
    notes: 'Inspection scheduled for Nov 2nd with Johnson Lifts engineers.',
  },
  {
    id: 'cmp_004',
    filingType: 'Fire Safety NOC Renewal Inspection',
    statutoryBody: 'Karnataka Fire and Emergency Services',
    financialPeriod: 'Bi-annual Renewal',
    deadline: '2026-10-15',
    submissionDate: null,
    status: COMPLIANCE_STATUS.OVERDUE,
    responsiblePerson: 'Management Committee',
    acknowledgementRef: null,
    supportingDocument: null,
    notes: 'Fire pump pressure gauge replacement pending before final fire officer site signoff.',
  },
];

export const complianceService = {
  async getFilings(params = {}) {
    try {
      const response = await api.get(WORKFLOW_ENDPOINTS.COMPLIANCE, { params });
      return {
        filings: response.data?.data?.filings || response.data?.data || response.data,
        isLiveBackend: true,
      };
    } catch {
      let filtered = [...fallbackFilings];
      if (params.status && params.status !== 'ALL') {
        filtered = filtered.filter((f) => f.status === params.status);
      }
      return { filings: filtered, isLiveBackend: false };
    }
  },

  async recordFiling(id, updateData) {
    try {
      const response = await api.put(`${WORKFLOW_ENDPOINTS.COMPLIANCE}/${id}`, updateData);
      return response.data?.data || response.data;
    } catch (error) {
      const item = fallbackFilings.find((f) => f.id === id);
      if (item) {
        item.status = COMPLIANCE_STATUS.FILED;
        item.acknowledgementRef = updateData.acknowledgementRef;
        item.submissionDate = new Date().toISOString().split('T')[0];
        item.notes = updateData.notes || item.notes;
        return item;
      }
      throw error;
    }
  },
};
