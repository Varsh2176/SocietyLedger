const societyService = require('../services/societyService');

const getSociety = async (req, res, next) => {
  try {
    const society = await societyService.getSocietyDetails(req.societyId);

    res.status(200).json({
      success: true,
      message: 'Society details retrieved successfully.',
      data: society,
    });
  } catch (error) {
    next(error);
  }
};

const updateSociety = async (req, res, next) => {
  try {
    const society = await societyService.updateSociety(req.societyId, req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'Society parameters updated successfully.',
      data: society,
    });
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await societyService.getSocietyMembers(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Society members retrieved successfully.',
      data: {
        members,
      },
      members,
    });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await societyService.updateMemberRole(
      req.societyId,
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Member account updated successfully.',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSociety,
  updateSociety,
  getMembers,
  updateMember,
};
