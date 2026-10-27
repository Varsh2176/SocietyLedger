# SocietyLedger — Shared REST API Contracts

This document standardizes request/response contracts across Person 1 (Frontend), Person 2 (Backend), Person 3 (Database), and Person 4 (Audit).

## 1. Global Standards
- Base URL: `/api/v1`
- Content Type: `application/json`
- Authentication Header: `Authorization: Bearer <JWT_TOKEN>`
- Tenant Isolation: Scoped automatically from JWT payload (`req.user.society`)

Standard Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Standard Error Response:
```json
{
  "success": false,
  "error": "Validation error message",
  "details": [ ... ]
}
```

---

## 2. Compliance Management Endpoints (Person 3)

### `GET /api/v1/compliance`
Returns paginated list of statutory compliance obligations for the society.
- Query Parameters: `status`, `complianceCategory`, `financialYear`, `page`, `limit`
- Access: Resident, Treasurer, Committee Member, Auditor, Society Administrator

### `POST /api/v1/compliance`
Creates a new compliance obligation record.
- Access: Treasurer, Society Administrator
- Body:
```json
{
  "complianceCategory": "Tax",
  "complianceType": "TDS Return Filing - Form 26Q",
  "financialYear": "2025-2026",
  "applicablePeriod": "Q3 (Oct-Dec 2025)",
  "dueDate": "2026-01-31T00:00:00.000Z",
  "responsiblePerson": "671...",
  "assignedRole": "Treasurer",
  "taxLiabilityAmount": 38000,
  "notes": "Quarterly contractor TDS deduction"
}
```

### `PATCH /api/v1/compliance/:id/status`
Updates filing status, submission dates, and acknowledgement references.
- Access: Treasurer, Society Administrator
- Body:
```json
{
  "status": "Filed",
  "submissionDate": "2026-01-28T00:00:00.000Z",
  "acknowledgementNumber": "ACK-TDS-2026-9921",
  "challanReference": "CHALLAN-2026-441",
  "paidAmount": 38000,
  "supportingDocuments": ["671..."]
}
```

---

## 3. Shared Document Vault Endpoints (Person 3)

### `GET /api/v1/documents`
Lists digital document metadata filtered by user permissions.
- Query Parameters: `category`, `relatedEntityType`, `verificationStatus`
- Access: Filtered based on `accessClassification`

### `POST /api/v1/documents`
Registers uploaded document metadata and records checksum.
- Access: Resident (for receipts), Committee Member, Treasurer, Auditor
- Body:
```json
{
  "originalFilename": "Invoice_Apex_Security_Dec2025.pdf",
  "documentCategory": "Invoice",
  "mimeType": "application/pdf",
  "fileSize": 184500,
  "storageProvider": "local",
  "storageKey": "vault/soc-001/invoices/inv_123.pdf",
  "relatedEntityType": "Expense",
  "relatedEntityId": "671...",
  "accessClassification": "Committee",
  "checksum": "8f4811..."
}
```

---

## 4. Bank Reconciliation Endpoints (Person 3)

### `GET /api/v1/reconciliations`
Returns monthly bank reconciliation statements.
- Access: Treasurer, Auditor, Committee Member

### `POST /api/v1/reconciliations`
Submits a monthly reconciliation report comparing bank statement vs system ledger.
- Body:
```json
{
  "fund": "671...",
  "statementPeriod": {
    "startDate": "2025-05-01T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z",
    "label": "May 2025 Bank Reconciliation"
  },
  "openingBalance": 800000,
  "closingBalance": 865000,
  "statementBalance": 877500,
  "systemCalculatedBalance": 865000,
  "differenceAmount": 12500,
  "reconciliationStatus": "Discrepancy Detected",
  "unreconciledItems": [
    {
      "description": "Uncleared cheque #44521",
      "amount": 12500,
      "reason": "Transit delay"
    }
  ]
}
```
