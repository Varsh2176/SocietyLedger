require('dotenv').config();
const mongoose = require('mongoose');
const {
  Society,
  User,
  Fund,
  Transaction,
  ExpenseRequest,
  Compliance,
  Document,
  Reconciliation,
  Event,
  AuditLog,
  AuditObservation,
  ResidentQuery,
} = require('./models');
const {
  USER_ROLES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  FUND_TYPES,
  APPROVAL_STATUS,
  COMPLIANCE_STATUS,
  AUDIT_SEVERITY,
  AUDIT_OBSERVATION_STATUS,
  QUERY_STATUS,
  DOCUMENT_CATEGORIES,
} = require('./config/constants');
const { connectDB, disconnectDB } = require('./config/db');
const { recalculateFundBalance } = require('./services/fundService');

const seedDatabase = async () => {
  console.log('[Seed] Starting SocietyLedger database seeding...');
  await connectDB();

  // Clean existing collections
  await Promise.all([
    Society.deleteMany({}),
    User.deleteMany({}),
    Fund.deleteMany({}),
    Transaction.deleteMany({}),
    ExpenseRequest.deleteMany({}),
    Compliance.deleteMany({}),
    Document.deleteMany({}),
    Reconciliation.deleteMany({}),
    Event.deleteMany({}),
    AuditLog.deleteMany({}),
    AuditObservation.deleteMany({}),
    ResidentQuery.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing records.');

  // 1. Create Primary Society
  const primarySociety = await Society.create({
    name: 'Greenwood Heights RWA',
    code: 'GWH-BLR-01',
    registrationNumber: 'RWA/2021/489',
    address: {
      street: '42 Sarjapur Main Road, Haralur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
    },
    fiscalYear: 'FY 2026-27',
    statutoryAuditStatus: 'VERIFIED_FY25_26',
    auditorCertification: 'Statutory Annual Audit completed and certified by Suresh Menon, CA (Reg. No. 048912).',
    settings: {
      approvalThreshold: 25000,
      multipleBidsRequiredThreshold: 25000,
      currency: 'INR',
    },
    isActive: true,
  });

  const secondarySociety = await Society.create({
    name: 'Palm Meadows Gated Community',
    code: 'PMG-BLR-02',
    registrationNumber: 'RWA/2022/102',
    address: {
      street: 'Whitefield Boulevard',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
    },
    fiscalYear: 'FY 2026-27',
    statutoryAuditStatus: 'VERIFIED_FY25_26',
    isActive: true,
  });

  console.log(`[Seed] Created primary society: ${primarySociety.name} (${primarySociety.code})`);

  // 2. Create Core Users for All 5 Roles (Password: 'Password123!')
  const sharedPassword = 'Password123!';

  const adminUser = await User.create({
    name: 'Dr. Anand Rao',
    email: 'admin@societyledger.org',
    password: sharedPassword,
    phone: '+91 98450 12345',
    role: USER_ROLES.ADMIN,
    societyId: primarySociety._id,
    apartmentNumber: 'PH-01',
    isVerified: true,
    isActive: true,
  });

  const treasurerUser = await User.create({
    name: 'Priya Sharma',
    email: 'treasurer@societyledger.org',
    password: sharedPassword,
    phone: '+91 98451 23456',
    role: USER_ROLES.TREASURER,
    societyId: primarySociety._id,
    apartmentNumber: 'A-201',
    isVerified: true,
    isActive: true,
  });

  const committeeUser = await User.create({
    name: 'Sunil Rao',
    email: 'committee@societyledger.org',
    password: sharedPassword,
    phone: '+91 98452 34567',
    role: USER_ROLES.COMMITTEE_MEMBER,
    societyId: primarySociety._id,
    apartmentNumber: 'C-304',
    isVerified: true,
    isActive: true,
  });

  const auditorUser = await User.create({
    name: 'Suresh Menon',
    email: 'auditor@societyledger.org',
    password: sharedPassword,
    phone: '+91 98453 45678',
    role: USER_ROLES.AUDITOR,
    societyId: primarySociety._id,
    apartmentNumber: 'CA-OFFICE',
    isVerified: true,
    isActive: true,
  });

  const residentUser = await User.create({
    name: 'Arun Varma',
    email: 'resident@societyledger.org',
    password: sharedPassword,
    phone: '+91 98454 56789',
    role: USER_ROLES.RESIDENT,
    societyId: primarySociety._id,
    apartmentNumber: 'B-302',
    isVerified: true,
    isActive: true,
  });

  const residentUser2 = await User.create({
    name: 'Ramesh Kumar',
    email: 'resident2@societyledger.org',
    password: sharedPassword,
    phone: '+91 98455 67890',
    role: USER_ROLES.RESIDENT,
    societyId: primarySociety._id,
    apartmentNumber: 'A-402',
    isVerified: true,
    isActive: true,
  });

  console.log('[Seed] Created core users for all 5 roles.');

  // 3. Create Core Funds
  const corpusFund = await Fund.create({
    societyId: primarySociety._id,
    name: 'General Corpus Reserve Fund',
    code: 'FND-CORPUS',
    type: FUND_TYPES.CORPUS,
    openingBalance: 2750000,
    openingBalanceInPaise: 275000000,
    currentBalance: 2840000,
    currentBalanceInPaise: 284000000,
    restrictedUse: true,
    purpose: 'Permanent reserve capital held in fixed deposit. Interest utilized for society operational deficit.',
    fiscalYear: 'FY 2026-27',
    bankAccount: 'HDFC Bank - A/C ****4891',
    status: 'ACTIVE',
    lastReconciledAt: new Date('2026-10-20'),
  });

  const sinkingFund = await Fund.create({
    societyId: primarySociety._id,
    name: 'Asset Replacement & Sinking Fund',
    code: 'FND-SINKING',
    type: FUND_TYPES.SINKING,
    openingBalance: 1320000,
    openingBalanceInPaise: 132000000,
    currentBalance: 1445400,
    currentBalanceInPaise: 144540000,
    restrictedUse: true,
    purpose: 'Ring-fenced fund for elevator overhaul, exterior painting, and major structural refurbishments.',
    fiscalYear: 'FY 2026-27',
    bankAccount: 'SBI - A/C ****9102',
    status: 'ACTIVE',
    lastReconciledAt: new Date('2026-10-22'),
  });

  const maintFund = await Fund.create({
    societyId: primarySociety._id,
    name: 'Monthly Maintenance & Operational Account',
    code: 'FND-MAINT',
    type: FUND_TYPES.OPERATIONAL,
    openingBalance: 450000,
    openingBalanceInPaise: 45000000,
    currentBalance: 612350,
    currentBalanceInPaise: 61235000,
    restrictedUse: false,
    purpose: 'Working liquidity for security salaries, common electricity, water tankers, and routine repairs.',
    fiscalYear: 'FY 2026-27',
    bankAccount: 'ICICI Bank - A/C ****3310',
    status: 'ACTIVE',
    lastReconciledAt: new Date('2026-10-24'),
  });

  const solarFund = await Fund.create({
    societyId: primarySociety._id,
    name: 'Rooftop Solar Special Project Fund',
    code: 'FND-SOLAR',
    type: FUND_TYPES.SPECIAL_PROJECT,
    openingBalance: 0,
    openingBalanceInPaise: 0,
    currentBalance: 215000,
    currentBalanceInPaise: 21500000,
    restrictedUse: true,
    purpose: 'Member contributions toward Phase 2 grid-tied solar net metering infrastructure.',
    fiscalYear: 'FY 2026-27',
    bankAccount: 'ICICI Bank - A/C ****3310 (Sub-ledger)',
    status: 'ACTIVE',
    lastReconciledAt: new Date('2026-10-18'),
  });

  console.log('[Seed] Created core funds.');

  // 4. Create Transactions matching frontend exact items
  const transactionsData = [
    {
      reference: 'VR-2026-089',
      date: new Date('2026-10-24'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: maintFund._id,
      fund: maintFund.name,
      fundCode: maintFund.code,
      category: 'Lift & Elevator Maintenance',
      description: 'Johnson Lifts Annual Maintenance Contract (Q3 Comprehensive AMC)',
      amount: 18500,
      paymentMethod: PAYMENT_METHODS.NEFT_RTGS,
      status: TRANSACTION_STATUS.RECONCILED,
      vendorName: 'Johnson Lifts Pvt Ltd',
      invoiceNumber: 'INV-JL-2026-441',
      verifiedBy: 'Suresh Menon (Auditor)',
      approvedBy: 'Priya Sharma (Treasurer)',
      reconciliationReference: 'BANK-HDFC-9921',
    },
    {
      reference: 'VR-2026-088',
      date: new Date('2026-10-23'),
      type: TRANSACTION_TYPES.INCOME,
      fundId: maintFund._id,
      fund: maintFund.name,
      fundCode: maintFund.code,
      category: 'Maintenance Dues',
      description: 'October Maintenance Collection Batch — Wing C (Flat C-101 to C-404)',
      amount: 147000,
      paymentMethod: PAYMENT_METHODS.UPI,
      status: TRANSACTION_STATUS.RECONCILED,
      vendorName: null,
      invoiceNumber: 'RCPT-OCT-BATCH-C',
      verifiedBy: 'Suresh Menon (Auditor)',
      approvedBy: 'Priya Sharma (Treasurer)',
      reconciliationReference: 'UPI-RAZORPAY-COLLECT-401',
    },
    {
      reference: 'VR-2026-087',
      date: new Date('2026-10-22'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: sinkingFund._id,
      fund: sinkingFund.name,
      fundCode: sinkingFund.code,
      category: 'Solar Capital Works',
      description: 'Replacement of Phase 1 20kVA Solar Inverter Grid Synchronizer',
      amount: 34200,
      paymentMethod: PAYMENT_METHODS.NEFT_RTGS,
      status: TRANSACTION_STATUS.APPROVED,
      vendorName: 'SunPower Renewable Systems',
      invoiceNumber: 'SP-BLR-892',
      verifiedBy: null,
      approvedBy: 'Dr. Anand Rao (President / Committee)',
    },
    {
      reference: 'VR-2026-086',
      date: new Date('2026-10-20'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: maintFund._id,
      fund: maintFund.name,
      fundCode: maintFund.code,
      category: 'Gardening & Common Area',
      description: 'Monsoon Tree Pruning and Horticulture Landscaping Overhaul',
      amount: 12000,
      paymentMethod: PAYMENT_METHODS.CHEQUE,
      status: TRANSACTION_STATUS.PENDING,
      vendorName: 'GreenThumb Nurseries & Landscaping',
      invoiceNumber: 'GT-5091',
    },
    {
      reference: 'VR-2026-085',
      date: new Date('2026-10-18'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: sinkingFund._id,
      fund: sinkingFund.name,
      fundCode: sinkingFund.code,
      category: 'Clubhouse Amenities',
      description: 'Clubhouse Surround Sound System and Wireless Microphones',
      amount: 45000,
      paymentMethod: PAYMENT_METHODS.NEFT_RTGS,
      status: TRANSACTION_STATUS.REJECTED,
      vendorName: 'Acoustic Sound Tech',
      invoiceNumber: 'AST-2026-19',
    },
    {
      reference: 'VR-2026-084',
      date: new Date('2026-10-15'),
      type: TRANSACTION_TYPES.INCOME,
      fundId: corpusFund._id,
      fund: corpusFund.name,
      fundCode: corpusFund.code,
      category: 'Corpus Interest Deposit',
      description: 'Quarterly Fixed Deposit Interest Credit (FD #98102390)',
      amount: 54000,
      paymentMethod: PAYMENT_METHODS.NEFT_RTGS,
      status: TRANSACTION_STATUS.RECONCILED,
      vendorName: 'HDFC Bank Ltd',
      invoiceNumber: 'FD-INT-Q2-2026',
      verifiedBy: 'Suresh Menon (Auditor)',
      approvedBy: 'Priya Sharma (Treasurer)',
      reconciliationReference: 'BANK-HDFC-FD-9810',
    },
    {
      reference: 'VR-2026-083',
      date: new Date('2026-10-12'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: maintFund._id,
      fund: maintFund.name,
      fundCode: maintFund.code,
      category: 'Security Services',
      description: 'Security Guard Agency Monthly Invoice (8 Guards + 1 Supervisor)',
      amount: 62000,
      paymentMethod: PAYMENT_METHODS.NEFT_RTGS,
      status: TRANSACTION_STATUS.PAID,
      vendorName: 'EagleEye Security Services LLP',
      invoiceNumber: 'EE-OCT-2026-77',
      approvedBy: 'Priya Sharma (Treasurer)',
    },
    {
      reference: 'VR-2026-082',
      date: new Date('2026-10-10'),
      type: TRANSACTION_TYPES.EXPENSE,
      fundId: maintFund._id,
      fund: maintFund.name,
      fundCode: maintFund.code,
      category: 'Common Electricity',
      description: 'BESCOM Electricity Bill for Common Area Lighting & Water Pumps',
      amount: 54200,
      paymentMethod: PAYMENT_METHODS.UPI,
      status: TRANSACTION_STATUS.RECONCILED,
      vendorName: 'BESCOM Bengaluru',
      invoiceNumber: 'BES-RR-8849102',
      verifiedBy: 'Suresh Menon (Auditor)',
      approvedBy: 'Priya Sharma (Treasurer)',
      reconciliationReference: 'UPI-BESCOM-OCT-2026',
    },
  ];

  for (const tx of transactionsData) {
    await Transaction.create({
      societyId: primarySociety._id,
      ...tx,
      createdBy: treasurerUser._id,
    });
  }

  console.log('[Seed] Created seed transactions.');

  // 5. Create Expense Requests (Approvals)
  await ExpenseRequest.create([
    {
      societyId: primarySociety._id,
      description: 'Lift Modernization Capacitor & Inverter Overhaul (Johnson Lifts)',
      requestedAmount: 34200,
      fund: sinkingFund.name,
      fundCode: sinkingFund.code,
      fundId: sinkingFund._id,
      vendorName: 'SunPower Renewable & Elevator Systems',
      quotationRef: 'Q-SP-982',
      invoiceNumber: 'INV-SP-2026-44',
      requesterName: 'Praveen Kumar (Maintenance In-Charge)',
      requesterEmail: 'praveen@society.org',
      submissionDate: new Date('2026-10-22'),
      status: APPROVAL_STATUS.PENDING,
      notes: 'Urgent replacement requested following quarterly lift inspection report.',
      decisionHistory: [],
    },
    {
      societyId: primarySociety._id,
      description: 'Monsoon Landscape & Tree Pruning Overhaul',
      requestedAmount: 12000,
      fund: maintFund.name,
      fundCode: maintFund.code,
      fundId: maintFund._id,
      vendorName: 'GreenThumb Nurseries & Landscaping',
      quotationRef: 'GT-5091',
      invoiceNumber: 'INV-GT-09',
      requesterName: 'Sunil Rao',
      requesterEmail: 'committee@societyledger.org',
      requesterId: committeeUser._id,
      submissionDate: new Date('2026-10-20'),
      status: APPROVAL_STATUS.PENDING,
      notes: 'Trimming branches obstructing overhead power lines near Block C transformer.',
      decisionHistory: [],
    },
    {
      societyId: primarySociety._id,
      description: 'Diwali Tower Facade Illumination Advance Bid',
      requestedAmount: 30000,
      fund: maintFund.name,
      fundCode: maintFund.code,
      fundId: maintFund._id,
      relatedEvent: 'Diwali Lights & Cultural Gala 2026',
      vendorName: 'Luminance Tower Facade Lighting',
      quotationRef: 'Q-LT-401',
      requesterName: 'Kavita Deshmukh (Cultural Committee)',
      requesterEmail: 'kavita@society.org',
      submissionDate: new Date('2026-10-23'),
      status: APPROVAL_STATUS.INFO_REQUESTED,
      notes: 'Requested 2 additional comparative quotations as per society procurement threshold policy (> ₹25,000).',
      decisionHistory: [
        {
          action: 'INFO_REQUESTED',
          decidedBy: 'Priya Sharma (Treasurer)',
          decidedById: treasurerUser._id,
          date: new Date('2026-10-24T11:30:00Z'),
          comments: 'Please attach 2 alternate vendor bids before financial sanction.',
        },
      ],
    },
  ]);

  console.log('[Seed] Created expense requests.');

  // 6. Create Compliance Records
  await Compliance.create([
    {
      societyId: primarySociety._id,
      filingType: 'Society Annual Return (Form V)',
      statutoryBody: 'Registrar of Societies (Karnataka)',
      financialPeriod: 'FY 2025-26',
      deadline: new Date('2026-09-30'),
      submissionDate: new Date('2026-09-24'),
      status: COMPLIANCE_STATUS.FILED,
      responsiblePerson: 'Dr. Anand Rao (President) & Suresh Menon (Auditor)',
      acknowledgementRef: 'KAR-SOC-RET-2026-98102',
      supportingDocument: 'Form_V_Signed_Audited_Accounts.pdf',
      notes: 'Annual returns and certified audited balance sheets formally accepted by District Registrar.',
    },
    {
      societyId: primarySociety._id,
      filingType: 'Quarterly GST-TDS Return (GSTR-7)',
      statutoryBody: 'Goods & Services Tax Department',
      financialPeriod: 'Q2 FY 2026-27 (Jul - Sep)',
      deadline: new Date('2026-10-10'),
      submissionDate: new Date('2026-10-08'),
      status: COMPLIANCE_STATUS.FILED,
      responsiblePerson: 'Priya Sharma (Treasurer)',
      acknowledgementRef: 'GSTN-GSTR7-ACK-881920',
      supportingDocument: 'GSTR7_Q2_Ack_Challan.pdf',
      notes: 'TDS deducted on security and lift AMC vendor payments deposited with central government.',
    },
    {
      societyId: primarySociety._id,
      filingType: 'Annual Elevator Safety Fitness Certificate',
      statutoryBody: 'Chief Inspectorate of Lifts & Escalators',
      financialPeriod: 'Annual Inspection 2026',
      deadline: new Date('2026-11-15'),
      status: COMPLIANCE_STATUS.PENDING,
      responsiblePerson: 'Praveen Kumar (Maintenance In-Charge)',
      notes: 'Inspection scheduled for Nov 2nd with Johnson Lifts engineers.',
    },
    {
      societyId: primarySociety._id,
      filingType: 'Fire Safety NOC Renewal Inspection',
      statutoryBody: 'Karnataka Fire and Emergency Services',
      financialPeriod: 'Bi-annual Renewal',
      deadline: new Date('2026-10-15'),
      status: COMPLIANCE_STATUS.OVERDUE,
      responsiblePerson: 'Management Committee',
      notes: 'Fire pump pressure gauge replacement pending before final fire officer site signoff.',
    },
  ]);

  console.log('[Seed] Created compliance records.');

  // 7. Create Documents
  await Document.create([
    {
      societyId: primarySociety._id,
      name: 'Form_V_Annual_Return_FY25_26_Signed.pdf',
      originalName: 'Form_V_Annual_Return_FY25_26_Signed.pdf',
      category: DOCUMENT_CATEGORIES.STATUTORY_COMPLIANCE,
      size: '1.8 MB',
      sizeInBytes: 1887436,
      fileType: 'application/pdf',
      filePath: './uploads/doc-sample-1.pdf',
      uploadedAt: new Date('2026-09-24'),
      uploadedBy: 'Dr. Anand Rao',
      uploadedById: adminUser._id,
      verificationStatus: 'VERIFIED',
      relatedEntity: 'Form V Society Return',
    },
    {
      societyId: primarySociety._id,
      name: 'Johnson_Lifts_Q3_AMC_Invoice_441.pdf',
      originalName: 'Johnson_Lifts_Q3_AMC_Invoice_441.pdf',
      category: DOCUMENT_CATEGORIES.INVOICE_RECEIPT,
      size: '420 KB',
      sizeInBytes: 430080,
      fileType: 'application/pdf',
      filePath: './uploads/doc-sample-2.pdf',
      uploadedAt: new Date('2026-10-24'),
      uploadedBy: 'Praveen Kumar',
      uploadedById: treasurerUser._id,
      verificationStatus: 'VERIFIED',
      relatedEntity: 'VR-2026-089',
    },
    {
      societyId: primarySociety._id,
      name: 'BESCOM_Common_Meter_Oct26_Receipt.pdf',
      originalName: 'BESCOM_Common_Meter_Oct26_Receipt.pdf',
      category: DOCUMENT_CATEGORIES.UTILITY_BILL,
      size: '310 KB',
      sizeInBytes: 317440,
      fileType: 'application/pdf',
      filePath: './uploads/doc-sample-3.pdf',
      uploadedAt: new Date('2026-10-10'),
      uploadedBy: 'Priya Sharma',
      uploadedById: treasurerUser._id,
      verificationStatus: 'VERIFIED',
      relatedEntity: 'VR-2026-082',
    },
  ]);

  console.log('[Seed] Created documents.');

  // 8. Create Reconciliation Records
  await Reconciliation.create([
    {
      societyId: primarySociety._id,
      accountName: 'HDFC Bank - General Operations (A/C ****4891)',
      statementPeriod: '01 Oct 2026 – 24 Oct 2026',
      statementClosingBalance: 612350,
      bookClosingBalance: 612350,
      differenceAmount: 0,
      status: 'RECONCILED',
      preparedBy: 'Priya Sharma (Treasurer)',
      reviewedBy: 'Suresh Menon (Auditor)',
      reconciledAt: new Date('2026-10-24T18:00:00Z'),
      matchedTransactionsCount: 42,
      unmatchedEntries: [],
    },
    {
      societyId: primarySociety._id,
      accountName: 'SBI - Capital Sinking Reserve (A/C ****9102)',
      statementPeriod: '01 Oct 2026 – 24 Oct 2026',
      statementClosingBalance: 1457400,
      bookClosingBalance: 1445400,
      differenceAmount: 12000,
      status: 'DISCREPANCY_UNRESOLVED',
      preparedBy: 'Priya Sharma (Treasurer)',
      reviewedBy: 'Pending Auditor Review',
      matchedTransactionsCount: 8,
      unmatchedEntries: [
        {
          date: '2026-10-20',
          description: 'GreenThumb Nurseries Cheque #094102',
          amount: 12000,
          type: 'UNCLEARED_CHEQUE',
          discrepancyNote: 'Cheque issued by society on Oct 20; not yet presented by vendor at SBI clearing branch.',
        },
      ],
    },
  ]);

  console.log('[Seed] Created reconciliation records.');

  // 9. Create Events
  await Event.create([
    {
      societyId: primarySociety._id,
      title: 'Ganesh Utsav & Cultural Fest 2026',
      description: 'Community eco-friendly idol installation, 3-day evening cultural events, and community dinner for 180 families.',
      date: '2026-09-15',
      endDate: '2026-09-18',
      status: 'SETTLED',
      proposedBudget: 80000,
      approvedBudget: 75000,
      actualExpenditure: 72800,
      unspentBalance: 2200,
      fundingSource: 'Cultural Sub-Fund & Voluntary Contributions',
      proposedBy: 'Sunil Rao (Cultural Committee)',
      approvedBy: 'Management Committee Resolution #2026/08',
      selectedVendor: {
        id: 'vnd_01',
        name: 'Shree Krishna Caterers & Pandal Decors',
        bidAmount: 48000,
        quotationRef: 'Q-SKC-881',
        isContractSigned: true,
      },
      quotations: [
        { id: 'vnd_01', name: 'Shree Krishna Caterers & Pandal Decors', bidAmount: 48000, quotationRef: 'Q-SKC-881', status: 'SELECTED' },
        { id: 'vnd_02', name: 'Royal Pandal & Sound Engineers', bidAmount: 54000, quotationRef: 'Q-RP-104', status: 'REJECTED' },
        { id: 'vnd_03', name: 'Festive Moments Event Management', bidAmount: 58500, quotationRef: 'Q-FM-902', status: 'REJECTED' },
      ],
      budgetBreakdown: [
        { head: 'Eco-Friendly Clay Idol & Puja Samagri', proposed: 15000, approved: 15000, actual: 14200 },
        { head: 'Pandal Setup, Lighting & PA Audio', proposed: 35000, approved: 30000, actual: 30000 },
        { head: 'Community Prasad & Dinner for Residents', proposed: 30000, approved: 30000, actual: 28600 },
      ],
      invoices: [
        { id: 'inv_101', ref: 'INV-SKC-01', amount: 30000, type: 'ADVANCE', status: 'PAID' },
        { id: 'inv_102', ref: 'INV-SKC-FINAL', amount: 18000, type: 'FINAL_SETTLEMENT', status: 'PAID' },
      ],
      settlementNotes: 'Event concluded. Audited vouchers verified against vendor GST bills. Unspent balance of ₹2,200 deposited back into Cultural Sub-Account.',
    },
    {
      societyId: primarySociety._id,
      title: 'Solar Net-Metering & Microgrid Inauguration',
      description: 'Technical walkthrough and townhall for Phase 2 50kWp rooftop solar installation with BESCOM officials.',
      date: '2026-10-02',
      status: 'COMPLETED',
      proposedBudget: 35000,
      approvedBudget: 30000,
      actualExpenditure: 28400,
      unspentBalance: 1600,
      fundingSource: 'Rooftop Solar Special Project Fund',
      proposedBy: 'Green Initiative Taskforce',
      approvedBy: 'Dr. Anand Rao (President)',
      budgetBreakdown: [
        { head: 'Stage Setup & Projector Screen', proposed: 20000, approved: 18000, actual: 18000 },
        { head: 'High Tea & Information Booklets', proposed: 15000, approved: 12000, actual: 10400 },
      ],
      invoices: [
        { id: 'inv_103', ref: 'INV-APX-81', amount: 18000, type: 'PAYMENT', status: 'PAID' },
      ],
      settlementNotes: 'BESCOM synchronization completed. Final settlement verified.',
    },
    {
      societyId: primarySociety._id,
      title: 'Diwali Lights & Cultural Gala 2026',
      description: 'Tower exterior LED illumination, rangoli competition, cultural performances by resident children, and festive sweets box for 240 apartments.',
      date: '2026-11-01',
      endDate: '2026-11-03',
      status: 'PROPOSED',
      proposedBudget: 130000,
      approvedBudget: null,
      actualExpenditure: 0,
      unspentBalance: null,
      fundingSource: 'Proposed: Festive Assessment & Operational Surplus',
      proposedBy: 'Cultural Committee (Kavita Deshmukh)',
      approvedBy: 'Pending Management Committee Meeting',
      budgetBreakdown: [
        { head: 'Common Area Facade Lighting (3 Towers)', proposed: 65000, approved: null, actual: 0 },
        { head: 'Diwali Sweets & Dry Fruit Gift Boxes (240 units)', proposed: 45000, approved: null, actual: 0 },
        { head: 'Sound, Stage & Prizes for Children', proposed: 20000, approved: null, actual: 0 },
      ],
      invoices: [],
      settlementNotes: 'Proposal submitted for committee review. Budget sanction and resident survey open.',
    },
  ]);

  console.log('[Seed] Created events.');

  // 10. Create Audit Logs & Observations
  await AuditLog.create([
    {
      societyId: primarySociety._id,
      timestamp: new Date('2026-10-24T17:45:00Z'),
      actor: 'Suresh Menon (Auditor)',
      actorId: auditorUser._id,
      action: 'RECONCILE_TRANSACTION',
      entityType: 'TRANSACTION',
      entityRef: 'VR-2026-089',
      details: 'Verified Johnson Lifts Q3 AMC invoice against HDFC bank debit entry (₹18,500). Stamped as verified.',
    },
    {
      societyId: primarySociety._id,
      timestamp: new Date('2026-10-23T14:20:00Z'),
      actor: 'Priya Sharma (Treasurer)',
      actorId: treasurerUser._id,
      action: 'CREATE_VOUCHER',
      entityType: 'TRANSACTION',
      entityRef: 'VR-2026-088',
      details: 'Recorded October Maintenance batch collection for Wing C (₹1,47,000) via Razorpay UPI gateway.',
    },
    {
      societyId: primarySociety._id,
      timestamp: new Date('2026-10-22T19:10:00Z'),
      actor: 'Dr. Anand Rao (President)',
      actorId: adminUser._id,
      action: 'APPROVE_EXPENSE',
      entityType: 'APPROVAL',
      entityRef: 'VR-2026-087',
      details: 'Sanctioned solar inverter synchronizer replacement (₹34,200) from Sinking Fund.',
    },
    {
      societyId: primarySociety._id,
      timestamp: new Date('2026-10-18T16:00:00Z'),
      actor: 'Management Committee',
      actorId: adminUser._id,
      action: 'REJECT_EXPENSE',
      entityType: 'APPROVAL',
      entityRef: 'VR-2026-085',
      details: 'Disapproved clubhouse audio setup (₹45,000). Quorum noted lack of competitive bidding.',
    },
  ]);

  await AuditObservation.create([
    {
      societyId: primarySociety._id,
      title: 'Discretionary Procurement Limit Exceeded',
      severity: AUDIT_SEVERITY.HIGH,
      status: AUDIT_OBSERVATION_STATUS.UNDER_REVIEW,
      date: '2026-10-19',
      relatedEntity: 'VR-2026-085 (Clubhouse Audio)',
      assignedTo: 'Vikram Joshi & Procurement Committee',
      observation: 'Quotation of ₹45,000 submitted without 3 independent vendor tenders required for expenditures exceeding ₹25,000.',
      correctiveAction: 'Expense rejected by committee. Tender guidelines reiterated to sports and amenities committee.',
      evidenceDocument: 'Society_ByeLaws_Procurement_Section8.pdf',
      isWarningOnly: false,
    },
    {
      societyId: primarySociety._id,
      title: 'Vendor GST Number Verification Pending',
      severity: AUDIT_SEVERITY.MEDIUM,
      status: AUDIT_OBSERVATION_STATUS.OPEN,
      date: '2026-10-21',
      relatedEntity: 'VR-2026-086 (GreenThumb Nurseries)',
      assignedTo: 'Priya Sharma (Treasurer)',
      observation: 'GST invoice submitted does not show active GSTIN validation on the GST portal for horticultural services.',
      correctiveAction: 'Treasurer requested updated B2B tax invoice with active GSTIN before cheque clearance.',
      evidenceDocument: 'INV-GT-5091_Scan.pdf',
      isWarningOnly: true,
    },
    {
      societyId: primarySociety._id,
      title: 'Uncleared Cheque Approaching Stale Threshold',
      severity: AUDIT_SEVERITY.LOW,
      status: AUDIT_OBSERVATION_STATUS.RESOLVED,
      date: '2026-10-10',
      relatedEntity: 'Chq #092102 (₹8,500)',
      assignedTo: 'Accounts Department',
      observation: 'Cheque issued in July remained unpresented for 75 days.',
      correctiveAction: 'Vendor contacted; cheque presented and successfully cleared in SBI account.',
      evidenceDocument: 'SBI_Passbook_Oct26.pdf',
      isWarningOnly: true,
    },
  ]);

  console.log('[Seed] Created audit logs and observations.');

  // 11. Create Resident Queries
  await ResidentQuery.create([
    {
      societyId: primarySociety._id,
      reference: 'QRY-2026-042',
      category: 'Maintenance Billing',
      subject: 'Breakdown of water tanker charges during September rain deficit',
      unit: 'Block B - 302',
      residentId: residentUser._id,
      residentName: residentUser.name,
      date: '2026-10-18',
      status: QUERY_STATUS.RESOLVED,
      question: 'Could the committee clarify why water tanker expenses increased in late September given the monsoon rains?',
      response: {
        answeredBy: 'Priya Sharma (Treasurer)',
        answeredById: treasurerUser._id,
        answeredAt: new Date('2026-10-20T11:00:00Z'),
        replyText: 'Due to BWSSB municipal pipeline maintenance between Sep 18-22, society sump relied on 12 emergency tankers (Invoice #GT-881 verified in ledger under VR-2026-068). Tanker logbook is available in society office.',
      },
    },
    {
      societyId: primarySociety._id,
      reference: 'QRY-2026-045',
      category: 'Event Budget',
      subject: 'Unspent surplus allocation from Ganesh Utsav 2026',
      unit: 'Block A - 402',
      residentId: residentUser2._id,
      residentName: residentUser2.name,
      date: '2026-10-22',
      status: QUERY_STATUS.ANSWERED,
      question: 'How is the unspent balance of ₹2,200 from Ganesh Utsav being treated in the society accounts?',
      response: {
        answeredBy: 'Priya Sharma (Treasurer)',
        answeredById: treasurerUser._id,
        answeredAt: new Date('2026-10-23T16:30:00Z'),
        replyText: 'As per society financial governance rules, the unspent balance of ₹2,200 has been credited back to the Cultural Sub-Account and reflected in the October ledger settlement report.',
      },
    },
    {
      societyId: primarySociety._id,
      reference: 'QRY-2026-048',
      category: 'Facility Maintenance',
      subject: 'Status of Block C lift inverter capacitor replacement',
      unit: 'Block C - 104',
      date: '2026-10-24',
      status: QUERY_STATUS.IN_PROGRESS,
      question: 'When will the capacitor replacement for Lift #2 be installed? The elevator produces intermittent jerks.',
      response: {
        answeredBy: 'Praveen Kumar (Maintenance Lead)',
        answeredAt: new Date('2026-10-25T10:15:00Z'),
        replyText: 'Replacement voucher VR-2026-087 sanctioned. Johnson Lifts technician dispatched for installation on Monday, Oct 27.',
      },
    },
  ]);

  console.log('[Seed] Created resident queries.');

  // Recalculate fund balances to guarantee 100% mathematical integrity
  await recalculateFundBalance(primarySociety._id, corpusFund._id);
  await recalculateFundBalance(primarySociety._id, sinkingFund._id);
  await recalculateFundBalance(primarySociety._id, maintFund._id);
  await recalculateFundBalance(primarySociety._id, solarFund._id);

  console.log('[Seed] Database successfully seeded with synchronized financial records!');
  await disconnectDB();
};

// Execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error] Failed to seed database:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
