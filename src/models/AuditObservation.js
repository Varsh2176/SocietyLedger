const mongoose = require('mongoose');

const auditObservationSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: [
          'Transaction',
          'Event',
          'Expense',
          'Compliance',
          'Fund',
          'Reconciliation',
          'Document'
        ],
        message: '{VALUE} is not a valid related entity type'
      },
      required: [true, 'Related entity type is required']
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Related entity ID is required']
    },
    observationCategory: {
      type: String,
      enum: {
        values: [
          'Duplicate Invoice',
          'Missing Evidence',
          'Budget Overrun',
          'Unapproved Expense',
          'Statutory Non-Compliance',
          'Reconciliation Variance',
          'Policy Violation',
          'Documentation Discrepancy'
        ],
        message: '{VALUE} is not a valid observation category'
      },
      required: [true, 'Observation category is required']
    },
    title: {
      type: String,
      required: [true, 'Observation title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Observation detailed description is required'],
      trim: true
    },
    severity: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid severity level'
      },
      required: [true, 'Severity level is required']
    },
    evidenceReferences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    assignedPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user reference is required']
    },
    status: {
      type: String,
      enum: {
        values: [
          'Open',
          'Under Investigation',
          'Action Required',
          'Resolved',
          'Closed',
          'False Positive'
        ],
        message: '{VALUE} is not a valid observation status'
      },
      default: 'Open',
      required: [true, 'Observation status is required']
    },
    correctiveAction: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date
    },
    resolutionDetails: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    }
  },
  {
    timestamps: true
  }
);

auditObservationSchema.index({ society: 1, status: 1, severity: 1 });
auditObservationSchema.index({ society: 1, observationCategory: 1 });
auditObservationSchema.index({ assignedPerson: 1, status: 1 });

const AuditObservation = mongoose.model('AuditObservation', auditObservationSchema);

module.exports = AuditObservation;
