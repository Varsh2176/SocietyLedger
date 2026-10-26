const mongoose = require('mongoose');
const { AUDIT_SEVERITY, AUDIT_OBSERVATION_STATUS } = require('../config/constants');

const auditObservationSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Observation title is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: Object.values(AUDIT_SEVERITY),
      required: [true, 'Severity level is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AUDIT_OBSERVATION_STATUS),
      default: AUDIT_OBSERVATION_STATUS.OPEN,
      index: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    relatedEntity: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    observation: {
      type: String,
      required: [true, 'Observation text is required'],
      trim: true,
    },
    correctiveAction: {
      type: String,
      trim: true,
      default: '',
    },
    evidenceDocument: {
      type: String,
      trim: true,
      default: null,
    },
    isWarningOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const AuditObservation = mongoose.model('AuditObservation', auditObservationSchema);
module.exports = AuditObservation;
