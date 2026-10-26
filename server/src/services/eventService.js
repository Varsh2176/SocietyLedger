const { Event } = require('../models');
const { EVENT_STATUS } = require('../config/constants');
const { logAction } = require('./auditService');

/**
 * Retrieves events with optional status filter and keyword search
 */
const getEvents = async (societyId, params = {}) => {
  const { status, search } = params;
  const query = { societyId };

  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { fundingSource: { $regex: q, $options: 'i' } },
      { proposedBy: { $regex: q, $options: 'i' } },
    ];
  }

  const events = await Event.find(query).sort({ date: -1, createdAt: -1 });
  return events;
};

/**
 * Retrieves a single event by ID
 */
const getEventById = async (societyId, id) => {
  const event = await Event.findOne({ _id: id, societyId });
  if (!event) {
    const error = new Error('Event record not found.');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

/**
 * Creates a new event proposal
 */
const createProposal = async (societyId, data, user) => {
  const {
    title,
    description,
    date,
    endDate,
    proposedBudget,
    fundingSource,
    budgetBreakdown = [],
  } = data;

  if (!title || !date || proposedBudget === undefined) {
    const error = new Error('Event title, date, and proposed budget are required.');
    error.statusCode = 400;
    throw error;
  }

  const budgetNum = Number(proposedBudget) || 0;

  const event = await Event.create({
    societyId,
    title: title.trim(),
    description: description ? description.trim() : '',
    date: date.trim(),
    endDate: endDate ? endDate.trim() : null,
    status: EVENT_STATUS.PROPOSED,
    proposedBudget: budgetNum,
    approvedBudget: null,
    actualExpenditure: 0,
    unspentBalance: null,
    fundingSource: fundingSource ? fundingSource.trim() : 'Operational Account',
    proposedBy: user ? `${user.name} (${user.role})` : 'Resident Member',
    approvedBy: 'Pending Committee Review',
    budgetBreakdown,
    quotations: [],
    invoices: [],
    settlementNotes: 'Proposal submitted for committee review and budget sanction.',
  });

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Proposer',
    actorId: user ? user._id : null,
    action: 'CREATE_EVENT_PROPOSAL',
    entityType: 'EVENT',
    entityRef: event.title,
    details: `Submitted proposal for event '${event.title}' with proposed budget ₹ ${budgetNum}.`,
  });

  return event;
};

module.exports = {
  getEvents,
  getEventById,
  createProposal,
};
