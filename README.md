# SocietyLedger

> Financial transparency, governance, and audit platform for apartment societies, gated communities, and Resident Welfare Associations (RWAs).

---

## 1. Repository Architecture

This repository contains the integrated full-stack application:
- **`frontend/`**: React 18 + Vite responsive single-page application with Tailwind CSS and Recharts.
- **`server/`**: Node.js & Express.js REST API with MongoDB/Mongoose, JWT authentication via HttpOnly cookies, RBAC authorization, and automated Jest test suites.
- **`docs/`**: API specifications, schema contracts, and financial safety governance documentation (`docs/api-contract.md`).

---

## 2. Backend Setup & Execution (`server/`)

### Prerequisites
- Node.js (v18, v20, or v22+)
- MongoDB (local `mongod` or MongoDB Atlas URI)

### Quick Start

1. Navigate to the server workspace:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` (pre-configured with sensible local defaults):
   ```bash
   cp .env.example .env
   ```
   Default settings:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/societyledger`
   - `CLIENT_URL=http://localhost:5173`
   - `JWT_SECRET=societyledger_super_secret_jwt_key_2026_change_in_production`

4. Seed fictional development data:
   Populates societies, users for all 5 roles, funds, transactions, compliance records, reconciliations, audit trails, and resident queries:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   Or for auto-reloading development:
   ```bash
   npm run dev
   ```
   The backend API gateway will be active at `http://localhost:5000/api`.
   Health status check: `http://localhost:5000/api/health`.

6. Run automated test suites:
   Uses Jest with in-memory MongoDB (`mongodb-memory-server`):
   ```bash
   npm test
   ```

---

## 3. Frontend Setup & Execution (`frontend/`)

1. Navigate to the frontend workspace:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

4. Run frontend verification tests:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 4. Development Seed Accounts

Password for all pre-seeded accounts: **`Password123!`**

| Role | Email | Apartment Unit / Description |
| :--- | :--- | :--- |
| **Society Administrator** | `admin@societyledger.org` | PH-01 (President / Administrative lead) |
| **Treasurer** | `treasurer@societyledger.org` | A-201 (Financial vouchers & fund manager) |
| **Committee Member** | `committee@societyledger.org` | C-304 (Expense approvals & governance) |
| **Auditor** | `auditor@societyledger.org` | CA-OFFICE (Reconciliation & audit signoff) |
| **Resident** | `resident@societyledger.org` | B-302 (Transparency portal & query author) |
| **Resident 2** | `resident2@societyledger.org` | A-402 (Resident member) |

---

## 5. Main Backend Modules & Financial Integrity Rules

- **Authentication & RBAC:** Secure HttpOnly cookies + bearer tokens, password hashing with bcrypt, strict public registration defaulting to `Resident` role.
- **Fund Balances:** Multi-type reserve tracking (`CORPUS`, `SINKING`, `OPERATIONAL`, `SPECIAL_PROJECT`). Fund balances are dynamically derived from ledger transactions.
- **Monetary Precision:** Stored internally as integer paise (`amountInPaise`) to prevent floating-point inaccuracies, and presented in Indian Rupees (`amount`) matching Indian numbering standards (`₹ 1,47,000`).
- **Separation of Duties:** Requesters are strictly prohibited from approving their own expense requests on the backend (`403 Forbidden`).
- **No Silent Deletions:** Transactions cannot be deleted; corrective adjustments require an audited reversal with mandatory justification (`POST /api/transactions/:id/reverse`).
- **Multi-Tenant Isolation:** Society ID scoping is enforced on all operations, preventing unauthorized cross-society data access.
- **Resident Privacy:** Full bank account numbers and confidential committee drafts are automatically masked in resident-facing endpoints.
