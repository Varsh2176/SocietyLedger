const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    fund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      required: [true, 'Fund reference is required']
    },
    destinationFund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      required: [
        function () {
          return this.transactionType === 'Transfer';
        },
        'Transfer transactions require a destination fund'
      ],
      validate: {
        validator: function (value) {
          if (this.transactionType === 'Transfer' && value) {
            return String(value) !== String(this.fund);
          }
          return true;
        },
        message: 'Destination fund cannot be the same as source fund'
      }
    },
    transactionType: {
      type: String,
      enum: {
        values: [
          'Contribution',
          'Interest',
          'Withdrawal',
          'Transfer',
          'Adjustment',
          'Refund',
          'Expense Payment',
          'Advance'
        ],
        message: '{VALUE} is not a valid transaction type'
      },
      required: [true, 'Transaction type is required']
    },
    direction: {
      type: String,
      enum: {
        values: ['Credit', 'Debit'],
        message: '{VALUE} is not a valid direction'
      },
      required: [true, 'Direction (Credit/Debit) is required']
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be a positive number greater than zero']
    },
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: {
        values: [
          'Bank Transfer',
          'Cheque',
          'NEFT',
          'RTGS',
          'UPI',
          'Debit Card',
          'Credit Card',
          'Cash',
          'Internal Transfer'
        ],
        message: '{VALUE} is not a valid payment method'
      },
      required: [true, 'Payment method is required']
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    relatedExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    },
    supportingDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid transaction status'
      },
      default: 'Completed'
    },
    verificationFlags: [
      {
        rule: { type: String, trim: true },
        flaggedAt: { type: Date, default: Date.now },
        notes: { type: String, trim: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ society: 1, transactionDate: -1 });
transactionSchema.index({ society: 1, fund: 1, transactionDate: -1 });
transactionSchema.index({ society: 1, status: 1 });
transactionSchema.index({ society: 1, referenceNumber: 1 });
transactionSchema.index({ relatedExpense: 1 });
transactionSchema.index({ relatedEvent: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
