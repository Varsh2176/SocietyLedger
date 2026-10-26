const eventService = require('../services/eventService');

const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEvents(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully.',
      data: {
        events,
      },
      events,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event details retrieved successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const createProposal = async (req, res, next) => {
  try {
    const event = await eventService.createProposal(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Event proposal created successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createProposal,
};
