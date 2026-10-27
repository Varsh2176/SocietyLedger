const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
      maxlength: [150, 'Society name cannot exceed 150 characters']
    },
    code: {
      type: String,
      required: [true, 'Unique society code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, 'Society code must be 3-20 uppercase alphanumeric characters, dashes, or underscores']
    },
    address: {
      street: { type: String, required: [true, 'Street address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
        match: [/^[0-9]{6}$/, 'Postal code must be a 6-digit Indian PIN code']
      },
      country: { type: String, default: 'India', trim: true }
    },
    contact: {
      email: {
        type: String,
        required: [true, 'Society official email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email address']
      },
      phone: {
        type: String,
        required: [true, 'Society contact phone is required'],
        trim: true
      },
      emergencyContact: { type: String, trim: true }
    },
    registration: {
      registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        trim: true
      },
      registrationDate: { type: Date },
      authority: {
        type: String,
        default: 'Registrar of Co-operative Societies',
        trim: true
      },
      taxIdentifier: {
        type: String,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
      },
      gstin: {
        type: String,
        trim: true
      }
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Suspended', 'Inactive', 'Under Formation'],
        message: '{VALUE} is not a valid society status'
      },
      default: 'Active'
    },
    settings: {
      financialYearStartMonth: {
        type: Number,
        default: 4, // April (Standard Indian Financial Year)
        min: 1,
        max: 12
      },
      currency: {
        type: String,
        default: 'INR'
      },
      verificationRulesEnabled: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

societySchema.index({ code: 1 }, { unique: true });
societySchema.index({ status: 1 });
societySchema.index({ 'address.city': 1 });

const Society = mongoose.model('Society', societySchema);

module.exports = Society;
