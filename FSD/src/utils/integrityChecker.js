/**
 * Database and Seed Data Referential Integrity Checker
 * Verifies foreign keys, business rules, and financial consistency.
 */

const { verifyFundBalance } = require('./balanceCalculator');

/**
 * Checks integrity across all dataset collections
 * @param {Object} dataset - Object containing arrays of entities: { societies, users, funds, transactions, compliance, documents, reconciliations, auditLogs, auditObservations, events, expenses, residentQueries }
 * @returns {{ isValid: boolean, summary: Object, errors: Array<string>, warnings: Array<string> }}
 */
function checkDatasetIntegrity(dataset) {
  const errors = [];
  const warnings = [];

  const {
    societies = [],
    users = [],
    funds = [],
    transactions = [],
    compliance = [],
    documents = [],
    reconciliations = [],
    auditLogs = [],
    auditObservations = [],
    events = [],
    expenses = [],
    residentQueries = []
  } = dataset;

  const societyIds = new Set(societies.map((s) => String(s._id)));
  const userIds = new Set(users.map((u) => String(u._id)));
  const fundIds = new Set(funds.map((f) => String(f._id)));
  const documentIds = new Set(documents.map((d) => String(d._id)));
  const eventIds = new Set(events.map((e) => String(e._id)));
  const transactionIds = new Set(transactions.map((t) => String(t._id)));

  // 1. Societies
  const societyCodes = new Set();
  for (const s of societies) {
    if (societyCodes.has(s.code)) {
      errors.push(`Duplicate society code detected: ${s.code}`);
    }
    societyCodes.add(s.code);
  }

  // 2. Users
  const userEmails = new Set();
  for (const u of users) {
    if (userEmails.has(u.email)) {
      errors.push(`Duplicate user email detected: ${u.email}`);
    }
    userEmails.add(u.email);

    if (!societyIds.has(String(u.society))) {
      errors.push(`User ${u.email} references non-existent society ID: ${u.society}`);
    }
  }

  // 3. Funds
  for (const f of funds) {
    if (!societyIds.has(String(f.society))) {
      errors.push(`Fund "${f.name}" references non-existent society ID: ${f.society}`);
    }
    if (f.openingBalance < 0) {
      errors.push(`Fund "${f.name}" has negative opening balance: ${f.openingBalance}`);
    }
  }

  // 4. Transactions
  for (const t of transactions) {
    if (!societyIds.has(String(t.society))) {
      errors.push(`Transaction ${t.referenceNumber} references non-existent society ID: ${t.society}`);
    }
    if (!fundIds.has(String(t.fund))) {
      errors.push(`Transaction ${t.referenceNumber} references non-existent fund ID: ${t.fund}`);
    }
    if (t.destinationFund && !fundIds.has(String(t.destinationFund))) {
      errors.push(`Transaction ${t.referenceNumber} references non-existent destination fund ID: ${t.destinationFund}`);
    }
    if (t.destinationFund && String(t.fund) === String(t.destinationFund)) {
      errors.push(`Transfer transaction ${t.referenceNumber} has identical source and destination fund`);
    }
    if (!userIds.has(String(t.createdBy))) {
      errors.push(`Transaction ${t.referenceNumber} references non-existent createdBy user ID: ${t.createdBy}`);
    }
    if (t.approvedBy && !userIds.has(String(t.approvedBy))) {
      errors.push(`Transaction ${t.referenceNumber} references non-existent approvedBy user ID: ${t.approvedBy}`);
    }
    if (t.amount <= 0) {
      errors.push(`Transaction ${t.referenceNumber} has non-positive amount: ${t.amount}`);
    }
    if (t.supportingDocuments) {
      for (const docId of t.supportingDocuments) {
        if (!documentIds.has(String(docId))) {
          warnings.push(`Transaction ${t.referenceNumber} references unseeded document ID: ${docId}`);
        }
      }
    }
  }

  // 5. Fund Balance Verification
  for (const f of funds) {
    const check = verifyFundBalance(f, transactions);
    if (!check.isConsistent) {
      errors.push(
        `Financial inconsistency in Fund "${f.name}" (ID: ${f._id}): Recorded balance ${f.currentBalance} INR != Calculated balance ${check.calculatedBalance} INR (Diff: ${check.difference})`
      );
    }
  }

  // 6. Compliance Records
  for (const c of compliance) {
    if (!societyIds.has(String(c.society))) {
      errors.push(`Compliance record "${c.complianceType}" references non-existent society ID: ${c.society}`);
    }
    if (!userIds.has(String(c.responsiblePerson))) {
      errors.push(`Compliance record "${c.complianceType}" references non-existent responsible person: ${c.responsiblePerson}`);
    }
    if (!userIds.has(String(c.createdBy))) {
      errors.push(`Compliance record "${c.complianceType}" references non-existent createdBy user: ${c.createdBy}`);
    }
  }

  // 7. Documents
  for (const d of documents) {
    if (!societyIds.has(String(d.society))) {
      errors.push(`Document "${d.originalFilename}" references non-existent society ID: ${d.society}`);
    }
    if (!userIds.has(String(d.uploadedBy))) {
      errors.push(`Document "${d.originalFilename}" references non-existent uploadedBy user: ${d.uploadedBy}`);
    }
  }

  // 8. Reconciliations
  for (const r of reconciliations) {
    if (!societyIds.has(String(r.society))) {
      errors.push(`Reconciliation record references non-existent society ID: ${r.society}`);
    }
    if (!fundIds.has(String(r.fund))) {
      errors.push(`Reconciliation record references non-existent fund ID: ${r.fund}`);
    }
    if (!userIds.has(String(r.preparedBy))) {
      errors.push(`Reconciliation record references non-existent preparedBy user: ${r.preparedBy}`);
    }
    const expectedDiff = Math.round((r.statementBalance - r.systemCalculatedBalance) * 100) / 100;
    if (Math.abs(expectedDiff - r.differenceAmount) > 0.01) {
      errors.push(
        `Reconciliation record difference amount mismatch: recorded ${r.differenceAmount}, expected ${expectedDiff}`
      );
    }
  }

  // 9. Audit Logs
  for (const a of auditLogs) {
    if (!societyIds.has(String(a.society))) {
      errors.push(`AuditLog references non-existent society ID: ${a.society}`);
    }
    if (!userIds.has(String(a.actor))) {
      errors.push(`AuditLog references non-existent actor user: ${a.actor}`);
    }
  }

  // 10. Audit Observations
  for (const o of auditObservations) {
    if (!societyIds.has(String(o.society))) {
      errors.push(`AuditObservation "${o.title}" references non-existent society ID: ${o.society}`);
    }
    if (!userIds.has(String(o.assignedPerson))) {
      errors.push(`AuditObservation "${o.title}" references non-existent assignedPerson: ${o.assignedPerson}`);
    }
    if (!userIds.has(String(o.createdBy))) {
      errors.push(`AuditObservation "${o.title}" references non-existent createdBy: ${o.createdBy}`);
    }
  }

  // 11. Events
  for (const e of events) {
    if (!societyIds.has(String(e.society))) {
      errors.push(`Event "${e.title}" references non-existent society ID: ${e.society}`);
    }
    if (!fundIds.has(String(e.relatedFund))) {
      errors.push(`Event "${e.title}" references non-existent fund ID: ${e.relatedFund}`);
    }
    if (!userIds.has(String(e.organizedBy))) {
      errors.push(`Event "${e.title}" references non-existent organizer: ${e.organizedBy}`);
    }
    if (new Date(e.endDate) < new Date(e.startDate)) {
      errors.push(`Event "${e.title}" has end date before start date`);
    }
  }

  // 12. Expenses
  for (const ex of expenses) {
    if (!societyIds.has(String(ex.society))) {
      errors.push(`Expense "${ex.title}" references non-existent society ID: ${ex.society}`);
    }
    if (ex.event && !eventIds.has(String(ex.event))) {
      errors.push(`Expense "${ex.title}" references non-existent event ID: ${ex.event}`);
    }
    if (!fundIds.has(String(ex.fund))) {
      errors.push(`Expense "${ex.title}" references non-existent fund ID: ${ex.fund}`);
    }
    if (!userIds.has(String(ex.requestedBy))) {
      errors.push(`Expense "${ex.title}" references non-existent requester: ${ex.requestedBy}`);
    }
    if (ex.requestedAmount <= 0) {
      errors.push(`Expense "${ex.title}" has non-positive requestedAmount: ${ex.requestedAmount}`);
    }
  }

  // 13. Resident Queries
  for (const q of residentQueries) {
    if (!societyIds.has(String(q.society))) {
      errors.push(`Resident query "${q.subject}" references non-existent society ID: ${q.society}`);
    }
    if (!userIds.has(String(q.resident))) {
      errors.push(`Resident query "${q.subject}" references non-existent resident: ${q.resident}`);
    }
  }

  return {
    isValid: errors.length === 0,
    summary: {
      societiesCount: societies.length,
      usersCount: users.length,
      fundsCount: funds.length,
      transactionsCount: transactions.length,
      complianceCount: compliance.length,
      documentsCount: documents.length,
      reconciliationsCount: reconciliations.length,
      auditLogsCount: auditLogs.length,
      auditObservationsCount: auditObservations.length,
      eventsCount: events.length,
      expensesCount: expenses.length,
      residentQueriesCount: residentQueries.length
    },
    errors,
    warnings
  };
}

module.exports = {
  checkDatasetIntegrity
};
