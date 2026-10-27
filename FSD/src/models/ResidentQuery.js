const mongoose = require('mongoose');

const residentQuerySchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident user reference is required']
    },
    subject: {
      type: String,
      required: [true, 'Query subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: {
        values: [
          'Financial Report',
          'Maintenance Charges',
          'Event Expense',
          'Audit Finding',
          'Compliance Status',
          'General Governance'
        ],
        message: '{VALUE} is not a valid query category'
      },
      required: [true, 'Query category is required']
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: ['Event', 'Transaction', 'Fund', 'Compliance', 'AuditObservation', 'None'],
        message: '{VALUE} is not a valid related entity type'
      },
      default: 'None'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    queryText: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Review', 'Answered', 'Closed'],
        message: '{VALUE} is not a valid query status'
      },
      default: 'Open',
      required: [true, 'Query status is required']
    },
    responses: [
      {
        respondent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Respondent user reference is required']
        },
        responseText: {
          type: String,
          required: [true, 'Response text is required'],
          trim: true
        },
        respondedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isPublicToResidents: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

residentQuerySchema.index({ society: 1, status: 1 });
residentQuerySchema.index({ resident: 1, status: 1 });
residentQuerySchema.index({ society: 1, category: 1 });

const ResidentQuery = mongoose.model('ResidentQuery', residentQuerySchema);

module.exports = ResidentQuery;
