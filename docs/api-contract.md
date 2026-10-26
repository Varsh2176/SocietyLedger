# SocietyLedger API Contract & Architecture Specification

This document defines the official endpoints, request/response models, and governance rules agreed for the **SocietyLedger** platform across all modules.

---

## 1. Security & Authentication Architecture

- **Session Handling:** `HttpOnly`, `SameSite=Lax/Strict`, `Secure` cookies for authentication.
- **Client Storage:** Sensitive tokens and passwords are **never** stored in `localStorage` or `sessionStorage`.
- **CORS Credentials:** All client requests specify `withCredentials: true`.
- **Role Enforcement:** All API endpoints independently verify the user's role and society scope on the backend. Frontend route guards are for navigation assistance only.
- **Data Isolation:** All operations enforce society tenant isolation (`societyId`). Cross-society access is strictly prohibited and returns `403 Forbidden`.

### User Roles
- `Society Administrator`
- `Treasurer`
- `Committee Member`
- `Auditor`
- `Resident`

---

## 2. Standard Financial Enums

### Transaction Statuses
- `PENDING`: Newly posted voucher awaiting required signoffs.
- `APPROVED`: Sanctioned by the Treasurer or Management Committee.
- `PAID`: Disbursed through bank transfer, UPI, or cheque.
- `REJECTED`: Disapproved by committee due to policy violations or lack of bids.
- `REVERSED`: Corrective accounting reversal with mandatory audit justification. Finalized transactions are **never** deleted.
- `RECONCILED`: Audited and matched against verified bank statements.

### Transaction Types
- `INCOME`: Maintenance collections, deposit interest, penalty fees.
- `EXPENSE`: Operating expenses, AMC contracts, utility bills, capital works.
- `TRANSFER`: Transfer between internal society bank sub-ledgers.

### Fund Classifications
- `CORPUS`: Permanent fixed deposit reserve pool.
- `SINKING`: Ring-fenced capital asset replacement pool (lifts, exterior paint, generators).
- `OPERATIONAL`: Monthly liquidity for recurring operational bills.
- `SPECIAL_PROJECT`: Designated capital fund for member-approved initiatives (e.g. rooftop solar).

---

## 3. Financial & Workflow Endpoints Contract

### 3.1. Authentication (`/api/auth/*`)
- **`POST /api/auth/register`**: Register new resident member (`name`, `email`, `password`, `phone`, `apartmentNumber`, `societyCode`). Public registration defaults strictly to `Resident` role.
- **`POST /api/auth/login`**: Authenticate with `email` & `password`. Issues HttpOnly secure cookie and returns `{ success, user, accessToken }`.
- **`POST /api/auth/logout`**: Clears authentication session cookie.
- **`GET /api/auth/me`**: Fetches current authenticated profile with populated society details.
- **`POST /api/auth/refresh`**: Refreshes session credentials.

### 3.2. Dashboard Aggregations (`GET /api/dashboard/summary`)
- **Query Params:** `?period=current_month | last_quarter | financial_year`
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "totalAvailableFunds": 4897750,
      "corpusFundBalance": 2840000,
      "maintenanceFundBalance": 612350,
      "sinkingFundBalance": 1445400,
      "totalIncomeMonth": 1845000,
      "totalExpenseMonth": 236400,
      "pendingApprovalsCount": 3,
      "pendingReconciliationsCount": 2,
      "overdueComplianceCount": 0,
      "openAuditObservationsCount": 1,
      "statutoryAuditStatus": "VERIFIED_FY25_26"
    }
  }
  ```

### 3.3. Dashboard Visualizations (`GET /api/dashboard/charts`)
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "monthlyCashflow": [
        { "month": "Oct 26", "income": 1845000, "expenditure": 236400, "netReserve": 1608600 }
      ],
      "fundDistribution": [
        { "name": "Corpus Reserve", "value": 2840000, "color": "#1E3A8A" }
      ],
      "categoryBreakdown": [
        { "category": "Lift & Elevator AMC", "amount": 48500 }
      ],
      "eventBudgetVsActual": [
        { "event": "Ganesh Utsav", "allocatedBudget": 75000, "actualExpense": 72800 }
      ]
    }
  }
  ```

