/**
 * Society Tenant Scope Isolation Middleware
 * Prevents unauthorized cross-society data access by strictly scoping
 * all operations to the authenticated user's assigned societyId.
 */
const enforceSocietyScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // If user has an assigned society, enforce that scope
  if (req.user.societyId) {
    const userSocietyId = req.user.societyId.toString();

    // If request attempts to supply a different society ID in params or body, block it
    const requestedSocietyId = req.params.societyId || req.query.societyId || req.body.societyId;
    if (requestedSocietyId && requestedSocietyId.toString() !== userSocietyId) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cross-society data access is strictly prohibited.',
      });
    }

    // Force injection of verified societyId
    req.societyId = userSocietyId;
    req.body.societyId = userSocietyId;
  }

  next();
};

module.exports = {
  enforceSocietyScope,
};
