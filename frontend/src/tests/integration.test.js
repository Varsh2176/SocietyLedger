/**
 * SocietyLedger Integration Test Suite
 * Automated verification of financial safety, role permissions, formatters, and service contracts.
 */

import {
  USER_ROLES,
  ROUTE_PERMISSIONS,
  TRANSACTION_STATUS,
  APPROVAL_STATUS,
  COMPLIANCE_STATUS,
} from '../services/apiContract.js';

import {
  formatINR,
  formatDate,
  paiseToRupees,
  rupeesToPaise,
  getStatusConfig,
} from '../utils/formatters.js';

import { approvalsService } from '../services/approvalsService.js';
import { transactionsService } from '../services/transactionsService.js';
import { residentService } from '../services/residentService.js';
import { fundsService } from '../services/fundsService.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✓ PASS: ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   SocietyLedger Phase 9: Integration Test Suite');
  console.log('======================================================\n');

  // Test 1: Role-Based Permissions Verification
  console.log('--- 1. Role-Based Permissions & Route Guards ---');
  assert(Object.values(USER_ROLES).length === 5, 'All 5 system roles are defined');
  assert(ROUTE_PERMISSIONS.DASHBOARD.includes(USER_ROLES.RESIDENT), 'Resident has access to Dashboard');
  assert(!ROUTE_PERMISSIONS.SETTINGS.includes(USER_ROLES.RESIDENT), 'Resident is restricted from Settings');
  assert(!ROUTE_PERMISSIONS.APPROVALS.includes(USER_ROLES.RESIDENT), 'Resident is restricted from Approvals');
  assert(ROUTE_PERMISSIONS.APPROVALS.includes(USER_ROLES.TREASURER), 'Treasurer has access to Approvals');
  assert(ROUTE_PERMISSIONS.AUDIT.includes(USER_ROLES.AUDITOR), 'Auditor has access to Audit');
  assert(!ROUTE_PERMISSIONS.SETTINGS.includes(USER_ROLES.AUDITOR), 'Auditor is restricted from Settings');
  assert(ROUTE_PERMISSIONS.SETTINGS.includes(USER_ROLES.ADMIN), 'Society Administrator has access to Settings');

  // Test 2: Financial Formatters & Monetary Handling
  console.log('\n--- 2. Financial Formatters & INR Representation ---');
  assert(formatINR(147000) === '₹ 1,47,000', 'Standard INR formatting handles lakhs correctly');
  assert(formatINR(2840000) === '₹ 28,40,000', 'Standard INR formatting handles multi-lakh reserves');
  assert(formatINR(0) === '₹ 0', 'Zero amount returns ₹ 0');
  assert(formatINR(null) === '₹ 0', 'Null amount returns ₹ 0 safely');
  assert(paiseToRupees(1850000) === 18500, 'Paise correctly converted to Rupees');
  assert(rupeesToPaise(18500) === 1850000, 'Rupees correctly converted to integer Paise');

  // Test 3: Date Parsing
  console.log('\n--- 3. Date Formatting ---');
  assert(formatDate('2026-10-24') === '24 Oct 2026', 'ISO date correctly formatted to Indian business date');
  assert(formatDate(null) === '—', 'Null date safely renders dash');

  // Test 4: Financial Status Enums
  console.log('\n--- 4. Financial & Audit Status Enums ---');
  assert(getStatusConfig('RECONCILED').variant === 'success', 'Reconciled status maps to success badge');
  assert(getStatusConfig('APPROVED').variant === 'info', 'Approved status maps to info badge');
  assert(getStatusConfig('PENDING').variant === 'warning', 'Pending status maps to warning badge');
  assert(getStatusConfig('REJECTED').variant === 'danger', 'Rejected status maps to danger badge');
  assert(getStatusConfig('REVERSED').variant === 'neutral', 'Reversed status maps to neutral badge');

  // Test 5: Separation-of-Duties Enforcement in Expense Approvals
  console.log('\n--- 5. Separation-of-Duties Workflow Policy ---');
  let selfApprovalBlocked = false;
  try {
    // Attempt self-approval where requester email matches current user email
    await approvalsService.decideApproval('appr_002', {
      action: APPROVAL_STATUS.APPROVED,
      comments: 'Self-approval attempt',
      user: { email: 'sunil@society.org', name: 'Sunil Rao' }, // Matches requesterEmail in appr_002
    });
  } catch (err) {
    if (err.message.includes('Separation-of-Duties Violation')) {
      selfApprovalBlocked = true;
    }
  }
  assert(selfApprovalBlocked, 'Requesters are strictly prohibited from self-approving their own expense requests');

  // Test 6: Financial Safety - Reversal Justification Requirement
  console.log('\n--- 6. Financial Safety: Audited Reversals ---');
  let emptyReversalBlocked = false;
  try {
    await transactionsService.reverseTransaction('tx_001', '   ');
  } catch (err) {
    if (err.message.includes('Mandatory reversal justification required')) {
      emptyReversalBlocked = true;
    }
  }
  assert(emptyReversalBlocked, 'Executing a transaction reversal without justification is blocked');

  // Test 7: Resident Privacy & Redaction Standards
  console.log('\n--- 7. Resident Privacy & Transparency Feed ---');
  const transparency = await residentService.getTransparencyData();
  assert(transparency.data.publishedFunds.length > 0, 'Published fund balances retrieved');
  transparency.data.publishedFunds.forEach((f) => {
    // Ensure no raw 16-digit account numbers are exposed
    assert(!/\d{10,18}/.test(f.bankName), `Bank account in ${f.name} is masked/sanitized for resident view`);
  });

  // Test 8: Funds Listing & Searching
  console.log('\n--- 8. Funds Service Search ---');
  const fundsRes = await fundsService.getFunds({ search: 'Corpus' });
  assert(fundsRes.funds.length > 0, 'Fund search returns matching records');
  assert(fundsRes.funds[0].code === 'FND-CORPUS', 'Corpus fund correctly indexed');

  console.log('\n======================================================');
  console.log(`   Verification Results: ${passedTests}/${totalTests} Tests Passed (100%)`);
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Integration Test Suite Encountered Critical Failure:', err);
  process.exit(1);
});
