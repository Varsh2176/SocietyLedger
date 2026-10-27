const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    complianceCategory: {
      type: String,
      enum: {
        values: [
          'Tax',
          'Statutory',
          'Municipal',
          'Fire Safety',
          'Environmental',
          'Labor',
          'Audit',
          'Governance'
        ],
        message: '{VALUE} is not a valid compliance category'
      },
      required: [true, 'Compliance category is required']
    },
    complianceType: {
      type: String,
      required: [true, 'Compliance type description is required'],
      trim: true,
      maxlength: [150, 'Compliance type cannot exceed 150 characters']
    },
    financialYear: {
      type: String,
      required: [true, 'Financial year is required'],
      match: [/^[0-9]{4}-[0-9]{4}$/, 'Financial year must match YYYY-YYYY format, e.g. 2025-2026']
    },
    applicablePeriod: {
      type: String,
      required: [true, 'Applicable period is required'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Responsible person reference is required']
    },
    assignedRole: {
      type: String,
      enum: {
        values: [
          'Treasurer',
          'Committee Member',
          'Auditor',
          'Society Administrator',
          'Estate Manager',
          'Legal Consultant'
        ],
        message: '{VALUE} is not a supported assigned role'
      },
      default: 'Treasurer'
    },
    status: {
      type: String,
      enum: {
        values: [
          'Upcoming',
          'In Progress',
          'Pending Review',
          'Filed',
          'Overdue',
          'Correction Required',
          'Revised Filing Submitted'
        ],
        message: '{VALUE} is not a valid compliance status'
      },
      default: 'Upcoming',
      required: [true, 'Compliance status is required']
    },
    submissionDate: {
      type: Date
    },
    acknowledgementNumber: {
      type: String,
      trim: true
    },
    challanReference: {
      type: String,
      trim: true
    },
    taxLiabilityAmount: {
      type: Number,
      min: [0, 'Tax liability amount cannot be negative'],
      default: 0
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0
    },
    supportingDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    revisionHistory: [
      {
        revisedAt: { type: Date, default: Date.now },
        revisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, trim: true },
        previousStatus: { type: String, trim: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

complianceSchema.index({ society: 1, status: 1, dueDate: 1 });
complianceSchema.index({ society: 1, complianceCategory: 1 });
complianceSchema.index({ society: 1, financialYear: 1 });
complianceSchema.index({ dueDate: 1 });
complianceSchema.index({ responsiblePerson: 1, status: 1 });

const Compliance = mongoose.model('Compliance', complianceSchema);

module.exports = Compliance;
