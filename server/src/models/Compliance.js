const mongoose = require('mongoose');
const { COMPLIANCE_STATUS } = require('../config/constants');

const complianceSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    filingType: {
      type: String,
      required: [true, 'Filing type is required'],
      trim: true,
    },
    statutoryBody: {
      type: String,
      required: [true, 'Statutory body is required'],
      trim: true,
    },
    financialPeriod: {
      type: String,
      required: [true, 'Financial period is required'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Statutory deadline is required'],
      index: true,
    },
    submissionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(COMPLIANCE_STATUS),
      default: COMPLIANCE_STATUS.PENDING,
      index: true,
    },
    responsiblePerson: {
      type: String,
      trim: true,
    },
    acknowledgementRef: {
      type: String,
      trim: true,
      default: null,
    },
    supportingDocument: {
      type: String,
      trim: true,
      default: null,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        if (ret.deadline instanceof Date) {
          ret.deadline = ret.deadline.toISOString().split('T')[0];
        }
        if (ret.submissionDate instanceof Date) {
          ret.submissionDate = ret.submissionDate.toISOString().split('T')[0];
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Compliance = mongoose.model('Compliance', complianceSchema);
module.exports = Compliance;
