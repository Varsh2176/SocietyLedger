const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Event title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    eventType: {
      type: String,
      enum: {
        values: [
          'Cultural Festival',
          'Annual General Meeting',
          'Sports Tournament',
          'Independence/Republic Day',
          'Maintenance Drive',
          'Health & Safety Camp',
          'Community Gathering',
          'Other'
        ],
        message: '{VALUE} is not a valid event type'
      },
      required: [true, 'Event type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date is required'],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'Event end date must be on or after start date'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['Proposed', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid event status'
      },
      default: 'Proposed',
      required: [true, 'Event status is required']
    },
    approvedBudget: {
      type: Number,
      required: [true, 'Approved budget is required'],
      min: [0, 'Approved budget cannot be negative'],
      default: 0
    },
    actualExpenseTotal: {
      type: Number,
      default: 0,
      min: [0, 'Actual expense total cannot be negative']
    },
    organizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer user reference is required']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relatedFund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      required: [true, 'Related fund reference is required']
    },
    settlementStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Partially Settled', 'Settled'],
        message: '{VALUE} is not a valid settlement status'
      },
      default: 'Pending'
    },
    settlementDate: {
      type: Date
    },
    settlementNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ society: 1, startDate: -1 });
eventSchema.index({ society: 1, status: 1 });
eventSchema.index({ relatedFund: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
