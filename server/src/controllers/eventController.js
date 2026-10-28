
const eventService = require('../services/eventService');

const handle = (action, successMessage, statusCode = 200) =>
  async (req, res, next) => {
    try {
      const result = await action(req);
      res.status(statusCode).json({
        success: true,
        message: successMessage,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getEvents = handle(
  (req) => eventService.getEvents(req.societyId, req.query),
  'Events retrieved successfully.'
);

const getEventById = handle(
  (req) => eventService.getEventById(req.societyId, req.params.id),
  'Event details retrieved successfully.'
);

const createProposal = handle(
  (req) => eventService.createProposal(req.societyId, req.body, req.user),
  'Event proposal created successfully.',
  201
);

const approveProposal = handle(
  (req) => eventService.approveProposal(req.societyId, req.params.id, req.body, req.user),
  'Event proposal approved successfully.'
);

const rejectProposal = handle(
  (req) => eventService.rejectProposal(
    req.societyId, req.params.id, req.body?.reason, req.user
  ),
  'Event proposal rejected.'
);

const selectVendor = handle(
  (req) => eventService.selectVendor(
    req.societyId, req.params.id, req.body?.quotationId, req.user
  ),
  'Event vendor selected successfully.'
);

const recordInvoice = handle(
  (req) => eventService.recordInvoice(req.societyId, req.params.id, req.body, req.user),
  'Event invoice recorded successfully.',
  201
);

const settleEvent = handle(
  (req) => eventService.settleEvent(
    req.societyId, req.params.id, req.body?.notes, req.user
  ),
  'Event settled successfully.'
);

module.exports = {
  getEvents,
  getEventById,
  createProposal,
  approveProposal,
  rejectProposal,
  selectVendor,
  recordInvoice,
  settleEvent,
};
