const residentService = require('../services/residentService');

const getTransparency = async (req, res, next) => {
  try {
    const data = await residentService.getTransparencyData(req.societyId);

    res.status(200).json({
      success: true,
      message: 'Transparency disclosures retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getQueries = async (req, res, next) => {
  try {
    const queries = await residentService.getQueries(req.societyId, req.query, req.user);

    res.status(200).json({
      success: true,
      message: 'Resident queries retrieved successfully.',
      data: {
        queries,
      },
      queries,
    });
  } catch (error) {
    next(error);
  }
};

const submitQuery = async (req, res, next) => {
  try {
    const query = await residentService.submitQuery(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Clarification query submitted successfully.',
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

const answerQuery = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    const query = await residentService.answerQuery(req.societyId, req.params.id, replyText, req.user);

    res.status(200).json({
      success: true,
      message: 'Response registered successfully.',
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransparency,
  getQueries,
  submitQuery,
  answerQuery,
};
