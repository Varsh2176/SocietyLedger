const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Society code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    fiscalYear: {
      type: String,
      default: 'FY 2026-27',
      trim: true,
    },
    statutoryAuditStatus: {
      type: String,
      default: 'VERIFIED_FY25_26',
      trim: true,
    },
    auditorCertification: {
      type: String,
      trim: true,
    },
    settings: {
      approvalThreshold: {
        type: Number,
        default: 25000, // Discretionary procurement limit in INR
      },
      multipleBidsRequiredThreshold: {
        type: Number,
        default: 25000,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
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

const Society = mongoose.model('Society', societySchema);
module.exports = Society;
