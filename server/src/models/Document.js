const mongoose = require('mongoose');
const { DOCUMENT_CATEGORIES } = require('../config/constants');

const documentSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(DOCUMENT_CATEGORIES),
      default: DOCUMENT_CATEGORIES.GENERAL,
      index: true,
    },
    size: {
      type: String,
      trim: true,
    },
    sizeInBytes: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      trim: true,
      default: 'application/octet-stream',
    },
    filePath: {
      type: String,
      required: true,
      select: false, // Security: never expose server file paths to public API
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: String,
      trim: true,
      required: true,
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING_VERIFICATION', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
    },
    relatedEntity: {
      type: String,
      trim: true,
      default: 'General Deposit',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        if (ret.uploadedAt instanceof Date) {
          ret.uploadedAt = ret.uploadedAt.toISOString().split('T')[0];
        }
        delete ret._id;
        delete ret.__v;
        delete ret.filePath;
        return ret;
      },
    },
  }
);

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
