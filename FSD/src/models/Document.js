const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true
    },
    documentCategory: {
      type: String,
      enum: {
        values: [
          'Invoice',
          'Receipt',
          'Bank Statement',
          'Tax Document',
          'Compliance Acknowledgement',
          'Vendor Quotation',
          'Purchase Order',
          'Audit Evidence',
          'Minutes of Meeting',
          'Other'
        ],
        message: '{VALUE} is not a valid document category'
      },
      required: [true, 'Document category is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [0, 'File size cannot be negative']
    },
    storageProvider: {
      type: String,
      enum: {
        values: ['local', 's3', 'gcs', 'azure', 'mock_secure_storage'],
        message: '{VALUE} is not a supported storage provider'
      },
      default: 'local',
      required: [true, 'Storage provider is required']
    },
    storageKey: {
      type: String,
      required: [true, 'Private storage key or object identifier is required'],
      trim: true
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: [
          'Transaction',
          'Compliance',
          'Event',
          'Expense',
          'Reconciliation',
          'AuditObservation',
          'Fund',
          'Society',
          'None'
        ],
        message: '{VALUE} is not a valid related entity type'
      },
      default: 'None'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user reference is required']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    accessClassification: {
      type: String,
      enum: {
        values: ['Public', 'Resident', 'Committee', 'Confidential', 'AuditorOnly'],
        message: '{VALUE} is not a valid access classification'
      },
      default: 'Committee',
      required: [true, 'Access classification is required']
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Verified', 'Rejected', 'Flagged'],
        message: '{VALUE} is not a valid verification status'
      },
      default: 'Pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    verificationNotes: {
      type: String,
      trim: true
    },
    checksum: {
      type: String,
      trim: true
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ society: 1, documentCategory: 1 });
documentSchema.index({ society: 1, relatedEntityType: 1, relatedEntityId: 1 });
documentSchema.index({ society: 1, verificationStatus: 1 });
documentSchema.index({ checksum: 1 });
documentSchema.index({ uploadedBy: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