### 3.4. Fund Management (`/api/funds`)
- **`GET /api/funds`**: List and search funds (`?search=&type=`).
- **`GET /api/funds/:id`**: Single fund details.
- **`POST /api/funds`** (Admin / Treasurer):
  ```json
  {
    "name": "Elevator Modernization Capital Fund",
    "code": "FND-ELEV-26",
    "type": "SINKING",
    "openingBalance": 500000,
    "restrictedUse": true,
    "purpose": "Capital overhaul of 4 passenger elevators in Block A & B.",
    "fiscalYear": "FY 2026-27",
    "bankAccount": "SBI - A/C ****9102"
  }
  ```
- **`PUT /api/funds/:id`** (Admin / Treasurer): Update fund metadata.

### 3.5. General Ledger Transactions (`/api/transactions`)
- **`GET /api/transactions`**: Query parameters `?page=1&limit=10&search=&type=&fund=&status=&startDate=&endDate=&sortKey=&sortOrder=`
- **`GET /api/transactions/:id`**: Single transaction voucher details.
- **`POST /api/transactions`** (Treasurer / Admin):
  ```json
  {
    "reference": "VR-2026-090",
    "date": "2026-10-25",
    "type": "EXPENSE",
    "fund": "Monthly Maintenance & Operational Account",
    "fundCode": "FND-MAINT",
    "category": "Lift AMC",
    "description": "Quarterly comprehensive lift maintenance",
    "amount": 18500,
    "paymentMethod": "NEFT_RTGS",
    "vendorName": "Johnson Lifts Pvt Ltd",
    "invoiceNumber": "INV-JL-2026-441"
  }
  ```
- **`POST /api/transactions/:id/reverse`** (Treasurer / Admin):
  ```json
  {
    "justification": "Duplicate payment voucher posted for Lift AMC."
  }
  ```

### 3.6. Financial Reports (`/api/reports/*`)
- **`GET /api/reports/income-expenditure?period=current_month`**: Official income vs expenditure statement. Internal fund transfers are strictly excluded from external revenue/expenditure.
- **`GET /api/reports/fund-statement?period=current_month`**: Fund-wise opening balance, credits, debits, closing balance, and audit status.
- **`GET /api/reports/balance-sheet?period=current_month`**: Liabilities, assets, and reserve pools balance.

### 3.7. Expense Approvals & Separation of Duties (`/api/approvals`)
- **`GET /api/approvals`**: List pending and reviewed expense requests (`?status=PENDING | APPROVED | REJECTED | INFO_REQUESTED`).
- **`GET /api/approvals/:id`**: Single approval request details.
- **`POST /api/approvals`**: Submit expense request.
- **`POST /api/approvals/:id/decision`** (Committee / Treasurer / Admin):
  ```json
  {
    "action": "APPROVED",
    "comments": "Verified quotation bids and fund balance availability."
  }
  ```
- **Separation-of-Duties Rule:** Requesters are strictly prohibited from approving their own expense requests (returns `403 Forbidden`).

### 3.8. Statutory Compliance Tracking (`/api/compliance`)
- **`GET /api/compliance`**: List statutory compliance filings, deadlines, and statuses (`PENDING`, `FILED`, `OVERDUE`).
- **`GET /api/compliance/:id`**: Single compliance filing details.
- **`POST /api/compliance`** (Admin / Treasurer / Committee): Create compliance requirement.
- **`PUT /api/compliance/:id`** (Admin / Treasurer / Committee / Auditor):
  ```json
  {
    "acknowledgementRef": "KAR-SOC-RET-2026-98102",
    "status": "FILED",
    "notes": "Annual return accepted by Registrar of Societies."
  }
  ```

### 3.9. Document & Evidence Repository (`/api/documents`)
- **`GET /api/documents`**: Query document metadata (`?category=STATUTORY_COMPLIANCE | INVOICE_RECEIPT | UTILITY_BILL`).
- **`GET /api/documents/:id`**: Single document metadata.
- **`POST /api/documents`** (Admin / Treasurer / Committee / Auditor): Multipart file upload (`max 10MB`, strictly stored privately on server disk).
- **`GET /api/documents/:id/download`**: Authenticated document stream (direct public URLs are disabled).

