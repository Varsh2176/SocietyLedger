const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    role: {
      type: String,
      enum: {
        values: ['Resident', 'Treasurer', 'Committee Member', 'Auditor', 'Society Administrator'],
        message: '{VALUE} is not a supported role'
      },
      default: 'Resident',
      required: [true, 'User role is required']
    },
    unitDetails: {
      flatNumber: { type: String, trim: true },
      wing: { type: String, trim: true },
      ownershipType: {
        type: String,
        enum: ['Owner', 'Tenant', 'Non-Resident Owner', 'Office Bearer'],
        default: 'Owner'
      }
    },
    accountStatus: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Suspended', 'Pending'],
        message: '{VALUE} is not a valid account status'
      },
      default: 'Active'
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ society: 1, role: 1 });
userSchema.index({ society: 1, accountStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
