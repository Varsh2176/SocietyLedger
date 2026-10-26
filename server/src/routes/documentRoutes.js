const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { upload } = require('../middleware/uploadMiddleware');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/:id/download', documentController.downloadDocument);

// File upload: Committee, Treasurer, Auditor, Admin
router.post(
  '/',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  upload.single('file'),
  documentController.uploadDocument
);

module.exports = router;
