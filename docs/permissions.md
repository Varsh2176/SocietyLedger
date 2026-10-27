# SocietyLedger — Role-Based Access Control (RBAC) & Permissions

## 1. Supported Roles

1. **Resident**: Individual apartment flat owners or tenants. Can view published financial transparency reports, approved event settlements, filed compliance certificates, and submit resident queries.
2. **Treasurer**: Chief financial officer of the society. Manages funds, records transactions, prepares bank reconciliations, and updates tax and statutory compliance filings.
3. **Committee Member**: Elected managing committee representatives. Approves event proposals, reviews expense tenders, votes on capital expenditures, and responds to resident queries.
4. **Auditor**: Independent chartered accountant or appointed resident auditor. Reviews vouchers, runs duplicate invoice detection, files audit observations, and audits reconciliation statements.
5. **Society Administrator**: IT and governance administrator for the society. Manages resident onboarding, society master settings, and user account statuses.

---

## 2. Role Permissions Matrix

| Module / Operation | Resident | Treasurer | Committee Member | Auditor | Society Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Published Financial Statements** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Raw Masked Bank Details** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Initiate Transactions** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Approve Transactions** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Manage Compliance Obligations** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **View Compliance Certificates** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload Invoice / Proofs** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **View Public Documents** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Confidential Documents** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create Bank Reconciliation** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Audit & Signoff Reconciliation** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **File Audit Observation** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Resolve Audit Observation** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Propose Event / Budget** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Approve Event Budget** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Submit Resident Query** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Answer Resident Query** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **User Role Management** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Data Isolation Rules
- **Cross-Society Prevention**: All database queries must enforce `{ society: req.user.society }`.
- **Confidentiality Rules**:
  - Masked bank details must never show raw credit/debit account numbers.
  - Audit evidence marked `AuditorOnly` is inaccessible to ordinary residents.
  - Passwords and token secrets must never be leaked into API responses or audit logs.
