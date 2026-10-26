const path = require('path');
const fs = require('fs');
const { Document } = require('../models');
const { logAction } = require('./auditService');

/**
 * Retrieves document records for a society with optional category filter
 */
const getDocuments = async (societyId, params = {}) => {
  const { category, search } = params;
  const query = { societyId };

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { relatedEntity: { $regex: q, $options: 'i' } },
      { uploadedBy: { $regex: q, $options: 'i' } },
    ];
  }

  const documents = await Document.find(query).sort({ uploadedAt: -1, createdAt: -1 });
  return documents;
};

/**
 * Retrieves a single document by ID
 */
const getDocumentById = async (societyId, id) => {
  const document = await Document.findOne({ _id: id, societyId }).select('+filePath');
  if (!document) {
    const error = new Error('Document record not found.');
    error.statusCode = 404;
    throw error;
  }
  return document;
};

/**
 * Saves uploaded document metadata in the private repository
 */
const saveDocument = async (societyId, file, metadata = {}, user) => {
  if (!file) {
    const error = new Error('No file provided for upload.');
    error.statusCode = 400;
    throw error;
  }

  const sizeKB = (file.size / 1024).toFixed(0);
  const sizeFormatted = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`;

  const document = await Document.create({
    societyId,
    name: file.originalname,
    originalName: file.originalname,
    category: metadata.category || 'GENERAL',
    size: sizeFormatted,
    sizeInBytes: file.size,
    fileType: file.mimetype || 'application/octet-stream',
    filePath: file.path,
    uploadedAt: new Date(),
    uploadedBy: user ? user.name : 'Authorized Uploader',
    uploadedById: user ? user._id : null,
    verificationStatus: 'PENDING_VERIFICATION',
    relatedEntity: metadata.relatedEntity || 'General Deposit',
  });

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Uploader',
    actorId: user ? user._id : null,
    action: 'UPLOAD_DOCUMENT',
    entityType: 'DOCUMENT',
    entityRef: document.name,
    details: `Uploaded document '${document.name}' (${document.category}, ${sizeFormatted}).`,
  });

  return document;
};

module.exports = {
  getDocuments,
  getDocumentById,
  saveDocument,
};
