const mongoose = require('mongoose');
const { connectDB, disconnectDB, checkDBHealth, DEFAULT_URI } = require('../config/db');
const models = require('../models');
const { generateSeedDataset } = require('./seedData');
const { checkDatasetIntegrity } = require('../utils/integrityChecker');

/**
 * Seed Runner for SocietyLedger
 * Supports:
 * - Direct insertion into live MongoDB
 * - Dry-run mode for offline/CI environment verification
 * - Safe error handling with helpful diagnostics
 */
async function runSeeder() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isReset = args.includes('--reset');

  console.log('=====================================================');
  console.log('   SOCIETYLEDGER — DATABASE SEED RUNNER');
  console.log('=====================================================');

  const dataset = generateSeedDataset();
  const integrity = checkDatasetIntegrity(dataset);

  if (!integrity.isValid) {
    console.error('[ERROR] Dataset validation failed prior to insertion:');
    integrity.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('[OK] Generated validated dataset in memory:');
  for (const [key, val] of Object.entries(integrity.summary)) {
    console.log(`  - ${key.padEnd(25)}: ${val}`);
  }

  if (isDryRun) {
    console.log('\n[INFO] --dry-run flag supplied. Skipping database insertion.');
    console.log('[SUCCESS] All seed data structures are sound and ready for deployment.');
    return;
  }

  const targetUri = process.env.MONGODB_URI || DEFAULT_URI;
  console.log(`\nConnecting to MongoDB: ${targetUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}...`);

  try {
    await connectDB(targetUri);
    const health = checkDBHealth();
    console.log(`[CONNECTED] Host: ${health.host}, Database: ${health.name}`);

    // If --reset is specified, clear existing data
    if (isReset) {
      console.log('\n[RESET] Clearing existing collections for fresh seed...');
      for (const [modelName, Model] of Object.entries(models)) {
        await Model.deleteMany({});
        console.log(`  - Emptied ${modelName} collection`);
      }
    }

    console.log('\nInserting seed records in relational order:');

    // 1. Societies
    console.log('  1. Inserting Societies...');
    await models.Society.insertMany(dataset.societies, { ordered: true });
    console.log(`     Inserted ${dataset.societies.length} societies.`);

    // 2. Users
    console.log('  2. Inserting Users...');
    await models.User.insertMany(dataset.users, { ordered: false });
    console.log(`     Inserted ${dataset.users.length} users.`);

    // 3. Funds
    console.log('  3. Inserting Funds...');
    await models.Fund.insertMany(dataset.funds, { ordered: true });
    console.log(`     Inserted ${dataset.funds.length} funds.`);

    // 4. Documents
    console.log('  4. Inserting Documents...');
    await models.Document.insertMany(dataset.documents, { ordered: false });
    console.log(`     Inserted ${dataset.documents.length} document metadata records.`);

    // 5. Events
    console.log('  5. Inserting Events...');
    await models.Event.insertMany(dataset.events, { ordered: true });
    console.log(`     Inserted ${dataset.events.length} events.`);

    // 6. Expenses
    console.log('  6. Inserting Expenses...');
    await models.Expense.insertMany(dataset.expenses, { ordered: false });
    console.log(`     Inserted ${dataset.expenses.length} expense requests.`);

    // 7. Transactions
    console.log('  7. Inserting Transactions (batching 3,000 records)...');
    const batchSize = 500;
    for (let i = 0; i < dataset.transactions.length; i += batchSize) {
      const slice = dataset.transactions.slice(i, i + batchSize);
      await models.Transaction.insertMany(slice, { ordered: false });
    }
    console.log(`     Inserted ${dataset.transactions.length} financial transactions.`);

    // 8. Compliance
    console.log('  8. Inserting Compliance records...');
    await models.Compliance.insertMany(dataset.compliance, { ordered: false });
    console.log(`     Inserted ${dataset.compliance.length} statutory compliance records.`);

    // 9. Reconciliations
    console.log('  9. Inserting Reconciliations...');
    await models.Reconciliation.insertMany(dataset.reconciliations, { ordered: false });
    console.log(`     Inserted ${dataset.reconciliations.length} bank reconciliation records.`);

    // 10. Audit Observations
    console.log('  10. Inserting Audit Observations...');
    await models.AuditObservation.insertMany(dataset.auditObservations, { ordered: false });
    console.log(`     Inserted ${dataset.auditObservations.length} audit observations.`);

    // 11. Audit Logs
    console.log('  11. Inserting Audit Logs (batching 1,500 records)...');
    for (let i = 0; i < dataset.auditLogs.length; i += batchSize) {
      const slice = dataset.auditLogs.slice(i, i + batchSize);
      await models.AuditLog.insertMany(slice, { ordered: false });
    }
    console.log(`     Inserted ${dataset.auditLogs.length} audit logs.`);

    // 12. Resident Queries
    console.log('  12. Inserting Resident Queries...');
    await models.ResidentQuery.insertMany(dataset.residentQueries, { ordered: false });
    console.log(`     Inserted ${dataset.residentQueries.length} resident transparency queries.`);

    console.log('\n=====================================================');
    console.log('   DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('=====================================================');
  } catch (error) {
    console.warn(`\n[NOTICE] MongoDB connection/operation notice: ${error.message}`);
    console.log('\nTip: To run with an active MongoDB instance, set MONGODB_URI in .env or pass a connection URI.');
    console.log('You can also run verification in-memory anytime using: npm run seed:verify');
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runSeeder();
}

module.exports = {
  runSeeder
};
