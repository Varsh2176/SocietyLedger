const { generateSeedDataset } = require('./seedData');
const { checkDatasetIntegrity } = require('../utils/integrityChecker');

/**
 * Verify seed dataset integrity and contract adherence
 */
function verifySeed() {
  console.log('=====================================================');
  console.log('   SOCIETYLEDGER — SEED DATASET VERIFICATION');
  console.log('=====================================================');

  const startTime = Date.now();
  console.log('1. Generating in-memory interconnected development dataset...');
  const dataset = generateSeedDataset();
  const genDuration = Date.now() - startTime;
  console.log(`   Generated dataset in ${genDuration} ms.`);

  console.log('\n2. Verifying collection counts against specification targets:');
  const expectedTargets = {
    societies: 8,
    users: 400,
    funds: 40,
    transactions: 3000,
    compliance: 240,
    documents: 600,
    reconciliations: 100,
    auditLogs: 1500,
    auditObservations: 150,
    events: 120,
    expenses: 300,
    residentQueries: 200
  };

  let countsMatch = true;
  for (const [key, target] of Object.entries(expectedTargets)) {
    const actual = dataset[key]?.length || 0;
    const match = actual === target;
    if (!match) countsMatch = false;
    const marker = match ? '[PASS]' : '[FAIL]';
    console.log(`   ${marker} ${key.padEnd(18)}: ${actual.toString().padStart(5)} / ${target}`);
  }

  console.log('\n3. Running referential integrity and financial consistency audit:');
  const integrity = checkDatasetIntegrity(dataset);

  if (integrity.errors.length > 0) {
    console.error('\n[ERROR] Integrity errors encountered:');
    integrity.errors.slice(0, 20).forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
    if (integrity.errors.length > 20) {
      console.error(`  ... and ${integrity.errors.length - 20} more errors.`);
    }
  } else {
    console.log('   [PASS] All foreign key relationships are valid.');
    console.log('   [PASS] All unique constraints (emails, society codes) satisfied.');
    console.log('   [PASS] Double-entry financial fund balances strictly match transaction history.');
    console.log('   [PASS] Bank reconciliation variance mathematics verified.');
    console.log('   [PASS] Positive monetary amount rules confirmed.');
    console.log('   [PASS] Event start/end date constraints validated.');
  }

  if (integrity.warnings.length > 0) {
    console.log(`\n[NOTE] ${integrity.warnings.length} advisory notices logged.`);
  }

  console.log('=====================================================');
  if (countsMatch && integrity.isValid) {
    console.log('   RESULT: ALL VERIFICATION CHECKS PASSED (100% OK)');
    console.log('=====================================================');
    return true;
  } else {
    console.error('   RESULT: VERIFICATION FAILED');
    console.log('=====================================================');
    process.exitCode = 1;
    return false;
  }
}

if (require.main === module) {
  verifySeed();
}

module.exports = {
  verifySeed
};
