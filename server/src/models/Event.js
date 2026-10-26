const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../config/constants');

const quotationSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true, trim: true },
    bidAmount: { type: Number, required: true },
    quotationRef: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'SELECTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const budgetBreakdownSchema = new mongoose.Schema(
  {
    head: { type: String, required: true, trim: true },
    proposed: { type: Number, default: 0 },
    approved: { type: Number, default: null },
    actual: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    ref: { type: String, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, default: 'PAYMENT' },
    status: { type: String, default: 'PAID' },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event start date is required'],
    },
    endDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.PROPOSED,
      index: true,
    },
    proposedBudget: {
      type: Number,
      default: 0,
    },
    approvedBudget: {
      type: Number,
      default: null,
    },
    actualExpenditure: {
      type: Number,
      default: 0,
    },
    unspentBalance: {
      type: Number,
      default: null,
    },
    fundingSource: {
      type: String,
      trim: true,
      default: 'Operational Account',
    },
    proposedBy: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: String,
      trim: true,
      default: null,
    },
    selectedVendor: {
      id: { type: String },
      name: { type: String, trim: true },
      bidAmount: { type: Number },
      quotationRef: { type: String, trim: true },
      isContractSigned: { type: Boolean, default: false },
    },
    quotations: [quotationSchema],
    budgetBreakdown: [budgetBreakdownSchema],
    invoices: [invoiceItemSchema],
    settlementNotes: {
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
