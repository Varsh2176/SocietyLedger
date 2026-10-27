const mongoose = require('mongoose');
const crypto = require('crypto');

// Standard precomputed bcrypt hash for 'Society@123'
const DEFAULT_PASSWORD_HASH = '$2b$10$TZgG.S1j0JTCmwO3hKmh4uyt1c/5jlg/BWik2jzcUEsOlDbxJHaxi';

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate full interconnected fictional dataset
 * Matches target counts:
 * - 8 societies
 * - 400 users
 * - 40 funds
 * - 3,000 transactions
 * - 240 compliance records
 * - 600 documents
 * - 100 reconciliations
 * - 1,500 audit logs
 * - 150 audit observations
 * - 120 events
 * - 300 expenses
 * - 200 resident queries
 */
function generateSeedDataset() {
  const societies = [];
  const users = [];
  const funds = [];
  const transactions = [];
  const compliance = [];
  const documents = [];
  const reconciliations = [];
  const auditLogs = [];
  const auditObservations = [];
  const events = [];
  const expenses = [];
  const residentQueries = [];

  const societyBlueprints = [
    {
      name: 'Palm Meadows Co-operative Housing Society',
      code: 'SOC-BLR-001',
      city: 'Bengaluru',
      state: 'Karnataka',
      pin: '560066',
      street: 'Palm Meadows Drive, Ramagondanahalli, Whitefield',
      pan: 'AABCP1234F',
      email: 'office@palmmeadows-chs.org',
      phone: '+91 80 2845 1001'
    },
    {
      name: 'Gulmohar Enclave Residents Welfare Association',
      code: 'SOC-DEL-002',
      city: 'New Delhi',
      state: 'Delhi',
      pin: '110016',
      street: 'Block B, Gulmohar Enclave, Hauz Khas',
      pan: 'AABCG5678K',
      email: 'management@gulmoharenclave-rwa.in',
      phone: '+91 11 2686 2002'
    },
    {
      name: 'Sea Breeze Co-operative Housing Society',
      code: 'SOC-MUM-003',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin: '400050',
      street: 'Perry Cross Road, Bandra West',
      pan: 'AABCS9012M',
      email: 'contact@seabreeze-mumbai.org',
      phone: '+91 22 2640 3003'
    },
    {
      name: 'Silver Oak Heights Apartment Owners Association',
      code: 'SOC-HYD-004',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500032',
      street: 'Financial District Road, Gachibowli',
      pan: 'AABCS3456T',
      email: 'admin@silveroakheights-aoa.in',
      phone: '+91 40 4012 4004'
    },
    {
      name: 'Prestige Gardenia Community Association',
      code: 'SOC-PUN-005',
      city: 'Pune',
      state: 'Maharashtra',
      pin: '411001',
      street: 'Lane 7, Koregaon Park North',
      pan: 'AABCP7890P',
      email: 'info@prestigegardenia-pune.org',
      phone: '+91 20 2615 5005'
    },
    {
      name: 'Orchid Harmony Co-operative Housing Society',
      code: 'SOC-CHE-006',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pin: '600020',
      street: '2nd Main Road, Gandhi Nagar, Adyar',
      pan: 'AABCO2345C',
      email: 'secretary@orchid-harmony.in',
      phone: '+91 44 2441 6006'
    },
    {
      name: 'Green Glen Vista Apartment Association',
      code: 'SOC-KOL-007',
      city: 'Kolkata',
      state: 'West Bengal',
      pin: '700091',
      street: 'Sector V, Salt Lake City',
      pan: 'AABCG6789W',
      email: 'desk@greenglen-vista.org',
      phone: '+91 33 2357 7007'
    },
    {
      name: 'Magnolia Elite Gated Community',
      code: 'SOC-AHM-008',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pin: '380054',
      street: 'Judges Bungalow Road, Bodakdev',
      pan: 'AABCM0123G',
      email: 'office@magnoliaelite.in',
      phone: '+91 79 2687 8008'
    }
  ];

  const firstNames = [
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Ananya', 'Suresh', 'Kavita',
    'Rahul', 'Deepa', 'Sanjay', 'Neha', 'Rohan', 'Pooja', 'Manoj', 'Sneha',
    'Arvind', 'Ritu', 'Karthik', 'Divya', 'Naveen', 'Swati', 'Alok', 'Meera',
    'Ashok', 'Shalini', 'Girish', 'Bhavna', 'Harish', 'Preeti', 'Vipin', 'Shruti',
    'Sachin', 'Tanvi', 'Abhishek', 'Pallavi', 'Gaurav', 'Aarti', 'Prashant', 'Radhika',
    'Kunal', 'Rashmi', 'Varun', 'Shweta', 'Nitin', 'Payal', 'Manish', 'Suman',
    'Chetan', 'Jyoti'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Iyer', 'Nair', 'Patel', 'Rao', 'Gupta', 'Reddy',
    'Mehta', 'Joshi', 'Kulkarni', 'Mukherjee', 'Singh', 'Banerjee', 'Deshmukh', 'Bhat',
    'Chopra', 'Nambiar', 'Agarwal', 'Menon', 'Shah', 'Pandey', 'Saxena', 'Kapoor'
  ];

  // 1. Generate 8 Societies
  for (let sIdx = 0; sIdx < societyBlueprints.length; sIdx++) {
    const bp = societyBlueprints[sIdx];
    const socId = new mongoose.Types.ObjectId();

    societies.push({
      _id: socId,
      name: bp.name,
      code: bp.code,
      address: {
        street: bp.street,
        city: bp.city,
        state: bp.state,
        postalCode: bp.pin,
        country: 'India'
      },
      contact: {
        email: bp.email,
        phone: bp.phone,
        emergencyContact: '+91 98765 0000' + (sIdx + 1)
      },
      registration: {
        registrationNumber: `REG/CHS/${bp.city.substring(0, 3).toUpperCase()}/2018/${100 + sIdx}`,
        registrationDate: new Date('2018-04-15'),
        authority: 'Registrar of Co-operative Societies',
        taxIdentifier: bp.pan,
        gstin: `29${bp.pan}1Z5`
      },
      status: 'Active',
      settings: {
        financialYearStartMonth: 4,
        currency: 'INR',
        verificationRulesEnabled: true
      },
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z')
    });

    // 2. Generate 50 Users per Society (Total = 400)
    const societyUsers = [];
    for (let uIdx = 0; uIdx < 50; uIdx++) {
      const uId = new mongoose.Types.ObjectId();
      const fName = firstNames[uIdx % firstNames.length];
      const lName = lastNames[(sIdx * 5 + uIdx) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      const email = `user.${bp.code.toLowerCase()}.${uIdx + 1}@societyledger.local`;

      let role = 'Resident';
      let ownershipType = 'Owner';
      if (uIdx === 0) {
        role = 'Society Administrator';
        ownershipType = 'Office Bearer';
      } else if (uIdx === 1) {
        role = 'Treasurer';
        ownershipType = 'Office Bearer';
      } else if (uIdx === 2) {
        role = 'Committee Member';
        ownershipType = 'Office Bearer';
      } else if (uIdx === 3) {
        role = 'Committee Member';
        ownershipType = 'Office Bearer';
      } else if (uIdx === 4) {
        role = 'Committee Member';
        ownershipType = 'Office Bearer';
      } else if (uIdx === 5) {
        role = 'Auditor';
        ownershipType = 'Office Bearer';
      } else if (uIdx % 5 === 0) {
        ownershipType = 'Tenant';
      }

      const wingLetter = String.fromCharCode(65 + Math.floor(uIdx / 15)); // A, B, C, D
      const flatNum = `${wingLetter}-${101 + (uIdx % 15)}`;

      const userDoc = {
        _id: uId,
        name: fullName,
        email: email,
        password: DEFAULT_PASSWORD_HASH,
        phone: `+91 98${10 + sIdx}${1000 + uIdx}`,
        society: socId,
        role: role,
        unitDetails: {
          flatNumber: flatNum,
          wing: `Wing ${wingLetter}`,
          ownershipType: ownershipType
        },
        accountStatus: 'Active',
        lastLogin: new Date(Date.now() - (uIdx * 3600000 * 24)),
        createdAt: new Date('2024-01-10T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z')
      };

      users.push(userDoc);
      societyUsers.push(userDoc);
    }

    const adminUser = societyUsers[0];
    const treasurerUser = societyUsers[1];
    const secretaryUser = societyUsers[2];
    const auditorUser = societyUsers[5];

    // 3. Generate 5 Funds per Society (Total = 40)
    const fundConfigs = [
      {
        name: 'General Corpus Fund',
        type: 'Corpus fund',
        desc: 'Permanent capital reserve of the society invested in long-term fixed deposits.',
        openingBalance: 5000000,
        isRestricted: true,
        restrictions: ['Withdrawals require AGM 75% approval resolution']
      },
      {
        name: 'Operational Maintenance Fund',
        type: 'Maintenance fund',
        desc: 'Day-to-day operations, common electricity, security, housekeeping, and routine upkeep.',
        openingBalance: 800000,
        isRestricted: false,
        restrictions: []
      },
      {
        name: 'Emergency Contingency Reserve',
        type: 'Emergency fund',
        desc: 'Reserved for urgent structural repairs, transformer failures, or water emergencies.',
        openingBalance: 1200000,
        isRestricted: true,
        restrictions: ['Requires minimum 2 committee sign-offs including Treasurer']
      },
      {
        name: 'Community & Cultural Event Fund',
        type: 'Event fund',
        desc: 'Funding resident celebrations, national holidays, sports meets, and community events.',
        openingBalance: 300000,
        isRestricted: false,
        restrictions: []
      },
      {
        name: 'Major Infrastructure Sinking Fund',
        type: 'Sinking fund',
        desc: 'Reserved for long-term capital replacement like lifts, waterproofing, and painting.',
        openingBalance: 2000000,
        isRestricted: true,
        restrictions: ['Locked until committee major repair tender is awarded']
      }
    ];

    const societyFunds = [];
    for (let fIdx = 0; fIdx < fundConfigs.length; fIdx++) {
      const cfg = fundConfigs[fIdx];
      const fId = new mongoose.Types.ObjectId();
      const fundDoc = {
        _id: fId,
        society: socId,
        name: cfg.name,
        type: cfg.type,
        description: cfg.desc,
        openingBalance: cfg.openingBalance,
        currentBalance: cfg.openingBalance, // will be updated strictly based on transactions
        isRestricted: cfg.isRestricted,
        applicableRestrictions: cfg.restrictions,
        financialYear: '2025-2026',
        status: 'Active',
        bankAccountDetails: {
          bankName: 'State Bank of India',
          accountNumberMasked: `XXXXXXXX${2000 + sIdx * 10 + fIdx}`,
          ifsc: 'SBIN0001234'
        },
        createdAt: new Date('2024-04-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z')
      };
      funds.push(fundDoc);
      societyFunds.push(fundDoc);
    }

    const corpusFund = societyFunds[0];
    const maintenanceFund = societyFunds[1];
    const emergencyFund = societyFunds[2];
    const eventFund = societyFunds[3];
    const sinkingFund = societyFunds[4];

    // 4. Generate 15 Events per Society (Total = 120)
    const eventTemplates = [
      { title: 'Annual Independence Day Celebration', type: 'Independence/Republic Day', budget: 45000, m: 8, d: 15 },
      { title: 'Diwali Grand Community Gala', type: 'Cultural Festival', budget: 120000, m: 10, d: 28 },
      { title: 'Annual General Meeting 2025', type: 'Annual General Meeting', budget: 35000, m: 9, d: 10 },
      { title: 'Society Winter Sports Championship', type: 'Sports Tournament', budget: 65000, m: 12, d: 20 },
      { title: 'Holi Colors & Fellowship Gathering', type: 'Cultural Festival', budget: 50000, m: 3, d: 14 },
      { title: 'Ganesh Utsav Cultural Evenings', type: 'Cultural Festival', budget: 85000, m: 9, d: 18 },
      { title: 'Republic Day Flag Hoisting & Breakfast', type: 'Independence/Republic Day', budget: 30000, m: 1, d: 26 },
      { title: 'Solar Rooftop Awareness & Inauguration', type: 'Community Gathering', budget: 25000, m: 6, d: 5 },
      { title: 'Comprehensive Monsoon Tree Plantation Drive', type: 'Community Gathering', budget: 20000, m: 7, d: 12 },
      { title: 'Fire Safety & Disaster Response Drill', type: 'Health & Safety Camp', budget: 22000, m: 4, d: 22 },
      { title: 'Free Medical & Eye Health Checkup Camp', type: 'Health & Safety Camp', budget: 28000, m: 5, d: 18 },
      { title: 'New Year Eve Cultural Night & Dinner', type: 'Cultural Festival', budget: 110000, m: 12, d: 31 },
      { title: 'Kids Summer Chess & Badminton Workshop', type: 'Sports Tournament', budget: 32000, m: 5, d: 2 },
      { title: 'Water Conservation & Rainwater Harvesting Drive', type: 'Maintenance Drive', budget: 40000, m: 6, d: 25 },
      { title: 'Annual Society Infrastructure Review Meeting', type: 'Annual General Meeting', budget: 18000, m: 11, d: 15 }
    ];

    const societyEvents = [];
    for (let eIdx = 0; eIdx < eventTemplates.length; eIdx++) {
      const tmpl = eventTemplates[eIdx];
      const eId = new mongoose.Types.ObjectId();
      const yr = tmpl.m <= 3 ? 2026 : 2025;
      const sDate = new Date(yr, tmpl.m - 1, tmpl.d, 9, 0, 0);
      const eDate = new Date(yr, tmpl.m - 1, tmpl.d + 1, 18, 0, 0);

      const isDone = sDate < new Date('2026-02-01');
      const status = isDone ? 'Completed' : 'Approved';

      const eventDoc = {
        _id: eId,
        society: socId,
        title: `${tmpl.title} (${bp.city})`,
        description: `Official society event organized by committee for ${tmpl.title}.`,
        eventType: tmpl.type,
        startDate: sDate,
        endDate: eDate,
        status: status,
        approvedBudget: tmpl.budget,
        actualExpenseTotal: 0, // updated as expenses are linked
        organizedBy: secretaryUser._id,
        approvedBy: adminUser._id,
        relatedFund: eventFund._id,
        settlementStatus: isDone ? 'Settled' : 'Pending',
        settlementDate: isDone ? new Date(sDate.getTime() + 7 * 86400000) : null,
        settlementNotes: isDone ? 'All vendor bills reconciled and settled against approved budget.' : null,
        createdAt: new Date('2024-04-10T00:00:00Z'),
        updatedAt: new Date('2026-01-20T00:00:00Z')
      };
      events.push(eventDoc);
      societyEvents.push(eventDoc);
    }

    // 5. Generate Documents (75 per Society = 600 total)
    const societyDocuments = [];
    const docCategories = [
      'Invoice', 'Receipt', 'Bank Statement', 'Tax Document',
      'Compliance Acknowledgement', 'Vendor Quotation', 'Purchase Order',
      'Audit Evidence', 'Minutes of Meeting', 'Other'
    ];

    for (let dIdx = 0; dIdx < 75; dIdx++) {
      const dId = new mongoose.Types.ObjectId();
      const cat = docCategories[dIdx % docCategories.length];
      const ext = dIdx % 4 === 0 ? 'png' : 'pdf';
      const mime = ext === 'png' ? 'image/png' : 'application/pdf';
      const filename = `DOC_${bp.code}_${cat.replace(/\s+/g, '_')}_${1001 + dIdx}.${ext}`;
      const mockStorageKey = `vault/${bp.code.toLowerCase()}/${cat.toLowerCase().replace(/\s+/g, '_')}/2025/${filename}`;

      // Intentional duplicate checksum on 1 document for audit test case
      let checksum = sha256(`${filename}_${dIdx}`);
      if (sIdx === 0 && dIdx === 15) {
        // Intentionally duplicate doc 14 for duplicate invoice detection test!
        checksum = societyDocuments[14]?.checksum || checksum;
      }

      let accessClass = 'Committee';
      if (cat === 'Minutes of Meeting' || cat === 'Receipt') accessClass = 'Resident';
      if (cat === 'Audit Evidence') accessClass = 'AuditorOnly';
      if (cat === 'Tax Document') accessClass = 'Confidential';

      const docObj = {
        _id: dId,
        society: socId,
        originalFilename: filename,
        documentCategory: cat,
        mimeType: mime,
        fileSize: 45000 + (dIdx * 8200),
        storageProvider: 'mock_secure_storage',
        storageKey: mockStorageKey,
        relatedEntityType: 'None',
        relatedEntityId: null,
        uploadedBy: (dIdx % 2 === 0 ? treasurerUser._id : secretaryUser._id),
        uploadDate: new Date(2025, dIdx % 12, (dIdx % 27) + 1),
        description: `Official digital document: ${cat} recorded for ${bp.name}.`,
        accessClassification: accessClass,
        verificationStatus: dIdx % 10 === 0 ? 'Flagged' : (dIdx % 5 === 0 ? 'Pending' : 'Verified'),
        verifiedBy: dIdx % 5 === 0 ? null : auditorUser._id,
        verifiedAt: dIdx % 5 === 0 ? null : new Date(2025, dIdx % 12, 28),
        checksum: checksum,
        isArchived: false,
        createdAt: new Date('2024-05-01T00:00:00Z'),
        updatedAt: new Date('2026-01-10T00:00:00Z')
      };
      documents.push(docObj);
      societyDocuments.push(docObj);
    }

    // 6. Generate Expenses (37 or 38 per Society = 300 total)
    // 4 societies get 37, 4 get 38 -> total = 300!
    const expenseCount = sIdx < 4 ? 37 : 38;
    const expenseCategories = [
      'Catering & Food', 'Decoration & Lights', 'Audio/Visual & Sound',
      'Security & Safety', 'Sanitation & Cleaning', 'Repairs & Maintenance',
      'Legal & Professional', 'Utilities & Diesel', 'Prizes & Gifts',
      'Printing & Stationery', 'Miscellaneous'
    ];
    const vendors = [
      { name: 'Apex Facility Solutions Pvt Ltd', person: 'Kishore Kumar', phone: '+91 98450 11223', gst: '29AAACA1122B1Z3' },
      { name: 'Royal Caterers & Hospitality', person: 'Venu Gopal', phone: '+91 98451 22334', gst: '29AAACR3344C1Z5' },
      { name: 'Soundcraft Acoustics & Lighting', person: 'Manjunath S', phone: '+91 98452 33445', gst: '29AAACS5566D1Z7' },
      { name: 'Shield Security & Guard Services', person: 'Col. Rawat', phone: '+91 98453 44556', gst: '29AAACS7788E1Z9' },
      { name: 'Shine Sanitation & Waste Mgmt', person: 'Ramesh Babu', phone: '+91 98454 55667', gst: '29AAACS9900F1Z1' },
      { name: 'Rapid Lift & Elevator Repairs', person: 'Satish Rao', phone: '+91 98455 66778', gst: '29AAACR1122G1Z3' }
    ];

    const societyExpenses = [];
    for (let exIdx = 0; exIdx < expenseCount; exIdx++) {
      const exId = new mongoose.Types.ObjectId();
      const cat = expenseCategories[exIdx % expenseCategories.length];
      const vendor = vendors[exIdx % vendors.length];
      const isEventRelated = exIdx % 3 !== 0; // 2 out of 3 related to events
      const targetEvent = isEventRelated ? societyEvents[exIdx % societyEvents.length] : null;
      const targetFund = isEventRelated ? eventFund : maintenanceFund;

      const requestedAmt = 8000 + (exIdx * 1250);
      const isApproved = exIdx % 15 !== 0; // few rejected
      const approvedAmt = isApproved ? requestedAmt : 0;
      const isPaid = isApproved && (exIdx % 10 !== 1);
      const paidAmt = isPaid ? approvedAmt : 0;

      let paymentStatus = 'Requested';
      if (!isApproved) {
        paymentStatus = 'Rejected';
      } else if (isPaid) {
        paymentStatus = exIdx % 8 === 0 ? 'Settled' : 'Fully Paid';
      } else {
        paymentStatus = 'Approved';
      }

      // Link to document
      const doc = societyDocuments[exIdx % societyDocuments.length];
      const invNum = `INV-${bp.code.substring(4, 7)}-${2025}-${3000 + exIdx}`;

      // Test case: duplicate invoice number for auditor verification test
      const finalInvNum = (sIdx === 0 && exIdx === 8) ? `INV-${bp.code.substring(4, 7)}-2025-3000` : invNum;

      const expenseDoc = {
        _id: exId,
        society: socId,
        event: targetEvent ? targetEvent._id : undefined,
        fund: targetFund._id,
        title: `${cat} - ${vendor.name.split(' ')[0]} Service`,
        category: cat,
        vendor: {
          name: vendor.name,
          contactPerson: vendor.person,
          phone: vendor.phone,
          panGstin: vendor.gst
        },
        quotations: [doc._id],
        invoiceNumber: finalInvNum,
        invoiceDocument: doc._id,
        requestedAmount: requestedAmt,
        approvedAmount: approvedAmt,
        advanceAmount: 0,
        paidAmount: paidAmt,
        refundAmount: 0,
        paymentStatus: paymentStatus,
        requestedBy: secretaryUser._id,
        approvedBy: isApproved ? treasurerUser._id : null,
        transactions: [], // populated when transactions are generated
        settlementDate: paymentStatus === 'Settled' ? new Date(2025, (exIdx % 11) + 1, 25) : null,
        notes: `Procured for ${bp.name} community welfare. Vendor quote verified.`,
        createdAt: new Date(2025, exIdx % 12, 5),
        updatedAt: new Date(2025, exIdx % 12, 10)
      };

      if (targetEvent && isApproved) {
        targetEvent.actualExpenseTotal += paidAmt;
      }

      expenses.push(expenseDoc);
      societyExpenses.push(expenseDoc);
    }

    // 7. Generate 375 Financial Transactions per Society (Total = 3,000)
    // Strict Ledger Balances: we track completed credits and debits per fund
    const fundBalances = {
      [String(corpusFund._id)]: { credits: 0, debits: 0 },
      [String(maintenanceFund._id)]: { credits: 0, debits: 0 },
      [String(emergencyFund._id)]: { credits: 0, debits: 0 },
      [String(eventFund._id)]: { credits: 0, debits: 0 },
      [String(sinkingFund._id)]: { credits: 0, debits: 0 }
    };

    const paymentMethods = ['Bank Transfer', 'NEFT', 'RTGS', 'UPI', 'Cheque', 'Internal Transfer'];

    for (let tIdx = 0; tIdx < 375; tIdx++) {
      const tId = new mongoose.Types.ObjectId();
      const refNum = `TXN-${bp.code.substring(4, 7)}-${2025}-${10000 + tIdx}`;
      const doc = societyDocuments[tIdx % societyDocuments.length];

      let targetFund = maintenanceFund;
      let txType = 'Contribution';
      let direction = 'Credit';
      let amount = 4500; // standard monthly maintenance
      let desc = '';
      let status = 'Completed';
      let destFund = undefined;
      let relatedEv = undefined;
      let relatedEx = undefined;

      // Status distribution: ~94% Completed, 3% Pending, 2% Rejected, 1% Cancelled
      if (tIdx === 370 || tIdx === 371) status = 'Pending';
      if (tIdx === 372 || tIdx === 373) status = 'Rejected';
      if (tIdx === 374) status = 'Cancelled';

      // Distribute across funds:
      // - Corpus Fund (0..39: 40 txs)
      // - Maintenance Fund (40..239: 200 txs)
      // - Emergency Fund (240..274: 35 txs)
      // - Event Fund (275..334: 60 txs)
      // - Sinking Fund (335..374: 40 txs)

      if (tIdx < 40) {
        // Corpus Fund: Contributions or quarterly fixed deposit interest
        targetFund = corpusFund;
        if (tIdx % 3 === 0) {
          txType = 'Interest';
          direction = 'Credit';
          amount = 65000 + (tIdx * 500);
          desc = `Quarterly Term Deposit FD Interest Credit - SBI A/c 200${sIdx}`;
        } else {
          txType = 'Contribution';
          direction = 'Credit';
          amount = 100000;
          desc = `New flat owner membership corpus fund contribution`;
        }
      } else if (tIdx < 240) {
        // Maintenance Fund (200 txs): Resident monthly maintenance + operational expenses
        targetFund = maintenanceFund;
        if (tIdx % 3 !== 0) {
          // Resident maintenance contribution
          txType = 'Contribution';
          direction = 'Credit';
          amount = 4500 + ((tIdx % 5) * 500);
          const resUser = societyUsers[(tIdx % 44) + 6];
          desc = `Monthly Maintenance payment by ${resUser.name} (${resUser.unitDetails.flatNumber})`;
        } else {
          // Maintenance Operational Expense
          txType = 'Expense Payment';
          direction = 'Debit';
          amount = 18000 + ((tIdx % 10) * 1500);
          const ex = societyExpenses[tIdx % societyExpenses.length];
          relatedEx = ex._id;
          desc = `Payment for ${ex.title}`;
          if (status === 'Completed') {
            ex.transactions.push(tId);
          }
        }
      } else if (tIdx < 275) {
        // Emergency Fund (35 txs): Interest credit or emergency plumbing/transformer repair
        targetFund = emergencyFund;
        if (tIdx % 2 === 0) {
          txType = 'Interest';
          direction = 'Credit';
          amount = 18000 + (tIdx * 200);
          desc = `Emergency reserve liquid mutual fund sweep-in interest`;
        } else {
          txType = 'Withdrawal';
          direction = 'Debit';
          amount = 35000 + ((tIdx % 4) * 4000);
          desc = `Emergency DG generator motor rewinding and urgent repair`;
        }
      } else if (tIdx < 335) {
        // Event Fund (60 txs): Event contributions, vendor expense payments, and refunds
        targetFund = eventFund;
        const ev = societyEvents[tIdx % societyEvents.length];
        relatedEv = ev._id;

        if (tIdx % 3 === 0) {
          // Inward sponsor/resident festival contribution
          txType = 'Contribution';
          direction = 'Credit';
          amount = 25000 + ((tIdx % 5) * 3000);
          desc = `Festival sponsor and resident contribution for ${ev.title}`;
        } else if (tIdx % 3 === 1) {
          // Vendor payment
          txType = 'Expense Payment';
          direction = 'Debit';
          amount = 15000 + ((tIdx % 8) * 2000);
          desc = `Vendor payment for ${ev.title} logistics and equipment`;
        } else {
          // Occasional refund or settlement
          txType = 'Refund';
          direction = 'Credit';
          amount = 3500;
          desc = `Vendor unused equipment security deposit refund for ${ev.title}`;
        }
      } else {
        // Sinking Fund (40 txs): Sinking fund collection & major lift maintenance
        targetFund = sinkingFund;
        if (tIdx % 4 === 0) {
          // Fund transfer from Maintenance to Sinking fund
          txType = 'Transfer';
          direction = 'Debit';
          destFund = corpusFund._id;
          amount = 50000;
          desc = `Quarterly statutory reserve allocation from Sinking to Corpus`;
        } else if (tIdx % 2 === 0) {
          txType = 'Contribution';
          direction = 'Credit';
          amount = 20000;
          desc = `Quarterly sinking fund mandatory resident assessment`;
        } else {
          txType = 'Interest';
          direction = 'Credit';
          amount = 25000;
          desc = `Sinking fund bond dividend credit`;
        }
      }

      // Maintain exact ledger tracking for completed transactions
      if (status === 'Completed') {
        const amt = amount;
        if (txType === 'Transfer') {
          fundBalances[String(targetFund._id)].debits += amt;
          fundBalances[String(destFund)].credits += amt;
        } else if (direction === 'Credit') {
          fundBalances[String(targetFund._id)].credits += amt;
        } else if (direction === 'Debit') {
          fundBalances[String(targetFund._id)].debits += amt;
        }
      }

      const txDate = new Date(2025, tIdx % 12, (tIdx % 28) + 1);

      const txDoc = {
        _id: tId,
        society: socId,
        fund: targetFund._id,
        destinationFund: destFund,
        transactionType: txType,
        direction: direction,
        amount: Math.round(amount * 100) / 100,
        transactionDate: txDate,
        description: desc,
        referenceNumber: refNum,
        paymentMethod: paymentMethods[tIdx % paymentMethods.length],
        relatedEvent: relatedEv,
        relatedExpense: relatedEx,
        supportingDocuments: [doc._id],
        createdBy: treasurerUser._id,
        approvedBy: adminUser._id,
        status: status,
        verificationFlags: tIdx % 25 === 0 ? [{ rule: 'Missing Quoted Tender', notes: 'Verified without 3 quotes' }] : [],
        createdAt: txDate,
        updatedAt: txDate
      };
      transactions.push(txDoc);
    }

    // Update each Fund's currentBalance strictly to: openingBalance + credits - debits
    for (const f of societyFunds) {
      const stats = fundBalances[String(f._id)];
      const net = f.openingBalance + stats.credits - stats.debits;
      f.currentBalance = Math.round(net * 100) / 100;
    }

    // 8. Generate 30 Compliance Records per Society (Total = 240)
    const complianceBlueprints = [
      { cat: 'Tax', type: 'TDS Return Filing - Form 26Q (Quarterly)', period: 'Q1 (Apr-Jun 2025)', dueM: 7, dueD: 31, liability: 35000, status: 'Filed' },
      { cat: 'Tax', type: 'TDS Return Filing - Form 26Q (Quarterly)', period: 'Q2 (Jul-Sep 2025)', dueM: 10, dueD: 31, liability: 42000, status: 'Filed' },
      { cat: 'Tax', type: 'TDS Return Filing - Form 26Q (Quarterly)', period: 'Q3 (Oct-Dec 2025)', dueM: 1, dueD: 31, liability: 38000, status: 'Filed' },
      { cat: 'Tax', type: 'TDS Return Filing - Form 26Q (Quarterly)', period: 'Q4 (Jan-Mar 2026)', dueM: 5, dueD: 31, liability: 45000, status: 'Upcoming' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - May 2025', dueM: 6, dueD: 20, liability: 28000, status: 'Filed' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - Jun 2025', dueM: 7, dueD: 20, liability: 31000, status: 'Filed' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - Jul 2025', dueM: 8, dueD: 20, liability: 29500, status: 'Filed' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - Aug 2025', dueM: 9, dueD: 20, liability: 33000, status: 'Filed' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - Sep 2025', dueM: 10, dueD: 20, liability: 34500, status: 'Filed' },
      { cat: 'Tax', type: 'GSTR-3B Monthly GST Filing', period: 'Monthly - Oct 2025', dueM: 11, dueD: 20, liability: 32000, status: 'In Progress' },
      { cat: 'Tax', type: 'GSTR-1 Outward Supplies Return', period: 'Q2 2025', dueM: 10, dueD: 11, liability: 0, status: 'Filed' },
      { cat: 'Tax', type: 'Annual Society Income Tax Return (ITR-5)', period: 'FY 2024-2025', dueM: 10, dueD: 31, liability: 120000, status: 'Pending Review' },
      { cat: 'Statutory', type: 'Registrar of Societies Annual Filing & List of Office Bearers', period: 'Annual - FY 2024-25', dueM: 9, dueD: 30, liability: 5000, status: 'Filed' },
      { cat: 'Statutory', type: 'Form 16A Generation for Vendors', period: 'Q2 2025', dueM: 11, dueD: 15, liability: 0, status: 'Filed' },
      { cat: 'Statutory', type: 'Annual General Body Meeting Notice & Agenda Dispatch', period: 'FY 2025-26', dueM: 8, dueD: 25, liability: 0, status: 'Filed' },
      { cat: 'Municipal', type: 'Municipal Property Tax Assessment for Common Amenities', period: 'Annual 2025-26', dueM: 6, dueD: 30, liability: 85000, status: 'Filed' },
      { cat: 'Municipal', type: 'Commercial Borewell NOC & Water Cess Payment', period: 'Half Yearly', dueM: 9, dueD: 15, liability: 12000, status: 'Overdue' },
      { cat: 'Municipal', type: 'Solid Waste Management Segregation Compliance Audit', period: 'Quarterly Q3', dueM: 12, dueD: 31, liability: 0, status: 'Upcoming' },
      { cat: 'Fire Safety', type: 'Annual Fire Safety Certificate (Fire NOC) Renewal Inspection', period: 'Annual 2025', dueM: 8, dueD: 31, liability: 25000, status: 'Filed' },
      { cat: 'Fire Safety', type: 'Bi-Annual Fire Hydrant & Pump Pressure Test Audit', period: 'H2 2025', dueM: 11, dueD: 30, liability: 8000, status: 'In Progress' },
      { cat: 'Fire Safety', type: 'Refilling & Servicing of Fire Extinguishers Across Wings', period: 'Annual 2025', dueM: 5, dueD: 15, liability: 18000, status: 'Filed' },
      { cat: 'Environmental', type: 'State Pollution Control Board Sewage Treatment Plant (STP) Discharge Consent', period: 'FY 2025-26', dueM: 7, dueD: 31, liability: 15000, status: 'Filed' },
      { cat: 'Environmental', type: 'Quarterly Potable Drinking Water & Tank Biological Lab Test', period: 'Q2 2025', dueM: 9, dueD: 30, liability: 6500, status: 'Correction Required' },
      { cat: 'Environmental', type: 'Acoustic Enclosure Noise Level Test for Backup DG Sets', period: 'Annual 2025', dueM: 10, dueD: 15, liability: 5000, status: 'Revised Filing Submitted' },
      { cat: 'Labor', type: 'Contractor Housekeeping & Security EPF Compliance Verification', period: 'Monthly - Sep 2025', dueM: 10, dueD: 15, liability: 0, status: 'Filed' },
      { cat: 'Labor', type: 'ESIC Contribution Verification for Estate Staff', period: 'Monthly - Sep 2025', dueM: 10, dueD: 15, liability: 0, status: 'Filed' },
      { cat: 'Labor', type: 'Annual Bonus Act Compliance Review for Direct Estate Employees', period: 'Diwali 2025', dueM: 11, dueD: 10, liability: 45000, status: 'Pending Review' },
      { cat: 'Audit', type: 'Statutory Independent Financial Audit Report Submission', period: 'FY 2024-25', dueM: 9, dueD: 30, liability: 60000, status: 'Filed' },
      { cat: 'Audit', type: 'Internal Half-Yearly Forensic & Expense Audit', period: 'H1 2025-26', dueM: 11, dueD: 15, liability: 25000, status: 'In Progress' },
      { cat: 'Governance', type: 'Executive Managing Committee Election Notification & Voter List Audit', period: 'Biennial 2025', dueM: 12, dueD: 15, liability: 0, status: 'Upcoming' }
    ];

    for (let cIdx = 0; cIdx < complianceBlueprints.length; cIdx++) {
      const bpC = complianceBlueprints[cIdx];
      const cId = new mongoose.Types.ObjectId();
      const yr = bpC.dueM <= 3 ? 2026 : 2025;
      const dueDate = new Date(yr, bpC.dueM - 1, bpC.dueD);
      const isFiled = bpC.status === 'Filed' || bpC.status === 'Revised Filing Submitted';
      const subDate = isFiled ? new Date(dueDate.getTime() - 2 * 86400000) : null;
      const ackNum = isFiled ? `ACK-${bp.code.substring(4, 7)}-${yr}-${5000 + cIdx}` : null;
      const doc = societyDocuments[cIdx % societyDocuments.length];

      const compDoc = {
        _id: cId,
        society: socId,
        complianceCategory: bpC.cat,
        complianceType: bpC.type,
        financialYear: '2025-2026',
        applicablePeriod: bpC.period,
        dueDate: dueDate,
        responsiblePerson: treasurerUser._id,
        assignedRole: 'Treasurer',
        status: bpC.status,
        submissionDate: subDate,
        acknowledgementNumber: ackNum,
        challanReference: isFiled && bpC.liability > 0 ? `CHALLAN-${yr}-${1000 + cIdx}` : undefined,
        taxLiabilityAmount: bpC.liability,
        paidAmount: isFiled ? bpC.liability : 0,
        supportingDocuments: [doc._id],
        notes: `Compliance obligation tracked under society bylaws for ${bp.name}.`,
        createdBy: adminUser._id,
        updatedBy: treasurerUser._id,
        revisionHistory: bpC.status === 'Revised Filing Submitted' ? [
          {
            revisedAt: new Date(2025, 9, 20),
            revisedBy: treasurerUser._id,
            reason: 'Corrected assessment year challan code',
            previousStatus: 'Correction Required'
          }
        ] : [],
        createdAt: new Date('2024-04-15T00:00:00Z'),
        updatedAt: new Date('2026-01-10T00:00:00Z')
      };
      compliance.push(compDoc);
    }

    // 9. Generate Reconciliations (12 or 13 per Society = 100 total)
    // First 4 societies get 13, remaining 4 get 12 -> 13*4 + 12*4 = 100!
    const recCount = sIdx < 4 ? 13 : 12;
    for (let rIdx = 0; rIdx < recCount; rIdx++) {
      const rId = new mongoose.Types.ObjectId();
      const sMonth = (rIdx % 12);
      const yr = rIdx >= 12 ? 2026 : 2025;
      const startDate = new Date(yr, sMonth, 1);
      const endDate = new Date(yr, sMonth + 1, 0);
      const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
      const label = `${monthNames[rIdx % 12]} ${yr} Monthly Bank Reconciliation`;

      const targetFund = rIdx % 2 === 0 ? maintenanceFund : corpusFund;
      const baseBal = targetFund.openingBalance + (rIdx * 15000);

      // In 1 out of 10 reconciliations, simulate a documented test difference (e.g. cheque in transit)
      const hasDiscrepancy = (sIdx === 0 && rIdx === 4);
      const diff = hasDiscrepancy ? 12500 : 0;
      const statementBal = baseBal + diff;
      const ledgerBal = baseBal;

      const doc = societyDocuments[rIdx % societyDocuments.length];

      const recDoc = {
        _id: rId,
        society: socId,
        fund: targetFund._id,
        statementPeriod: {
          startDate: startDate,
          endDate: endDate,
          label: label
        },
        openingBalance: baseBal - 15000,
        closingBalance: baseBal,
        statementBalance: statementBal,
        systemCalculatedBalance: ledgerBal,
        differenceAmount: diff,
        reconciliationStatus: hasDiscrepancy ? 'Discrepancy Detected' : 'Reconciled',
        supportingDocuments: [doc._id],
        unreconciledItems: hasDiscrepancy ? [
          {
            description: 'Cheque No. 44521 issued to lift maintenance vendor not cleared by bank before month end',
            amount: 12500,
            reason: 'Transit clearance delay'
          }
        ] : [],
        preparedBy: treasurerUser._id,
        reviewedBy: auditorUser._id,
        reviewedAt: new Date(endDate.getTime() + 5 * 86400000),
        notes: hasDiscrepancy ? 'Audit flagged variance: Cheque in transit.' : 'Perfect match between bank statement and ledger balance.',
        createdAt: new Date('2024-05-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z')
      };
      reconciliations.push(recDoc);
    }

    // 10. Generate Audit Observations (18 or 19 per Society = 150 total)
    // 6 societies get 19, 2 societies get 18 -> 19*6 + 18*2 = 150!
    const obsCount = sIdx < 6 ? 19 : 18;
    const observationCategories = [
      'Duplicate Invoice', 'Missing Evidence', 'Budget Overrun',
      'Unapproved Expense', 'Statutory Non-Compliance', 'Reconciliation Variance',
      'Policy Violation', 'Documentation Discrepancy'
    ];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const obsStatuses = ['Open', 'Under Investigation', 'Action Required', 'Resolved', 'Closed', 'False Positive'];

    for (let oIdx = 0; oIdx < obsCount; oIdx++) {
      const oId = new mongoose.Types.ObjectId();
      const cat = observationCategories[oIdx % observationCategories.length];
      const sev = severities[oIdx % severities.length];
      const stat = obsStatuses[oIdx % obsStatuses.length];
      const doc = societyDocuments[oIdx % societyDocuments.length];

      let targetType = 'Expense';
      let targetId = societyExpenses[oIdx % societyExpenses.length]._id;
      if (cat === 'Reconciliation Variance') {
        targetType = 'Reconciliation';
        targetId = reconciliations[reconciliations.length - 1]._id;
      } else if (cat === 'Statutory Non-Compliance') {
        targetType = 'Compliance';
        targetId = compliance[compliance.length - 1]._id;
      }

      const isResolved = stat === 'Resolved' || stat === 'Closed';

      const obsDoc = {
        _id: oId,
        society: socId,
        relatedEntityType: targetType,
        relatedEntityId: targetId,
        observationCategory: cat,
        title: `Audit Note: ${cat} identified during review #${100 + oIdx}`,
        description: `Independent auditor detected potential discrepancy regarding ${cat}. Detailed review conducted on records.`,
        severity: sev,
        evidenceReferences: [doc._id],
        assignedPerson: treasurerUser._id,
        status: stat,
        correctiveAction: 'Submit revised voucher with committee authorization and tax invoice proof.',
        dueDate: new Date(2025, (oIdx % 11) + 1, 15),
        resolutionDetails: isResolved ? 'Vendor submitted corrected GST invoice and discrepancy reconciled.' : null,
        resolvedAt: isResolved ? new Date(2025, (oIdx % 11) + 1, 18) : null,
        resolvedBy: isResolved ? auditorUser._id : null,
        createdBy: auditorUser._id,
        createdAt: new Date(2025, oIdx % 12, 1),
        updatedAt: new Date(2025, oIdx % 12, 10)
      };
      auditObservations.push(obsDoc);
    }

    // 11. Generate Audit Logs (187 or 188 per Society = 1,500 total)
    // 4 societies get 188, 4 get 187 -> 188*4 + 187*4 = 1,500!
    const logCount = sIdx < 4 ? 188 : 187;
    const actions = ['CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'RECONCILE', 'VERIFY', 'FLAG', 'SETTLE', 'EXPORT', 'LOGIN'];
    const entities = ['Transaction', 'Compliance', 'Expense', 'Event', 'Document', 'Reconciliation', 'Fund'];

    for (let lIdx = 0; lIdx < logCount; lIdx++) {
      const lId = new mongoose.Types.ObjectId();
      const act = actions[lIdx % actions.length];
      const ent = entities[lIdx % entities.length];
      const actor = lIdx % 3 === 0 ? auditorUser : (lIdx % 2 === 0 ? treasurerUser : adminUser);
      const logDate = new Date(2025, lIdx % 12, (lIdx % 28) + 1, (lIdx % 12) + 8, lIdx % 60);

      const logDoc = {
        _id: lId,
        society: socId,
        actor: actor._id,
        action: act,
        entityType: ent,
        entityId: new mongoose.Types.ObjectId(),
        changeSummary: `${act} operation executed on ${ent} entity by ${actor.name} (${actor.role})`,
        previousValues: { status: 'Draft' },
        newValues: { status: 'Approved' },
        ipAddress: `192.168.1.${10 + (lIdx % 50)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
        correlationId: `CORR-${bp.code.substring(4, 7)}-${10000 + lIdx}`,
        timestamp: logDate,
        createdAt: logDate,
        updatedAt: logDate
      };
      auditLogs.push(logDoc);
    }

    // 12. Generate 25 Resident Queries per Society (Total = 200)
    const queryTopics = [
      { subj: 'Clarification regarding Q2 lift AMC escalation', cat: 'Maintenance Charges', text: 'Why did the quarterly lift AMC charges increase by 15% in Q2 compared to Q1?' },
      { subj: 'Diwali Celebration financial statement publication', cat: 'Event Expense', text: 'Could the committee share the itemized food and decoration bills for the Diwali gala?' },
      { subj: 'Solar Panel subsidy credit timeline', cat: 'Financial Report', text: 'When will the government rooftop solar subsidy be credited back to the Sinking fund?' },
      { subj: 'Status of STP quarterly biological water test', cat: 'Compliance Status', text: 'Are the treated STP water test reports safe for garden irrigation this month?' },
      { subj: 'Audit observation #104 corrective action update', cat: 'Audit Finding', text: 'Has the vendor refunded the double invoice payment flagged by the auditor in observation #104?' },
      { subj: 'Visitor parking fee allocation policy', cat: 'General Governance', text: 'Is the parking penalty amount credited to the Maintenance fund or Emergency fund?' },
      { subj: 'DG diesel fuel consumption audit breakdown', cat: 'Maintenance Charges', text: 'Requesting the hourly power outage diesel consumption log for August monsoon storms.' },
      { subj: 'Clubhouse gym equipment repair invoice receipt', cat: 'Event Expense', text: 'Kindly upload the warranty and repair invoice for the treadmill motors.' },
      { subj: 'TDS deduction certificates for flat owners', cat: 'Compliance Status', text: 'Can the treasurer provide Form 16A TDS certificates for tax filing purposes?' },
      { subj: 'Swimming pool tile grouting tender quotes', cat: 'Financial Report', text: 'Were three vendor quotations compared before awarding the pool waterproofing contract?' }
    ];

    for (let qIdx = 0; qIdx < 25; qIdx++) {
      const qId = new mongoose.Types.ObjectId();
      const topic = queryTopics[qIdx % queryTopics.length];
      const resident = societyUsers[(qIdx % 44) + 6];
      const isAnswered = qIdx % 4 !== 0;

      const qDoc = {
        _id: qId,
        society: socId,
        resident: resident._id,
        subject: topic.subj,
        category: topic.cat,
        relatedEntityType: 'None',
        relatedEntityId: null,
        queryText: topic.text,
        status: isAnswered ? (qIdx % 3 === 0 ? 'Closed' : 'Answered') : 'Open',
        responses: isAnswered ? [
          {
            respondent: treasurerUser._id,
            responseText: `Dear ${resident.name}, thank you for your query. The managing committee reviewed this. Full itemized vouchers and supporting certificates are verified and published in the Transparency Portal under documents vault.`,
            respondedAt: new Date(2025, qIdx % 12, (qIdx % 25) + 3)
          }
        ] : [],
        isPublicToResidents: true,
        createdAt: new Date(2025, qIdx % 12, (qIdx % 25) + 1),
        updatedAt: new Date(2025, qIdx % 12, (qIdx % 25) + 3)
      };
      residentQueries.push(qDoc);
    }
  }

  return {
    societies,
    users,
    funds,
    transactions,
    compliance,
    documents,
    reconciliations,
    auditLogs,
    auditObservations,
    events,
    expenses,
    residentQueries
  };
}

module.exports = {
  generateSeedDataset
};
