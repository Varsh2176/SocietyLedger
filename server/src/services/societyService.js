const { Society, User } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { logAction } = require('./auditService');

/**
 * Retrieves society profile and configuration
 */
const getSocietyDetails = async (societyId) => {
  const society = await Society.findById(societyId);
  if (!society) {
    const error = new Error('Society record not found.');
    error.statusCode = 404;
    throw error;
  }
  return society;
};

/**
 * Updates society details (Admin only)
 */
const updateSociety = async (societyId, updateData, user) => {
  const society = await getSocietyDetails(societyId);

  if (updateData.name) society.name = updateData.name.trim();
  if (updateData.registrationNumber) society.registrationNumber = updateData.registrationNumber.trim();
  if (updateData.address) society.address = { ...society.address, ...updateData.address };
  if (updateData.fiscalYear) society.fiscalYear = updateData.fiscalYear.trim();
  if (updateData.statutoryAuditStatus) society.statutoryAuditStatus = updateData.statutoryAuditStatus.trim();
  if (updateData.auditorCertification) society.auditorCertification = updateData.auditorCertification.trim();
  if (updateData.settings) society.settings = { ...society.settings, ...updateData.settings };

  await society.save();

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Administrator',
    actorId: user ? user._id : null,
    action: 'UPDATE_SOCIETY_SETTINGS',
    entityType: 'SOCIETY',
    entityRef: society.code,
    details: `Updated settings and governance parameters for society '${society.name}'.`,
  });

  return society;
};

/**
 * Lists society members with role and apartment information
 */
const getSocietyMembers = async (societyId, params = {}) => {
  const { role, search } = params;
  const query = { societyId };

  if (role && role !== 'ALL') {
    query.role = role;
  }
  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { apartmentNumber: { $regex: q, $options: 'i' } },
    ];
  }

  // Security: exclude password, token fields
  const members = await User.find(query).select('-password -refreshToken').sort({ role: 1, name: 1 });
  return members;
};

/**
 * Updates member role or status (Admin only)
 */
const updateMemberRole = async (societyId, memberId, { role, isActive, isVerified }, user) => {
  const member = await User.findOne({ _id: memberId, societyId });
  if (!member) {
    const error = new Error('Member account not found in this society.');
    error.statusCode = 404;
    throw error;
  }

  const prevRole = member.role;

  if (role) {
    if (!Object.values(USER_ROLES).includes(role)) {
      const error = new Error(`Invalid role '${role}'.`);
      error.statusCode = 400;
      throw error;
    }
    member.role = role;
  }

  if (isActive !== undefined) member.isActive = Boolean(isActive);
  if (isVerified !== undefined) member.isVerified = Boolean(isVerified);

  await member.save();

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Administrator',
    actorId: user ? user._id : null,
    action: 'UPDATE_MEMBER_ROLE',
    entityType: 'USER',
    entityRef: member.email,
    details: `Changed role of ${member.name} (${member.email}) from '${prevRole}' to '${member.role}'.`,
  });

  return member.toJSON();
};

module.exports = {
  getSocietyDetails,
  updateSociety,
  getSocietyMembers,
  updateMemberRole,
};
