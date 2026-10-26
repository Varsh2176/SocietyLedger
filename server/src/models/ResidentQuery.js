const mongoose = require('mongoose');
const { QUERY_STATUS } = require('../config/constants');

const residentQuerySchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    reference: {
      type: String,
      required: [true, 'Query reference is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Query category is required'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Apartment unit is required'],
      trim: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    residentName: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    status: {
      type: String,
      enum: Object.values(QUERY_STATUS),
      default: QUERY_STATUS.OPEN,
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    response: {
      answeredBy: { type: String, trim: true },
      answeredById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answeredAt: { type: Date },
      replyText: { type: String, trim: true },
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

const ResidentQuery = mongoose.model('ResidentQuery', residentQuerySchema);
module.exports = ResidentQuery;