### 3.10. Bank Reconciliation (`/api/reconciliation`)
- **`GET /api/reconciliation`**: Bank account reconciliation summaries, matched transactions, and unmatched items.
- **`GET /api/reconciliation/:id`**: Single reconciliation details.
- **`POST /api/reconciliation/:id/verify`** (Auditor / Treasurer / Admin): Runs verification. If `differenceAmount === 0`, marks `RECONCILED`. If discrepancy detected, blocks signoff with error.

### 3.11. Event Governance (`/api/events`)
- **`GET /api/events`**: List community events with proposed/approved budgets, actual expenditure, vendor quotations, and settlement notes.
- **`GET /api/events/:id`**: Single event details.
- **`POST /api/events`**: Submit community event proposal.

### 3.12. Audit Trail & Observations (`/api/audit/*`)
- **`GET /api/audit/logs`**: Audited ledger logs with actor, timestamp, action type, entity reference, and details.
- **`GET /api/audit/observations`**: Audit findings classified by severity (`HIGH`, `MEDIUM`, `LOW`, `INFO`).
- **`POST /api/audit/observations`** (Admin / Auditor): Create audit observation.
- **`PUT /api/audit/observations/:id`** (Admin / Auditor / Treasurer): Update corrective action or status.

### 3.13. Resident Transparency & Clarification Queries (`/api/resident/*`)
- **`GET /api/resident/transparency`**: Returns certified published disclosures (fund balances with masked accounts, I&E aggregates, ratified committee resolutions, certified audit summaries).
- **`GET /api/resident/queries`**: Query list with status (`OPEN`, `IN_PROGRESS`, `ANSWERED`, `RESOLVED`).
- **`POST /api/resident/queries`**:
  ```json
  {
    "category": "Maintenance Billing",
    "subject": "Water tanker expense clarification",
    "question": "Could the committee clarify the surge in emergency tanker expenses in September?",
    "unit": "Block B - 302"
  }
  ```
- **`POST /api/resident/queries/:id/answer`** (Committee / Treasurer / Admin):
  ```json
  {
    "replyText": "Municipal pipeline maintenance required emergency tankers. Tanker logbook verified."
  }
  ```
- **Privacy Enforcement:** Full bank account numbers, vendor personal bank credentials, and unpublished preliminary committee drafts are permanently redacted from resident scopes.

### 3.14. Society & User Management (`/api/society/*`)
- **`GET /api/society`**: Society configuration, statutory audit status, and governance parameters.
- **`PUT /api/society`** (Admin only): Update society parameters.
- **`GET /api/society/members`**: List verified members. Sensitive credentials (password, refresh tokens) are omitted.
- **`PUT /api/society/members/:id`** (Admin only): Update member role or active state.

---

## 4. Financial Safety Rules Enforced by Backend & Frontend

1. **Calculated Balances:** All card balances and statement totals are served directly by backend aggregations.
2. **INR Currency Formatting & Integer Storage:** All monetary transactions are stored as integer paise (`amountInPaise`) internally for precision without floating-point errors, and serialized with rupee values (`amount`) matching Indian numbering standards.
3. **No Silent Deletions:** Transactions cannot be deleted; corrections require an audited reversal workflow with mandatory justifications (`POST /api/transactions/:id/reverse`).
4. **Data Isolation:** All operations enforce society tenant isolation (`societyId`). Cross-society access is blocked.
5. **Separation of Duties:** Self-approval of expense vouchers is strictly blocked on the backend.

---

## 5. Development Seed Accounts

Default password for all seed accounts: `Password123!`

| Role | Email | Unit / Designation |
| :--- | :--- | :--- |
| **Society Administrator** | `admin@societyledger.org` | PH-01 (President) |
| **Treasurer** | `treasurer@societyledger.org` | A-201 (Financial Lead) |
| **Committee Member** | `committee@societyledger.org` | C-304 (General Member) |
| **Auditor** | `auditor@societyledger.org` | CA-OFFICE (Statutory Auditor) |
| **Resident** | `resident@societyledger.org` | B-302 (Resident Member) |
| **Resident 2** | `resident2@societyledger.org` | A-402 (Resident Member) |
