/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces route authorization based on user role.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
