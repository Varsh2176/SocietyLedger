const path = require('path');
const fs = require('fs');
const documentService = require('../services/documentService');

const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getDocuments(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully.',
      data: {
        documents,
      },
      documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document details retrieved successfully.',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentService.saveDocument(
      req.societyId,
      req.file,
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded and registered successfully.',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.societyId, req.params.id);

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical document file not found on server repository.',
      });
    }

    res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);

    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
};
