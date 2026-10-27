const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor user reference is required']
    },
    action: {
      type: String,
      enum: {
        values: [
          'CREATE',
          'UPDATE',
          'DELETE',
          'APPROVE',
          'REJECT',
          'LOGIN',
          'LOGOUT',
          'EXPORT',
          'VERIFY',
          'FLAG',
          'RECONCILE',
          'SETTLE'
        ],
        message: '{VALUE} is not a valid audit action'
      },
      required: [true, 'Audit action is required']
    },
    entityType: {
      type: String,
      enum: {
        values: [
          'Society',
          'User',
          'Fund',
          'Transaction',
          'Compliance',
          'Document',
          'Reconciliation',
          'AuditObservation',
          'Event',
          'Expense',
          'ResidentQuery'
        ],
        message: '{VALUE} is not a valid entity type'
      },
      required: [true, 'Target entity type is required']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target entity ID is required']
    },
    changeSummary: {
      type: String,
      required: [true, 'Change summary is required'],
      trim: true
    },
    previousValues: {
      type: mongoose.Schema.Types.Mixed
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    correlationId: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ society: 1, timestamp: -1 });
auditLogSchema.index({ society: 1, entityType: 1, entityId: 1 });
auditLogSchema.index({ actor: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
