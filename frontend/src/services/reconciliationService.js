import api from './api.js';
import { WORKFLOW_ENDPOINTS } from './apiContract.js';

const fallbackReconciliations = [
  {
    id: 'rec_001',
    accountName: 'HDFC Bank - General Operations (A/C ****4891)',
    statementPeriod: '01 Oct 2026 – 24 Oct 2026',
    statementClosingBalance: 612350,
    bookClosingBalance: 612350,
    differenceAmount: 0,
    status: 'RECONCILED',
    preparedBy: 'Priya Sharma (Treasurer)',
    reviewedBy: 'Suresh Menon (Auditor)',
    reconciledAt: '2026-10-24T18:00:00.000Z',
    matchedTransactionsCount: 42,
    unmatchedEntries: [],
  },
  {
    id: 'rec_002',
    accountName: 'SBI - Capital Sinking Reserve (A/C ****9102)',
    statementPeriod: '01 Oct 2026 – 24 Oct 2026',
    statementClosingBalance: 1457400,
    bookClosingBalance: 1445400,
    differenceAmount: 12000,
    status: 'DISCREPANCY_UNRESOLVED',
    preparedBy: 'Priya Sharma (Treasurer)',
    reviewedBy: 'Pending Auditor Review',
    reconciledAt: null,
    matchedTransactionsCount: 8,
    unmatchedEntries: [
      {
        id: 'unm_1',
        date: '2026-10-20',
        description: 'GreenThumb Nurseries Cheque #094102',
        amount: 12000,
        type: 'UNCLEARED_CHEQUE',
        discrepancyNote: 'Cheque issued by society on Oct 20; not yet presented by vendor at SBI clearing branch.',
      },
    ],
  },
];

export const reconciliationService = {
  async getReconciliations() {
    try {
      const response = await api.get(WORKFLOW_ENDPOINTS.RECONCILIATION);
      return {
        reconciliations: response.data?.data?.reconciliations || response.data?.data || response.data,
        isLiveBackend: true,
      };
    } catch {
      return { reconciliations: fallbackReconciliations, isLiveBackend: false };
    }
  },

  async runReconciliationVerification(id) {
    try {
      const response = await api.post(`${WORKFLOW_ENDPOINTS.RECONCILIATION}/${id}/verify`);
      return response.data?.data || response.data;
    } catch (error) {
      const item = fallbackReconciliations.find((r) => r.id === id);
      if (item) {
        if (item.differenceAmount === 0) {
          item.status = 'RECONCILED';
          item.reconciledAt = new Date().toISOString();
          return item;
        } else {
          throw new Error(`Cannot finalize reconciliation: Unresolved difference of ₹ ${item.differenceAmount} detected against bank statement.`);
        }
      }
      throw error;
    }
  },
};
